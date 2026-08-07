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
import type { ArticleCardData } from "@/types";

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await db.article.findUnique({
    where: { slug, status: "PUBLISHED" },
  });
  if (!article) return {};

  return {
    title: `${article.title}: Trafy Intelligence`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: (article.publishedAt ?? article.createdAt).toISOString(),
      images: article.thumbnailUrl ? [article.thumbnailUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.summary,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://trafy.ai"}/intelligence/news/${article.slug}`,
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
  const article = await db.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: ARTICLE_INCLUDE,
  });
  
  if (!article) notFound();

  const headings = extractHeadings(article.content);
  
  const relatedRaw = await db.article.findMany({
    where: {
      categoryId: article.categoryId,
      id: { not: article.id },
      status: "PUBLISHED",
    },
    orderBy: { publishedAt: "desc" },
    take: 3,
    include: ARTICLE_INCLUDE,
  });

  const related = relatedRaw.map(toCardData);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.summary,
    datePublished: (article.publishedAt ?? article.createdAt).toISOString(),
    author: article.author ? { "@type": "Person", name: article.author.name } : undefined,
    publisher: { "@type": "Organization", name: "Trafy Intelligence" },
  };

  return (
    <main>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="border-b border-border bg-dot-grid px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-3xl">
          <Badge variant="lime">{article.category.name}</Badge>
          <h1 className="mt-5 text-display-md text-white">{article.title}</h1>
          <p className="mt-4 text-lg text-gray-body">{article.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-body">
            <span className="font-medium text-white">{article.author?.name ?? article.source.name}</span>
            <span>·</span>
            <span>{formatDate(article.publishedAt ?? article.createdAt)}</span>
            <span>·</span>
            <span>{article.readingTimeMins} min read</span>
            <span>·</span>
            <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white font-medium">Original source ↗</a>
          </div>
        </div>
      </header>

      {article.thumbnailUrl && (
        <div className="relative mx-auto -mt-8 aspect-[21/9] max-w-5xl overflow-hidden rounded-card border border-border">
          <Image src={article.thumbnailUrl} alt={article.title} fill className="object-cover" />
        </div>
      )}

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-14 lg:grid-cols-[1fr_220px] lg:px-10">
        <article className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-ink prose-a:underline">
          <MDXRemote source={article.content} />
        </article>
        <TableOfContents headings={headings} />
      </div>

      {related.length > 0 && (
        <section className="border-t border-border bg-cream-dim px-6 py-14 lg:px-10">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-6 text-display-sm text-white">Related</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {related.map((r) => (
                <ArticleCard key={r.id} article={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-10 text-sm lg:px-10">
        <Link href="/intelligence" className="text-gray-body hover:text-white">← Back to all news</Link>
      </nav>
    </main>
  );
}
