import { clusterSizes, listArticles } from "@/lib/articles";
import type { PillarSlug } from "@/lib/categories";
import type { ArticleCardData, Bite } from "@/types";

/**
 * Bites = the day's top, main and most-covered stories, each condensed to one
 * or two sentences. Fully rule-based (no LLM):
 *
 *   score = importanceScore                       (0–100, set at scrape time)
 *         + 10 × (outlets covering the story − 1) (capped at +40 — "famous" news)
 *         + min(popularityScore, 20)              (reader engagement)
 *         + up to 15 for freshness                (linear over the window)
 *
 * Stories are deduped by cluster so one event never takes several slots.
 */
export async function getBites(opts: { pillar?: PillarSlug; take?: number; categorySlugs?: string[] } = {}): Promise<Bite[]> {
  const take = opts.take ?? 20;

  // One query over the past week, newest first; the freshness term below makes
  // the last 36h dominate, while quiet days still have enough to fill the feed.
  const pool = await listArticles({ pillar: opts.pillar, categorySlugs: opts.categorySlugs, sinceHours: 24 * 7, take: 160 });
  if (pool.length === 0) return [];

  const sizes = await clusterSizes(pool.map(clusterKey));
  const windowMs = 36 * 3_600_000;
  const now = Date.now();

  const best = new Map<string, { article: ArticleCardData; score: number; coverage: number }>();
  for (const article of pool) {
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

    const prev = best.get(key);
    if (!prev || score > prev.score) best.set(key, { article, score, coverage });
  }

  // Keep the feed varied: at most MAX_PER_SOURCE bites from any one publisher.
  const perSource = new Map<string, number>();
  const ranked = [...best.values()]
    .sort((a, b) => b.score - a.score)
    .filter((b) => {
      const n = perSource.get(b.article.source.slug) ?? 0;
      if (n >= MAX_PER_SOURCE) return false;
      perSource.set(b.article.source.slug, n + 1);
      return true;
    });

  return ranked
    .slice(0, take)
    .map((b, i) => ({ article: b.article, text: toBiteText(b.article.summary, b.article.title), coverage: b.coverage, rank: i + 1 }));
}

const MAX_PER_SOURCE = 2;

function clusterKey(a: ArticleCardData) {
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
  let text = summary.replace(/\s+/g, " ").trim();
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

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+(?=["“‘(]?[A-Z0-9₹$])/)
    .map((s) => s.trim())
    .filter(Boolean);
}
