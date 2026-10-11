import type { Metadata } from "next";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { SearchBar } from "@/components/blog/SearchBar";
import { PillarTabs } from "@/components/bites/PillarTabs";
import { searchArticles } from "@/lib/articles";
import { PILLARS, type PillarSlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; pillar?: string }> }) {
  const { q = "", pillar: rawPillar } = await searchParams;
  const query = q.trim();
  const pillar = PILLARS.find((p) => p.slug === rawPillar)?.slug as PillarSlug | undefined;
  const results = query.length >= 2 ? await searchArticles(query, { pillar, take: 48 }) : [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="font-serif text-display-md text-ink">Search</h1>
      <div className="mt-6 max-w-2xl">
        {/* key resets the input when the query in the URL changes */}
        <SearchBar key={query} defaultValue={query} autoFocus={!query} />
      </div>

      {query.length >= 2 && (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-gray-body" aria-live="polite">
              {results.length === 0 ? "No stories found" : `${results.length}${results.length === 48 ? "+" : ""} stories`} for{" "}
              <span className="font-medium text-ink">“{query}”</span>
            </p>
            <PillarTabs basePath={`/search?q=${encodeURIComponent(query)}`} active={pillar} paramJoin="&" />
          </div>

          {results.length === 0 ? (
            <p className="mt-10 text-gray-body">Try fewer or different words, or search a company, person or topic like “RBI”, “Nvidia” or “inflation”.</p>
          ) : (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
