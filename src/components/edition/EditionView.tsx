import Link from "next/link";
import { BiteCard } from "@/components/bites/BiteCard";
import { BeginnerBiteCard } from "@/components/finance/BeginnerBiteCard";
import { EditionReader } from "@/components/edition/EditionReader";
import { FollowLinks } from "@/components/edition/FollowLinks";
import { PrefsPanel } from "@/components/prefs/PrefsPanel";
import { formatEditionDate, recentEditionDates, type Edition } from "@/lib/edition";
import { isDefaultPrefs, type Prefs } from "@/lib/prefs";
import { buildPodcastScript } from "@/lib/podcast";

export function EditionView({ edition, prefs }: { edition: Edition; prefs: Prefs }) {
  const { bites, explainer } = edition;
  const segments = buildPodcastScript(edition);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">{edition.isToday ? "Today's edition" : "Edition archive"}</p>
            <h1 className="mt-2 font-serif text-display-md text-ink">{formatEditionDate(edition.date)}</h1>
            <p className="mt-2 text-gray-body">
              {bites.length} stories that matter, each in a sentence or two. About 5 minutes.
              {!isDefaultPrefs(prefs) && " Personalised to your topics."}
            </p>
          </div>
          <PrefsPanel initial={prefs} />
        </header>

        <div className="mt-8">
          {bites.length === 0 ? (
            <p className="text-gray-body">No stories in this edition yet. Check back soon.</p>
          ) : (
            <EditionReader
              date={edition.date}
              total={bites.length + (explainer ? 1 : 0)}
              segments={segments}
              doneCard={
                <>
                  <p className="mt-6 text-sm text-ink/75">Get tomorrow&apos;s edition first thing in the morning:</p>
                  <FollowLinks source="edition-done" />
                  <p className="mt-6 text-sm">
                    <Link href="/finance/beginners/quiz" className="font-medium text-brand hover:underline">Take this week&apos;s 5-question money quiz →</Link>
                  </p>
                </>
              }
            >
              <ol className="space-y-4">
                {bites.map((bite, i) => (
                  <li key={bite.article.id} data-bite-index={i}>
                    <BiteCard bite={bite} />
                  </li>
                ))}
                {explainer && (
                  <li data-bite-index={bites.length}>
                    <p className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-pillar-finance">Money, simply explained</p>
                    <BeginnerBiteCard bite={explainer} />
                  </li>
                )}
              </ol>
            </EditionReader>
          )}
        </div>

        <nav aria-label="Past editions" className="mt-14 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">Past editions</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {recentEditionDates(14).map((d, i) => (
              <li key={d}>
                <Link
                  href={i === 0 ? "/edition" : `/edition/${d}`}
                  aria-current={d === edition.date ? "page" : undefined}
                  className={
                    d === edition.date
                      ? "rounded-pill border border-ink bg-ink px-3 py-1 text-sm text-cream"
                      : "rounded-pill border border-border bg-paper px-3 py-1 text-sm text-gray-body hover:text-ink"
                  }
                >
                  {i === 0 ? "Today" : new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${d}T00:00:00Z`))}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </main>
  );
}
