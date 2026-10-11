import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArticleCover } from "@/components/blog/ArticleCover";
import { formatDate } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

/** The lead story, plus a column of the next few headlines beside it. */
export function Hero({ article, secondary = [] }: { article: ArticleCardData; secondary?: ArticleCardData[] }) {
  return (
    <section className="border-b border-border px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.6fr_1fr]">
        <Link href={`/news/${article.slug}`} className="group grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-cream-dim">
            {article.thumbnailUrl ? (
              <Image src={article.thumbnailUrl} alt="" fill priority className="object-cover" />
            ) : (
              <ArticleCover id={article.id} pillar={article.pillar} categorySlug={article.category.slug} sourceSlug={article.source.slug} sourceName={article.source.name} size="lg" />
            )}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Lead story</p>
            <h1 className="mt-3 font-serif text-display-md text-ink group-hover:underline group-hover:decoration-ink/25 group-hover:underline-offset-[6px]">
              {article.title}
            </h1>
            <p className="mt-4 line-clamp-4 text-base leading-relaxed text-gray-body">{article.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-body">
              <Badge variant={article.pillar}>{article.category.name}</Badge>
              <span>{article.source.name}</span>
              <span aria-hidden>·</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
        </Link>

        {secondary.length > 0 && (
          <div className="border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">Also leading</p>
            <ul className="mt-3 divide-y divide-border">
              {secondary.map((a) => (
                <li key={a.id}>
                  <Link href={`/news/${a.slug}`} className="group block py-4">
                    <Badge variant={a.pillar}>{a.category.name}</Badge>
                    <h2 className="mt-2 font-serif text-lg font-semibold leading-snug text-ink group-hover:underline group-hover:decoration-ink/25 group-hover:underline-offset-4">
                      {a.title}
                    </h2>
                    <p className="mt-1 text-xs text-gray-body">{a.source.name}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
