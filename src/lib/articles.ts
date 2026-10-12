import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { categorySlugsForPillar, pillarOf, type PillarSlug } from "@/lib/categories";
import { usableThumbnail } from "@/lib/images";
import { gistFromContent, headlineFromContent, isJunkTitle, isUsefulSummary } from "@/lib/gist";
import { getActiveSourceBySlug } from "@/lib/scraper/sources";
import type { ArticleCardData } from "@/types";

export const ARTICLE_INCLUDE = {
  category: { select: { slug: true, name: true } },
  source:   { select: { slug: true, name: true } },
  author:   { select: { slug: true, name: true } },
} as const;

/**
 * Only the columns a card needs. Crucially this leaves out `content` (the full
 * article body, often 10–50 KB each): list pages pull hundreds of rows, and
 * shipping every body across the network was most of their load time.
 */
const CARD_SELECT = {
  id: true, slug: true, title: true, summary: true, thumbnailUrl: true,
  publishedAt: true, createdAt: true, readingTimeMins: true,
  popularityScore: true, importanceScore: true, sourceUrl: true, clusterId: true,
  ...ARTICLE_INCLUDE,
} as const;

/** Cache tag for every article list; revalidated after each scrape run. */
export const ARTICLES_TAG = "articles";

/** How long list results are shared between visitors before re-querying. */
const LIST_TTL_SECONDS = 300;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toCardData(a: any): ArticleCardData {
  return {
    id:              a.id,
    slug:            a.slug,
    title:           cleanTitle(a.title, a.source?.name),
    summary:         a.summary,
    thumbnailUrl:    usableThumbnail(a.thumbnailUrl),
    category:        a.category,
    pillar:          pillarOf(a.category.slug),
    source:          a.source,
    author:          a.author ?? null,
    publishedAt:     (a.publishedAt ?? a.createdAt).toISOString(),
    readingTimeMins: a.readingTimeMins,
    popularityScore: a.popularityScore,
    importanceScore: a.importanceScore,
    sourceUrl:       a.sourceUrl,
    clusterId:       a.clusterId ?? null,
    region:          getActiveSourceBySlug(a.source.slug)?.region ?? "GLOBAL",
  };
}

interface ListOptions {
  pillar?: PillarSlug;
  categorySlugs?: string[];
  /** Only articles published in the last N hours. */
  sinceHours?: number;
  /** Explicit published-at window (ISO strings), e.g. one day's edition. */
  from?: string;
  to?: string;
  orderBy?: "latest" | "importance";
  take?: number;
}

/**
 * The one query every public page goes through. Results are cached for a few
 * minutes and shared across visitors (pages still re-pick from these pools on
 * every request, so refreshes stay varied). Never throws: a DB hiccup logs and
 * returns [] so pages render their empty state instead of a 500.
 */
export function listArticles(opts: ListOptions = {}): Promise<ArticleCardData[]> {
  return cachedList(JSON.stringify(opts));
}

const cachedList = unstable_cache(
  async (key: string): Promise<ArticleCardData[]> => {
    const opts = JSON.parse(key) as ListOptions;
    const slugs = opts.categorySlugs ?? (opts.pillar ? categorySlugsForPillar(opts.pillar) : undefined);
    try {
      const rows = await db.article.findMany({
        where: {
          status: "PUBLISHED",
          ...(slugs ? { category: { slug: { in: slugs } } } : {}),
          ...(opts.sinceHours ? { publishedAt: { gte: new Date(Date.now() - opts.sinceHours * 3_600_000) } } : {}),
          ...(opts.from || opts.to
            ? { publishedAt: { ...(opts.from ? { gte: new Date(opts.from) } : {}), ...(opts.to ? { lt: new Date(opts.to) } : {}) } }
            : {}),
        },
        orderBy:
          opts.orderBy === "importance"
            ? [{ importanceScore: "desc" }, { publishedAt: "desc" }]
            : { publishedAt: "desc" },
        // Over-fetch: routine notices are filtered out below.
        take: Math.ceil((opts.take ?? 25) * 1.5),
        select: CARD_SELECT,
      });
      const take = opts.take ?? 25;
      const kept = await repairJunkTitles(rows.filter((r) => !isRoutineNotice(r.title, r.source.slug)));
      const cards = kept.map(toCardData);
      // One source can't flood a list (e.g. a regulator posting 11 notices at once).
      return diversifySources(cards, Math.max(2, Math.ceil(take / 8))).slice(0, take);
    } catch (err) {
      console.error("[listArticles] DB query failed:", err);
      return [];
    }
  },
  ["list-articles"],
  { revalidate: LIST_TTL_SECONDS, tags: [ARTICLES_TAG] }
);

