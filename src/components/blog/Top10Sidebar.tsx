import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { ArticleCardData } from "@/types";

export function Top10Sidebar({ articles }: { articles: ArticleCardData[] }) {
  return (
    <Card className="sticky top-24 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Top 10 Today</p>
      <ol className="mt-4 space-y-4">
        {articles.slice(0, 10).map((article, i) => (
          <li key={article.id}>
            <Link href={`/intelligence/news/${article.slug}`} className="group flex gap-3">
              <span className="w-5 shrink-0 text-sm font-bold text-lime-dim group-hover:text-lime" style={{ WebkitTextStroke: "1px #14123A" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-sm leading-snug text-ink group-hover:underline">{article.title}</span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
