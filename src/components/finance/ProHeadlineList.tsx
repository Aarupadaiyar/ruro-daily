import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

/**
 * Dense, scannable headline list for professionals: time, desk, headline,
 * source. No images — information density over decoration.
 */
export function ProHeadlineList({ title, articles, moreHref }: { title: string; articles: ArticleCardData[]; moreHref?: string }) {
  if (articles.length === 0) return null;
  return (
    <section className="rounded-card border border-border bg-paper">
      <header className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">{title}</h2>
        {moreHref && (
          <Link href={moreHref} className="text-xs text-brand hover:underline">More →</Link>
        )}
      </header>
      <ul className="divide-y divide-border">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/news/${a.slug}`} className="group grid grid-cols-[3.25rem_1fr] gap-3 px-5 py-3 hover:bg-cream">
              <time dateTime={a.publishedAt} className="pt-0.5 text-xs tabular-nums text-gray-body">{timeAgo(a.publishedAt).replace(" ago", "")}</time>
              <div className="min-w-0">
                <p className="text-[0.95rem] font-medium leading-snug text-ink group-hover:underline">{a.title}</p>
                <p className="mt-1 text-xs text-gray-body">
                  <span className="text-pillar-finance">{a.category.name}</span> · {a.source.name}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