/** clusterId → number of articles in that cluster (same story, many outlets). */
export async function clusterSizes(clusterIds: string[]): Promise<Map<string, number>> {
  const ids = [...new Set(clusterIds.filter(Boolean))].sort();
  if (ids.length === 0) return new Map();
  // Cached as entries: the cache stores JSON, and a Map doesn't serialise.
  return new Map(await cachedClusterSizes(ids));
}

const cachedClusterSizes = unstable_cache(
  async (ids: string[]): Promise<[string, number][]> => {
    try {
      const groups = await db.article.groupBy({
        by: ["clusterId"],
        where: { clusterId: { in: ids }, status: "PUBLISHED" },
        _count: { _all: true },
      });
      // +1: the cluster's root article carries no clusterId of its own.
      return groups.map((g) => [g.clusterId as string, g._count._all + 1]);
    } catch (err) {
      console.error("[clusterSizes] DB query failed:", err);
      return [];
    }
  },
  ["cluster-sizes"],
  { revalidate: LIST_TTL_SECONDS, tags: [ARTICLES_TAG] }
);

/**
 * Strip trailing publisher tags some feeds append to headlines,
 * e.g. "Apple buys X | TechCrunch" or "Markets slide - The Verge".
 */
export function cleanTitle(title: string, sourceName?: string): string {
  const cleaned = title.replace(/\s+[|–—-]\s+[^|–—-]{2,40}$/, (suffix) => {
    const tag = suffix.replace(/^\s+[|–—-]\s+/, "").toLowerCase();
    const brand = (sourceName ?? "").toLowerCase().split(/\s+/)[0] ?? "";
    // Only strip when the tag looks like the publisher, not part of the headline.
    return brand && tag.includes(brand) ? "" : /\|/.test(suffix) ? "" : suffix;
  });
  return cleaned.trim() || title;
}

/**
 * Keyword search over published articles. Every word must appear in the
 * title, summary, source or category; results are ranked by where the words
 * hit (title > summary) with a recency boost, so fresh, on-topic stories lead.
 */
export function searchArticles(query: string, opts: { pillar?: PillarSlug; take?: number } = {}): Promise<ArticleCardData[]> {
  return cachedSearch(query.trim().toLowerCase(), opts.pillar ?? null, opts.take ?? 30);
}

const cachedSearch = unstable_cache(
  (query: string, pillar: PillarSlug | null, take: number) => runSearch(query, { pillar: pillar ?? undefined, take }),
  ["search-articles"],
  { revalidate: 120, tags: [ARTICLES_TAG] }
);

async function runSearch(query: string, opts: { pillar?: PillarSlug; take?: number }): Promise<ArticleCardData[]> {
  const words = query.toLowerCase().split(/\s+/).map((w) => w.trim()).filter((w) => w.length >= 2).slice(0, 6);
  if (words.length === 0) return [];
  const take = opts.take ?? 30;

  try {
    const rows = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(opts.pillar ? { category: { slug: { in: categorySlugsForPillar(opts.pillar) } } } : {}),
        AND: words.map((w) => ({
          OR: [
            { title:    { contains: w, mode: "insensitive" as const } },
            { summary:  { contains: w, mode: "insensitive" as const } },
            { source:   { name: { contains: w, mode: "insensitive" as const } } },
            { category: { name: { contains: w, mode: "insensitive" as const } } },
          ],
        })),
      },
      orderBy: { publishedAt: "desc" },
      take: take * 3,
      select: CARD_SELECT,
    });

    const now = Date.now();
    const scored = rows.map((r) => {
      const title = r.title.toLowerCase();
      const summary = r.summary.toLowerCase();
      let score = 0;
      for (const w of words) {
        if (title.includes(w)) score += 3;
        else if (summary.includes(w)) score += 1;
      }
      if (title.includes(query.toLowerCase().trim())) score += 4; // exact phrase in headline
      const ageDays = (now - (r.publishedAt ?? r.createdAt).getTime()) / 86_400_000;
      score += Math.max(0, 3 - ageDays / 3); // up to +3 for the last ~9 days
      return { r, score };
    });

    return scored.sort((a, b) => b.score - a.score).slice(0, take).map((s) => toCardData(s.r));
  } catch (err) {
    console.error("[searchArticles] DB query failed:", err);
    return [];
  }
}

