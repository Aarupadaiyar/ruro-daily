import type { Metadata } from "next";
import Link from "next/link";
import { BasicsGrid } from "@/components/finance/BasicsGrid";
import { BeginnerBiteCard } from "@/components/finance/BeginnerBiteCard";
import { getBites } from "@/lib/bites";
import { toBeginnerBite } from "@/lib/finance/simplify";
import { GLOSSARY } from "@/lib/finance/glossary";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finance for Beginners: today's money news in plain English",
  description: "Today's top finance stories explained simply: what happened, what it means for you, and one-minute lessons on the basics of money and investing.",
};

export default async function FinanceBeginnersPage() {
  const bites = (await getBites({ pillar: "finance", take: 9 })).map(toBeginnerBite);

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-pillar-finance">Finance for Beginners</p>
          <h1 className="mt-2 font-serif text-display-md text-ink">Money news, made simple</h1>
          <p className="mt-3 text-lg leading-relaxed text-gray-body">
            The day&apos;s top finance stories with the jargon taken out. Each one says what happened and what it means for you.
            New to all this? Start with the basics below.
          </p>
          <nav className="mt-5 flex flex-wrap gap-4 text-sm">
            <a href="#todays-bites" className="text-brand hover:underline">Today&apos;s stories</a>
            <a href="#basics" className="text-brand hover:underline">The basics</a>
            <a href="#glossary" className="text-brand hover:underline">Glossary</a>
            <Link href="/finance" className="text-gray-body hover:text-ink">Switch to Finance Pro →</Link>
          </nav>
        </header>

        <section id="todays-bites" className="mt-12 scroll-mt-28">
          <h2 className="border-b border-ink pb-2 font-serif text-2xl font-semibold text-ink">Today&apos;s top stories, simply explained</h2>
          {bites.length === 0 ? (
            <p className="mt-6 text-gray-body">Today&apos;s stories will appear here after the next update.</p>
          ) : (
            <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {bites.map((bite) => (
                <li key={bite.article.id}>
                  <BeginnerBiteCard bite={bite} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section id="basics" className="mt-16 scroll-mt-28">
          <h2 className="border-b border-ink pb-2 font-serif text-2xl font-semibold text-ink">The basics, one minute each</h2>
          <p className="mb-6 mt-3 text-gray-body">Tap a card to open it.</p>
          <BasicsGrid />
        </section>

        <section id="glossary" className="mt-16 scroll-mt-28">
          <h2 className="border-b border-ink pb-2 font-serif text-2xl font-semibold text-ink">Glossary</h2>
          <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term)).map((g) => (
              <div key={g.term}>
                <dt className="font-semibold text-ink">{g.term}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-gray-body">{g.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <p className="mt-12 text-xs text-gray-body">
          For learning only, not personal financial advice. Explanations are simplified; check details with the original source.
        </p>
      </div>
    </main>
  );
}
