import Link from "next/link";
import { Hero } from "@/components/blog/Hero";
import { HotNewsTicker } from "@/components/blog/HotNewsTicker";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { Top10Sidebar } from "@/components/blog/Top10Sidebar";
import { Newsletter } from "@/components/blog/Newsletter";
import { BitesStrip } from "@/components/bites/BitesStrip";
import { ProHeadlineList } from "@/components/finance/ProHeadlineList";
import { diversifySources, listArticles, pickVaried } from "@/lib/articles";
import { getBites } from "@/lib/bites";
import { timeAgo } from "@/lib/utils";
import { getPrefs } from "@/lib/prefs-server";
import { PrefsPanel } from "@/components/prefs/PrefsPanel";

// force-dynamic: render on every request so the build never tries to call
// the database during `next build` (where DB connections are unreliable).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const prefs = await getPrefs();
  // Fetch deeper pools than we show, then sample from them per request so
  // every refresh surfaces a different mix of today's important stories.
  const [latest, top10, bitePool, aiPool, techPool, financePool] = await Promise.all([
    listArticles({ take: 40 }),
    listArticles({ orderBy: "importance", sinceHours: 48, take: 10 }),
    getBites({ take: 24, prefs }),
    listArticles({ pillar: "ai", orderBy: "importance", sinceHours: 168, take: 16 }),
    listArticles({ pillar: "tech", orderBy: "importance", sinceHours: 168, take: 16 }),
    listArticles({ pillar: "finance", orderBy: "importance", sinceHours: 168, take: 16 }),
  ]);

  // Lead: one of the top six bites (most important + most covered).
  const [leadBite] = pickVaried(bitePool.slice(0, 6), 1);
  const lead = leadBite?.article ?? latest[0];

  if (!lead) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-2xl font-semibold text-ink">Today&apos;s edition is on its way</h1>
        <p className="max-w-md text-gray-body">
          We&apos;re gathering the latest stories. Please check back in a few minutes.
        </p>
        {/* Setup hint for developers only — readers never see this. */}
        {process.env.NODE_ENV === "development" && (
          <p className="max-w-md text-sm text-gray-body">
            Dev: check DATABASE_URL, then run <code className="rounded bg-cream-dim px-1 font-mono">npm run scrape:manual</code>.
          </p>
        )}
      </main>
    );
  }

  const otherBites = bitePool.filter((b) => b.article.id !== lead.id);
  // Keep the top of the page balanced: at most two of the five lead slots
  // from any one pillar, so a busy market day doesn't crowd out AI and Tech.
  const perPillar = new Map([[lead.pillar, 1]]);
  const secondary = pickVaried(otherBites, otherBites.length)
    .filter((b) => {
      const n = perPillar.get(b.article.pillar) ?? 0;
      if (n >= 2) return false;
      perPillar.set(b.article.pillar, n + 1);
      return true;
    })
    .slice(0, 4)
    .map((b) => b.article);
  const shownIds = new Set([lead.id, ...secondary.map((a) => a.id)]);
  const unseen = <T extends { id: string }>(items: T[]) => items.filter((a) => !shownIds.has(a.id));

  const bites = pickVaried(otherBites.filter((b) => !shownIds.has(b.article.id)), 10)
    .sort((a, b) => a.rank - b.rank)
    .map((b, i) => ({ ...b, rank: i + 1 }));
  const ai = pickVaried(unseen(aiPool), 4);
  const tech = pickVaried(unseen(techPool), 4);
  const finance = pickVaried(unseen(financePool), 8);
  [...ai, ...tech].forEach((a) => shownIds.add(a.id));
  // Latest stays strictly newest-first — that's what "fresh" means to readers.
  const rest = diversifySources(unseen(latest), 2);

  return (
    <main>
      <Hero article={lead} secondary={secondary} />

      <section className="border-b border-border bg-brand-tint px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink">
            <span className="font-semibold">Short on time?</span> Today&apos;s edition: the 10 stories that matter, in about 5 minutes.
          </p>
          <div className="flex items-center gap-3">
            <PrefsPanel initial={prefs} />
            <Link href="/edition" className="rounded-pill bg-brand px-4 py-1.5 text-sm font-semibold text-brand-fg hover:bg-brand-dim">
              Read today&apos;s edition →
            </Link>
          </div>
        </div>
      </section>

      {rest.length > 0 && <HotNewsTicker items={rest.slice(0, 10).map((a) => ({ slug: a.slug, title: a.title }))} />}

      <BitesStrip bites={bites} />

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          <div className="space-y-12">
            <PillarSection title="AI" href="/ai" articles={ai} />
            <PillarSection title="Tech" href="/tech" articles={tech} />

            <div>
              <SectionHeading title="Finance" href="/finance" />
              <div className="grid gap-6 md:grid-cols-2">
                <ProHeadlineList title="Finance Pro: top of the desk" articles={finance} moreHref="/finance" />
                <Link
                  href="/finance/beginners"
                  className="group flex flex-col justify-between rounded-card border border-border bg-brand-tint p-6"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">New to money news?</p>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-ink">Finance for Beginners</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink/75">
                      Today&apos;s top finance stories in plain English, what each one means for your wallet, and one-minute lessons on the basics.
                    </p>
                  </div>
                  <span className="mt-6 text-sm font-medium text-brand group-hover:underline">Start reading →</span>
                </Link>
              </div>
            </div>

            <div>
              <SectionHeading title="Latest" note={rest[0] ? `Newest first · last story ${timeAgo(rest[0].publishedAt)}` : undefined} />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {rest.slice(0, 10).map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {top10.length > 0 && <Top10Sidebar articles={top10} />}
            <Newsletter source="sidebar" />
          </aside>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ title, href, note }: { title: string; href?: string; note?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-ink pb-2">
      <h2 className="font-serif text-2xl font-semibold text-ink">{title}</h2>
      {note && <span className="text-xs text-gray-body">{note}</span>}
      {href && <Link href={href} className="text-sm text-brand hover:underline">See all →</Link>}
    </div>
  );
}

function PillarSection({ title, href, articles }: { title: string; href: string; articles: Awaited<ReturnType<typeof listArticles>> }) {
  if (articles.length === 0) return null;
  return (
    <div>
      <SectionHeading title={title} href={href} />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