/**
 * Pick `n` items with a bias toward the front of an already-ranked list, so
 * every visit shows a different mix while important stories still surface
 * most often. Weight of item i is 1 / (i + 2).
 */
export function pickVaried<T>(ranked: T[], n: number): T[] {
  const pool = ranked.map((item, i) => ({ item, w: 1 / (i + 2) }));
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    const total = pool.reduce((s, p) => s + p.w, 0);
    let r = Math.random() * total;
    let idx = pool.findIndex((p) => (r -= p.w) <= 0);
    if (idx < 0) idx = pool.length - 1;
    out.push(pool.splice(idx, 1)[0]!.item);
  }
  return out;
}

/** Every article in one story cluster (root + followers), oldest first. */
export const getStoryTimeline = unstable_cache(
  async (clusterId: string): Promise<ArticleCardData[]> => {
    if (!/^[a-z0-9]{10,40}$/i.test(clusterId)) return [];
    try {
      const rows = await db.article.findMany({
        where: { status: "PUBLISHED", OR: [{ id: clusterId }, { clusterId }] },
        orderBy: { publishedAt: "asc" },
        take: 50,
        select: CARD_SELECT,
      });
      return rows.map(toCardData);
    } catch (err) {
      console.error("[getStoryTimeline] DB query failed:", err);
      return [];
    }
  },
  ["story-timeline"],
  { revalidate: LIST_TTL_SECONDS, tags: [ARTICLES_TAG] }
);

/** Routine regulator notices (case filings, auction results) — not news. */
function isRoutineNotice(title: string, sourceSlug: string): boolean {
  return getActiveSourceBySlug(sourceSlug)?.exclude?.test(title) ?? false;
}

/**
 * Re-order so no source appears more than `maxPerSource` times among the
 * leading items; the overflow keeps its order and moves to the end.
 */
export function diversifySources<T extends { source: { slug: string } }>(items: T[], maxPerSource: number): T[] {
  const counts = new Map<string, number>();
  const head: T[] = [];
  const overflow: T[] = [];
  for (const item of items) {
    const n = counts.get(item.source.slug) ?? 0;
    (n < maxPerSource ? head : overflow).push(item);
    counts.set(item.source.slug, n + 1);
  }
  return [...head, ...overflow];
}

/**
 * Some feeds (RBI) title every item with the site name. Recover the real
 * headline — and a real summary — from the body for just those rows; rows
 * with no recoverable headline are dropped.
 */
async function repairJunkTitles<T extends { id: string; title: string; summary: string }>(rows: T[]): Promise<T[]> {
  const junk = rows.filter((r) => isJunkTitle(r.title));
  if (junk.length === 0) return rows;
  const bodies = new Map(
    (await db.article.findMany({ where: { id: { in: junk.map((r) => r.id) } }, select: { id: true, content: true } })).map((r) => [r.id, r.content])
  );
  return rows.flatMap((r) => {
    if (!isJunkTitle(r.title)) return [r];
    const body = bodies.get(r.id) ?? "";
    const title = headlineFromContent(body);
    if (!title) return [];
    const summary = isUsefulSummary(r.summary, title) ? r.summary : gistFromContent(body, title) || r.summary;
    return [{ ...r, title, summary }];
  });
}
