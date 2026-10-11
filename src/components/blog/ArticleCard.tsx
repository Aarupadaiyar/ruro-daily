import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ArticleCover } from "@/components/blog/ArticleCover";
import { timeAgo } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

export function ArticleCard({ article, showImage = true }: { article: ArticleCardData; showImage?: boolean }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-border bg-paper transition-shadow hover:shadow-soft-lg">
      {showImage && (
        <Link href={`/news/${article.slug}`} className="relative block aspect-[16/9] overflow-hidden bg-cream-dim" tabIndex={-1} aria-hidden="true">
          {article.thumbnailUrl ? (
            <Image src={article.thumbnailUrl} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          ) : (
            <ArticleCover id={article.id} pillar={article.pillar} categorySlug={article.category.slug} sourceSlug={article.source.slug} sourceName={article.source.name} />
          )}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div>
          <Badge variant={article.pillar}>{article.category.name}</Badge>
        </div>
        <Link href={`/news/${article.slug}`} className="mt-3">
          <h3 className="font-serif text-lg font-semibold leading-snug text-ink group-hover:underline group-hover:decoration-ink/30 group-hover:underline-offset-4">
            {article.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-body">{article.summary}</p>
        <p className="mt-auto pt-4 text-xs text-gray-body">
          {article.source.name} · <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time> · {article.readingTimeMins} min
        </p>
      </div>
    </article>
  );
}
