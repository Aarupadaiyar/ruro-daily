import { clusterSizes, listArticles } from "@/lib/articles";
import type { PillarSlug } from "@/lib/categories";
import type { Prefs } from "@/lib/prefs";
import { db } from "@/lib/db";
import { cleanSummary, gistFromContent, headlineFromContent, isJunkTitle, isUsefulSummary } from "@/lib/gist";
import { splitSentences } from "@/lib/text";
import { whyFor } from "@/lib/why";
import type { ArticleCardData, Bite } from "@/types";

/**
 * Bites = the day's top, main and most-covered stories, each condensed to one
 * or two sentences. Fully rule-based (no LLM):
 *
 *   score = importanceScore                       (0–100, set at scrape time)
 *         + 10 × (outlets covering the story − 1) (capped at +40 — "famous" news)
 *         + min(popularityScore, 20)              (reader engagement)
 *         + up to 15 for freshness                (linear over the window)
 *         ± region preference                     (+12 match, −8 other region)
 *
 * Stories are deduped by cluster so one event never takes several slots.
 */
export interface BiteOptions {
  pillar?: PillarSlug;
  categorySlugs?: string[];
  take?: number;
  /** Reader preferences: hide unselected pillars, boost their region. */
  prefs?: Prefs;
  /** Balance the list: at most this many bites per pillar. */
  maxPerPillar?: number;
}

export async function getBites(opts: BiteOptions = {}): Promise<Bite[]> {
  // One query over the past week, newest first; the freshness term makes the
  // last 36h dominate, while quiet days still have enough to fill the feed.
  const pool = await listArticles({ pillar: opts.pillar, categorySlugs: opts.categorySlugs, sinceHours: 24 * 7, take: 160 });
  return rankBites(pool, opts);
}

/** Rank an already-fetched pool of articles into bites. */
export async function rankBites(pool: ArticleCardData[], opts: BiteOptions = {}, now = Date.now()): Promise<Bite[]> {
  const take = opts.take ?? 20;
  const pillars = opts.prefs ? new Set(opts.prefs.pillars) : null;
  const region = opts.prefs?.region ?? "ALL";
  const candidates = pillars ? pool.filter((a) => pillars.has(a.pillar)) : pool;
  if (candidates.length === 0) return [];

  const sizes = await clusterSizes(candidates.map(clusterKey));
  const windowMs = 36 * 3_600_000;

  const best = new Map<string, { article: ArticleCardData; score: number; coverage: number }>();
  for (const article of candidates) {
    const key = clusterKey(article);
    const coverage = sizes.get(key) ?? 1;
    const ageMs = Math.max(0, now - new Date(article.publishedAt).getTime());
    const freshness = Math.max(0, 1 - ageMs / windowMs) * 15;
    let score =
      article.importanceScore +
      Math.min(40, 10 * (coverage - 1)) +
      Math.min(article.popularityScore, 20) +
      freshness;
    if (article.thumbnailUrl) score += 2; // tie-break toward stories with art
    if (region !== "ALL" && article.region !== "GLOBAL") score += article.region === region ? 12 : -8;

    const prev = best.get(key);
    if (!prev || score > prev.score) best.set(key, { article, score, coverage });
  }

  // Every bite must say something: repair junk titles/summaries from the
  // article body (one query for just those rows) and drop what can't be fixed.
  const sorted = await withRealGists([...best.values()].sort((a, b) => b.score - a.score).slice(0, take * 3));

  // Keep the feed varied: cap bites per publisher (and per pillar if asked).
  const perSource = new Map<string, number>();
  const perPillar = new Map<string, number>();
  const ranked = sorted
    .filter((b) => {
      const s = perSource.get(b.article.source.slug) ?? 0;
      const p = perPillar.get(b.article.pillar) ?? 0;
      if (s >= MAX_PER_SOURCE || (opts.maxPerPillar && p >= opts.maxPerPillar)) return false;
      perSource.set(b.article.source.slug, s + 1);
      perPillar.set(b.article.pillar, p + 1);
      return true;
    });

  return ranked.slice(0, take).map((b, i) => ({
    article: b.article,
    text: b.gist,
    coverage: b.coverage,
    rank: i + 1,
    why: whyFor(b.article),
  }));
}

const MAX_PER_SOURCE = 2;

type Ranked = { article: ArticleCardData; score: number; coverage: number };

async function withRealGists(items: Ranked[]): Promise<(Ranked & { gist: string })[]> {
  const needsBody = items.filter((b) => isJunkTitle(b.article.title) || !isUsefulSummary(b.article.summary, b.article.title));
  const bodies = new Map<string, string>();
  if (needsBody.length) {
    try {
      const rows = await db.article.findMany({ where: { id: { in: needsBody.map((b) => b.article.id) } }, select: { id: true, content: true } });
      for (const r of rows) bodies.set(r.id, r.content);
    } catch (err) {
      console.error("[bites] body lookup failed:", err);
    }
  }

  const out: (Ranked & { gist: string })[] = [];
  for (const b of items) {
    const body = bodies.get(b.article.id);
    let article = b.article;
    if (body && isJunkTitle(article.title)) {
      const headline = headlineFromContent(body);
      if (!headline) continue; // no real headline — not worth a slot
      article = { ...article, title: headline };
    }
    const gist = isUsefulSummary(article.summary, article.title)
      ? toBiteText(article.summary, article.title)
      : body
        ? gistFromContent(body, article.title)
        : "";
    if (gist) out.push({ ...b, article, gist });
  }
  return out;
}

export function clusterKey(a: Pick<ArticleCardData, "id" | "clusterId">) {
  return a.clusterId ?? a.id;
}

// Feed boilerplate that adds nothing to a bite.
const BOILERPLATE = [
  /The post .+? appeared first on .+?\.?$/i,
  /\b(Continue reading|Read more|Read the full story)\b.*$/i,
  /\[(…|\.\.\.)\]\s*$/,
  /\s*Comments?$/i,
];

const MAX_BITE_CHARS = 240;

/** Condense a summary into 1–2 complete sentences (≤ ~240 chars). */
export function toBiteText(summary: string, title = ""): string {
  let text = cleanSummary(summary);
  for (const re of BOILERPLATE) text = text.replace(re, "").trim();
  if (!text || text.toLowerCase() === title.toLowerCase()) return title;

  const sentences = splitSentences(text);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > MAX_BITE_CHARS && out) break;
    out = next;
    if (out.length > MAX_BITE_CHARS * 0.6) break; // two short sentences is plenty
  }
  if (out.length > MAX_BITE_CHARS + 20) {
    out = out.slice(0, MAX_BITE_CHARS).replace(/\s+\S*$/, "") + "…";
  }
  return out;
}

export { splitSentences };
