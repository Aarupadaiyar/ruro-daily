import { db } from "@/lib/db";
import { Hero } from "@/components/blog/Hero";
import { HotNewsTicker } from "@/components/blog/HotNewsTicker";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Top10Sidebar } from "@/components/blog/Top10Sidebar";
import { Newsletter } from "@/components/blog/Newsletter";
import type { ArticleCardData } from "@/types";

// force-dynamic: render on every request so the build never tries to call
// the database during `next build` (where DB connections are unreliable).
// The page already refreshes from the DB on each visit, so there is no
// caching benefit lost compared to a short revalidate window.
export const dynamic = "force-dynamic";

const ARTICLE_INCLUDE = {
  category: { select: { slug: true, name: true } },
  source:   { select: { slug: true, name: true } },
  author:   { select: { slug: true, name: true } },
} as const;

function toCardData(a: any): ArticleCardData {
  return {
    id:             a.id,
    slug:           a.slug,
    title:          a.title,
    summary:        a.summary,
    thumbnailUrl:   a.thumbnailUrl ?? null,
    category:       a.category,
    source:         a.source,
    author:         a.author ?? null,
    publishedAt:    (a.publishedAt ?? a.createdAt).toISOString(),
    readingTimeMins: a.readingTimeMins,
    popularityScore: a.popularityScore,
  };
}

export default async function NewsHomePage() {
  // ── query published articles from real DB ──────────────────────────────
  let latestRaw: any[] = [];
  let top10Raw: any[] = [];
  try {
    [latestRaw, top10Raw] = await Promise.all([
      db.article.findMany({
        where:   { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take:    25,
        include: ARTICLE_INCLUDE,
      }),
      db.article.findMany({
        where:   { status: "PUBLISHED" },
        orderBy: { importanceScore: "desc" },
        take:    10,
        include: ARTICLE_INCLUDE,
      }),
    ]);
  } catch (err) {
    console.error("[intelligence/page] DB query failed:", err);
  }

  const latest = latestRaw.map(toCardData);
  const top10  = top10Raw.map(toCardData);

  // First article in the list becomes the Hero
  const [featured, ...rest] = latest;

  // No articles yet — show a clear message instead of crashing or falling back to mock data
  if (!featured) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="text-2xl font-bold text-white">No articles yet</h1>
        <p className="text-gray-body max-w-md">
          Run <code className="font-mono bg-cream-dim px-1 rounded">npm run scrape:manual</code> to
          pull real articles from live sources, then reload this page.
        </p>
      </main>
    );
  }

  return (
    <main>
      <Hero article={featured} />

      {rest.length > 0 && (
        <HotNewsTicker items={rest.slice(0, 8).map((a) => ({ slug: a.slug, title: a.title }))} />
      )}

      <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
        <div className="mb-8">
          <CategoryFilter />
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          {/* ── Article grid ─────────────────────────────────────────── */}
          <div>
            <h2 className="mb-6 text-display-sm text-white">Latest News</h2>
            {rest.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {rest.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-gray-body">Only one article so far. Run the scraper again to populate more.</p>
            )}
          </div>

          {/* ── Sidebar ──────────────────────────────────────────────── */}
          <aside className="space-y-6">
            {top10.length > 0 && <Top10Sidebar articles={top10} />}
            <Newsletter source="sidebar" />
          </aside>
        </div>
      </section>
    </main>
  );
}
