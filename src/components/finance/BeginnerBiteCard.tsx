import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import type { BeginnerBite } from "@/types";

/** A finance story in plain English, with a "what this means for you" note and jargon explained. */
export function BeginnerBiteCard({ bite }: { bite: BeginnerBite }) {
  const { article } = bite;
  return (
    <article className="flex h-full flex-col rounded-card border border-border bg-paper p-6">
      <p className="text-xs text-gray-body">
        <span className="font-semibold text-pillar-finance">{article.category.name}</span> · {article.source.name} ·{" "}
        <time dateTime={article.publishedAt}>{timeAgo(article.publishedAt)}</time>
      </p>
      <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-ink">
        <Link href={`/news/${article.slug}`} className="hover:underline hover:decoration-ink/25 hover:underline-offset-4">
          {article.title}
        </Link>
      </h3>

      <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/80">
        <span className="font-semibold text-ink">In simple words: </span>
        {bite.plainText}
      </p>

      {bite.whyItMatters && (
        <div className="mt-4 flex gap-3 rounded-card-sm bg-brand-tint p-4">
          <Lightbulb size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-ink/85">
            <span className="font-semibold text-brand">What this means for you: </span>
            {bite.whyItMatters}
          </p>
        </div>
      )}

      {bite.terms.length > 0 && (
        <dl className="mt-4 space-y-2 border-t border-border pt-4">
          {bite.terms.map((t) => (
            <div key={t.term} className="text-sm leading-relaxed">
              <dt className="inline font-semibold text-ink">{t.term}: </dt>
              <dd className="inline text-gray-body">{t.meaning}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
}
