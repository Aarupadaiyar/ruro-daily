import { notFound } from "next/navigation";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { CATEGORIES } from "@/lib/categories";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { db } from "@/lib/db";
import type { ArticleCardData } from "@/types";

// force-dynamic: category pages query the DB at render time.
// Removing generateStaticParams (SSG) prevents Next.js from trying to
// prerender all 14 category pages during `next build` — where the database
// is unreachable — which caused PrismaClientInitializationError.
// Pages are now rendered on-demand, keeping slug validation via notFound().
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

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const meta = CATEGORIES.find((c) => c.slug === category);
  if (!meta) notFound();

  let articlesRaw: any[] = [];
  try {
    articlesRaw = await db.article.findMany({
      where: {
        status: "PUBLISHED",
        category: { slug: category },
      },
      orderBy: { publishedAt: "desc" },
      include: ARTICLE_INCLUDE,
    });
  } catch (err) {
    console.error(`[category/${category}] DB query failed:`, err);
  }

  const articles = articlesRaw.map(toCardData);

  return (
    <main className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <h1 className="text-display-sm text-white">{meta.name}</h1>
      <p className="mt-2 text-gray-body">Everything Trafy Intelligence has tracked in {meta.name}.</p>

      <div className="my-8">
        <CategoryFilter activeSlug={category} />
      </div>

      {articles.length === 0 ? (
        <p className="text-gray-body">No articles in this category yet. Check back after the next scrape run.</p>
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
