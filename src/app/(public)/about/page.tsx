import type { Metadata } from "next";
import Link from "next/link";
import { SOURCES } from "@/lib/scraper/sources";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "How Ruro Daily picks stories",
  description: "Our promise: curated, short, finishable news with every source credited. No clickbait, no paywall.",
};

const PROMISES = [
  ["Finishable, not infinite", "One edition a day with about 10 stories. When you reach the end, you're done — no endless feed engineered to keep you scrolling."],
  ["Every source credited", `We read ${SOURCES.length} open feeds: newsrooms, regulators, research labs and independent writers. Every story links to the original publisher.`],
  ["Ranked by importance, not clicks", "A story rises when it is significant and when many independent outlets cover it — not because it is outrageous."],
  ["Why it matters, in one line", "Each top story comes with a plain sentence on why it matters to you."],
  ["No clickbait, no paywall", "Headlines are the publishers' own. Ruro Daily is free to read."],
  ["Plain English for money news", "Finance for Beginners removes jargon and explains what each story means for your wallet."],
] as const;

export default function AboutPage() {
  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-display-md text-ink">How {SITE.name} picks stories</h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-body">
          {SITE.name} is a calm daily briefing on AI, Tech and Finance. Here is what we promise every reader.
        </p>

        <dl className="mt-10 space-y-8">
          {PROMISES.map(([title, body]) => (
            <div key={title} className="border-l-2 border-brand/40 pl-5">
              <dt className="font-serif text-xl font-semibold text-ink">{title}</dt>
              <dd className="mt-1 leading-relaxed text-ink/75">{body}</dd>
            </div>
          ))}
        </dl>

        <h2 className="mt-14 font-serif text-2xl font-semibold text-ink">How ranking works</h2>
        <p className="mt-3 leading-relaxed text-ink/75">
          Every few hours we read all sources, drop duplicates, and group reports of the same event into one story. Each story is scored on
          how significant it is (official announcements, rate decisions, major launches), how many outlets cover it, and how fresh it is. We
          cap how many stories any one publisher or topic can take, so the edition stays balanced. Summaries are the first sentences of the
          publisher&apos;s own description; nothing is invented.
        </p>
        <p className="mt-6 text-sm text-gray-body">
          See the full list on <Link href="/sources" className="text-brand hover:underline">our sources page</Link>. Finance content is for
          general information only and is not investment advice.
        </p>
      </div>
    </main>
  );
}
