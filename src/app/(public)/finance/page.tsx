import type { Metadata } from "next";
import Link from "next/link";
import { BiteCard } from "@/components/bites/BiteCard";
import { ProHeadlineList } from "@/components/finance/ProHeadlineList";
import { listArticles } from "@/lib/articles";
import { getBites } from "@/lib/bites";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finance Pro: the top markets, economy and policy news",
  description: "A dense finance desk for professionals: the most important markets, economy, central-bank and business stories from WSJ, FT, CNBC, ET, Mint, the RBI, the Fed and more.",
};

const DESKS = [
  { title: "Markets",               slugs: ["markets"] },
  { title: "Central banks & policy", slugs: ["policy"] },
  { title: "Economy",               slugs: ["economy"] },
  { title: "Business & earnings",   slugs: ["business"] },
  { title: "Crypto",                slugs: ["crypto"] },
  { title: "Personal finance",      slugs: ["personal-finance"] },
] as const;

export default async function FinanceProPage() {
  const [top, desks] = await Promise.all([
    getBites({ pillar: "finance", take: 6 }),
    Promise.all(DESKS.map((d) => listArticles({ categorySlugs: [...d.slugs], orderBy: "importance", sinceHours: 72, take: 8 }))),
  ]);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pillar-finance">Finance Pro</p>
            <h1 className="mt-2 font-serif text-display-md text-ink">The finance desk</h1>
            <p className="mt-2 max-w-2xl text-gray-body">
              Top markets, economy and policy news for professionals, ranked by importance and coverage.
            </p>
          </div>
          <Link href="/finance/beginners" className="text-sm text-brand hover:underline">
            Prefer plain English? Finance for Beginners →
          </Link>
        </div>

        {top.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink">Top of the desk</h2>
            <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {top.map((bite) => (
                <li key={bite.article.id}>
                  <BiteCard bite={bite} compact />
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {DESKS.map((d, i) => (
            <ProHeadlineList key={d.title} title={d.title} articles={desks[i] ?? []} moreHref={`/category/${d.slugs[0]}`} />
          ))}
        </div>

        {top.length === 0 && desks.every((d) => d.length === 0) && (
          <p className="mt-10 text-gray-body">Finance stories will appear here after the next update.</p>
        )}

        <p className="mt-10 text-xs text-gray-body">For information only, not investment advice.</p>
      </div>
    </main>
  );
}
