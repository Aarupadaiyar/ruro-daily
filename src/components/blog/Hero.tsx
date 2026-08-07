import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

export function Hero({ article }: { article: ArticleCardData }) {
  return (
    <section className="bg-dot-grid border-b border-border px-6 py-16 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div>
          <Badge variant="eyebrow">● Featured today</Badge>
          <h1 className="mt-6 text-display-lg text-white">
            {article.title}
          </h1>
          <p className="mt-5 max-w-lg text-lg text-gray-body">{article.summary}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-body">
            <Badge variant="lime">{article.category.name}</Badge>
            <span>{article.author?.name ?? article.source.name}</span>
            <span>·</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>·</span>
            <span>{article.readingTimeMins} min read</span>
          </div>

          <div className="mt-8">
            <Link href={`/intelligence/news/${article.slug}`}>
              <Button variant="primary">Read Article</Button>
            </Link>
          </div>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-border-dark bg-ink">
          {article.thumbnailUrl && (
            <Image src={article.thumbnailUrl} alt={article.title} fill className="object-cover opacity-90" />
          )}
          <span className="absolute bottom-4 right-4 rounded-pill border border-white/20 bg-black/40 px-3 py-1 text-xs uppercase tracking-wide text-white">
            {article.source.name}
          </span>
        </div>
      </div>
    </section>
  );
}
