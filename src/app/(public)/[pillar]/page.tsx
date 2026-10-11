import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { CategoryFilter } from "@/components/blog/CategoryFilter";
import { Top10Sidebar } from "@/components/blog/Top10Sidebar";
import { BitesStrip } from "@/components/bites/BitesStrip";
import { listArticles } from "@/lib/articles";
import { getBites } from "@/lib/bites";
import { PILLARS } from "@/lib/categories";

export const dynamic = "force-dynamic";

// /finance has its own dedicated desk pages; this route serves /ai and /tech.
const SECTION_PILLARS = PILLARS.filter((p) => p.slug !== "finance");

function getPillar(slug: string) {
  return SECTION_PILLARS.find((p) => p.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ pillar: string }> }): Promise<Metadata> {
  const pillar = getPillar((await params).pillar);
  return pillar ? { title: `${pillar.name} news today`, description: pillar.description } : {};
}

export default async function PillarPage({ params }: { params: Promise<{ pillar: string }> }) {
  const pillar = getPillar((await params).pillar);
  if (!pillar) notFound();

  const [latest, top, bites] = await Promise.all([
    listArticles({ pillar: pillar.slug, take: 24 }),
    listArticles({ pillar: pillar.slug, orderBy: "importance", sinceHours: 48, take: 10 }),
    getBites({ pillar: pillar.slug, take: 8 }),
  ]);

  return (
    <main>
      <header className="border-b border-border px-4 py-10 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-serif text-display-md text-ink">{pillar.name}</h1>
          <p className="mt-2 text-gray-body">{pillar.description}</p>
          <div className="mt-6">
            <CategoryFilter pillar={pillar.slug} allHref={`/${pillar.slug}`} />
          </div>
        </div>
      </header>

      <BitesStrip bites={bites} title={`${pillar.name} in Bites`} href={`/bites?pillar=${pillar.slug}`} />

      <section className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1fr_340px]">
          {latest.length === 0 ? (
            <p className="text-gray-body">No {pillar.name} stories yet. Check back after the next update.</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {latest.map((a) => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            {top.length > 0 && <Top10Sidebar articles={top} title={`Top ${pillar.name} stories`} />}
          </aside>
        </div>
      </section>
    </main>
  );
}
