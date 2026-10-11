import Link from "next/link";
import type { ArticleCardData } from "@/types";

export function Top10Sidebar({ articles, title = "Most important today" }: { articles: ArticleCardData[]; title?: string }) {
  return (
    <div className="rounded-card border border-border bg-paper p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">{title}</p>
      <ol className="mt-4 space-y-4">
        {articles.slice(0, 10).map((article, i) => (
          <li key={article.id}>
            <Link href={`/news/${article.slug}`} className="group flex gap-3">
              <span className="w-6 shrink-0 font-serif text-lg font-semibold leading-tight text-ink/30 group-hover:text-brand">
                {i + 1}
              </span>
              <span className="text-sm leading-snug text-ink group-hover:underline">{article.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
