import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import { clusterKey } from "@/lib/bites";
import type { Bite } from "@/types";

/** One bite: rank, headline, a 1–2 sentence summary and where it came from. */
export function BiteCard({ bite, compact = false }: { bite: Bite; compact?: boolean }) {
  const { article } = bite;
  return (
    <article className={cn("flex h-full flex-col rounded-card border border-border bg-paper", compact ? "p-5" : "p-6 sm:p-7")}>
      <div className="flex items-center gap-3">
        <span className="font-serif text-2xl font-semibold leading-none text-ink/25" aria-label={`Bite ${bite.rank}`}>
          {String(bite.rank).padStart(2, "0")}
        </span>
        <Badge variant={article.pillar}>{article.category.name}</Badge>
        {bite.coverage > 1 && (
          <Link
            href={`/story/${clusterKey(article)}`}
            className="text-xs text-gray-body underline decoration-border underline-offset-2 hover:text-ink"
            title="See every report on this story"
          >
            {bite.coverage} reports
          </Link>
        )}
      </div>

      <h3 className={cn("mt-4 font-serif font-semibold leading-snug text-ink", compact ? "text-lg line-clamp-3" : "text-xl sm:text-2xl")}>
        <Link href={`/news/${article.slug}`} className="hover:underline hover:decoration-ink/25 hover:underline-offset-4">
          {article.title}
        </Link>
      </h3>
      <p className={cn("mt-3 leading-relaxed text-ink/75", compact ? "line-clamp-3 text-sm" : "text-base")}>{bite.text}</p>
      {!compact && bite.why && (
        <p className="mt-3 border-l-2 border-brand/40 pl-3 text-sm leading-relaxed text-ink/70">
          <span className="font-semibold text-brand">Why it matters: </span>
          {bite.why}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs text-gray-body">
        <span className="truncate">
          {article.source.name} · <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
        </span>
        {!compact && (
          <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-1 hover:text-ink">
            Original <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        )}
      </div>
    </article>
  );
}
