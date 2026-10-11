import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { getCategory, PILLARS } from "@/lib/categories";
import { listArticles } from "@/lib/articles";

// force-dynamic: category pages query the DB at render time, never during
// `next build` (where the database is unreachable).
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const meta = getCategory((await params).category);
  return meta ? { title: meta.name, description: meta.description } : {};
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = getCategory(category);
  if (!meta) notFound();

  const articles = await listArticles({ categorySlugs: [category], take: 60 });
  const pillar = PILLARS.find((p) => p.slug === meta.pillar)!;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">{pillar.name}</p>
      <h1 className="mt-2 font-serif text-display-md text-ink">{meta.name}</h1>
      <p className="mt-2 text-gray-body">{meta.description}</p>

      <div className="my-8">
        <CategoryFilter activeSlug={category} pillar={meta.pillar} allHref={meta.pillar === "finance" ? "/finance" : `/${meta.pillar}`} />
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-body">No stories in this category yet. Check back after the next update.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </main>
  );
}
