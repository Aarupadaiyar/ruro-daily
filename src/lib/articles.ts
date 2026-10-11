import { db } from "@/lib/db";
import { categorySlugsForPillar, pillarOf, type PillarSlug } from "@/lib/categories";
import { usableThumbnail } from "@/lib/images";
import type { ArticleCardData } from "@/types";

export const ARTICLE_INCLUDE = {
  category: { select: { slug: true, name: true } },
  source:   { select: { slug: true, name: true } },
  author:   { select: { slug: true, name: true } },
} as const;

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
  };
}

interface ListOptions {
  pillar?: PillarSlug;
  categorySlugs?: string[];
  /** Only articles published in the last N hours. */
  sinceHours?: number;
  orderBy?: "latest" | "importance";
  take?: number;
}

/**
 * The one query every public page goes through. Never throws: a DB hiccup
 * logs and returns [] so pages render their empty state instead of a 500.
 */
export async function listArticles(opts: ListOptions = {}): Promise<ArticleCardData[]> {
  const slugs = opts.categorySlugs ?? (opts.pillar ? categorySlugsForPillar(opts.pillar) : undefined);
  try {
    const rows = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        ...(slugs ? { category: { slug: { in: slugs } } } : {}),
        ...(opts.sinceHours ? { publishedAt: { gte: new Date(Date.now() - opts.sinceHours * 3_600_000) } } : {}),
      },
      orderBy:
        opts.orderBy === "importance"
          ? [{ importanceScore: "desc" }, { publishedAt: "desc" }]
          : { publishedAt: "desc" },
      take: opts.take ?? 25,
      include: ARTICLE_INCLUDE,
    });
    return rows.map(toCardData);
  } catch (err) {
    console.error("[listArticles] DB query failed:", err);
    return [];
  }
}

/** clusterId → number of articles in that cluster (same story, many outlets). */
export async function clusterSizes(clusterIds: string[]): Promise<Map<string, number>> {
  const ids = [...new Set(clusterIds.filter(Boolean))];
  if (ids.length === 0) return new Map();
  try {
    const groups = await db.article.groupBy({
      by: ["clusterId"],
      where: { clusterId: { in: ids }, status: "PUBLISHED" },
      _count: { _all: true },
    });
    // +1: the cluster's root article carries no clusterId of its own.
    return new Map(groups.map((g) => [g.clusterId as string, g._count._all + 1]));
  } catch (err) {
    console.error("[clusterSizes] DB query failed:", err);
    return new Map();
  }
}

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
export async function searchArticles(query: string, opts: { pillar?: PillarSlug; take?: number } = {}): Promise<ArticleCardData[]> {
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
      include: ARTICLE_INCLUDE,
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
