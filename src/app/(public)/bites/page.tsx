import type { Metadata } from "next";
import { BiteCard } from "@/components/bites/BiteCard";
import { PillarTabs } from "@/components/bites/PillarTabs";
import { getBites } from "@/lib/bites";
import { getPrefs } from "@/lib/prefs-server";
import { PILLARS, type PillarSlug } from "@/lib/categories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bites: today's top stories in a sentence or two",
  description: "The day's top, main and most-covered AI, Tech and Finance stories, each condensed into one or two sentences.",
};

export default async function BitesPage({ searchParams }: { searchParams: Promise<{ pillar?: string }> }) {
  const { pillar: raw } = await searchParams;
  const pillar = PILLARS.find((p) => p.slug === raw)?.slug as PillarSlug | undefined;
  const prefs = await getPrefs();
  // An explicit tab wins over saved topics; region preference always applies.
  const bites = await getBites({ pillar, take: 30, prefs: pillar ? { ...prefs, pillars: [pillar] } : prefs });

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Short Bites</p>
        <h1 className="mt-2 font-serif text-display-md text-ink">Today in Bites</h1>
        <p className="mt-3 max-w-xl text-gray-body">
          The biggest stories of the day, ranked by importance and by how many outlets are covering them, each in a sentence or two.
        </p>
        <div className="mt-6">
          <PillarTabs basePath="/bites" active={pillar} />
        </div>

        {bites.length === 0 ? (
          <p className="mt-10 text-gray-body">No bites yet for this topic. Check back after the next update.</p>
        ) : (
          <ol className="mt-8 space-y-4">
            {bites.map((bite) => (
              <li key={bite.article.id}>
                <BiteCard bite={bite} />
              </li>
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}
