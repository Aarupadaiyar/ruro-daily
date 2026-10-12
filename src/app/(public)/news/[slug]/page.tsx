import { SITE } from "@/lib/site";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { Badge } from "@/components/ui/badge";
import { TableOfContents, type TocHeading } from "@/components/blog/TableOfContents";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { formatDate } from "@/lib/utils";
import { db } from "@/lib/db";
import { cache } from "react";
import { ARTICLE_INCLUDE, listArticles } from "@/lib/articles";
import { pillarOf } from "@/lib/categories";
import { usableThumbnail } from "@/lib/images";

// Deduped per request: generateMetadata and the page share one DB round trip.
const getArticle = cache((slug: string) =>
  db.article.findUnique({ where: { slug, status: "PUBLISHED" }, include: ARTICLE_INCLUDE })
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: (article.publishedAt ?? article.createdAt).toISOString(),
      images: usableThumbnail(article.thumbnailUrl) ? [article.thumbnailUrl!] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
    alternates: {
      canonical: `${SITE.url}/news/${article.slug}`,
    },
  };
}

function extractHeadings(mdx: string): TocHeading[] {
  const matches = [...mdx.matchAll(/^(##{1,2})\s+(.+)$/gm)];
  return matches.map((m) => {
    const text = m[2] || "";
    return {
      depth: m[1] ? m[1].length : 2,
      text,
      id: text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    };
  });
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const headings = extractHeadings(article.content);
  
  // Cached list query (no article bodies) instead of a fresh findMany per view.
  const related = (await listArticles({ categorySlugs: [article.category.slug], take: 4 }))
    .filter((a) => a.id !== article.id)
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: (article.publishedAt ?? article.createdAt).toISOString(),
    author: article.author ? { "@type": "Person", name: article.author.name } : undefined,
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };

  return (
    <main>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="px-4 pb-8 pt-12 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Badge variant={pillarOf(article.category.slug)}>{article.category.name}</Badge>
          <h1 className="mt-5 font-serif text-display-md text-ink">{article.title}</h1>
          <p className="mt-4 font-serif text-xl leading-relaxed text-gray-body">{article.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border py-3 text-sm text-gray-body">
            <span className="font-medium text-ink">{article.author?.name ?? article.source.name}</span>
            <span>·</span>
            <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
            <span>·</span>
            <span>{article.readingTimeMins} min read</span>
            <span>·</span>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">Read at {article.source.name} ↗</a>
          </div>
        </div>
      </header>

      {usableThumbnail(article.thumbnailUrl) && (
        <div className="relative mx-auto aspect-[16/9] max-w-4xl overflow-hidden rounded-card bg-cream-dim">
          <Image src={article.thumbnailUrl!} alt="" fill priority className="object-cover" />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,68ch)_220px] lg:justify-center lg:px-10">
        <article className="article-body">
          <MDXRemote source={article.content} />
        </article>
        <TableOfContents headings={headings} />
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-cream-dim px-4 py-12 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 font-serif text-display-sm text-ink">More on {article.category.name}</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-10 text-sm sm:px-6 lg:px-10">
        <Link href="/" className="text-gray-body hover:text-ink">← Back to today&apos;s edition</Link>
      </nav>
    </main>
  );
}
