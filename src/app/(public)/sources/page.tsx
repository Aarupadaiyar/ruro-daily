import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { SOURCES, type SourceKind } from "@/lib/scraper/sources";
import { getCategory, PILLARS } from "@/lib/categories";

export const metadata: Metadata = {
  title: "Our sources",
  description: "Every open news source and independent writer Ruro Daily reads, grouped by topic.",
};

const KIND_LABEL: Record<SourceKind, string> = {
  LAB: "Company & lab blogs",
  OUTLET: "News outlets",
  INDIVIDUAL: "Independent writers",
  OFFICIAL: "Official & primary sources",
  COMMUNITY: "Community-ranked",
};
const KIND_ORDER: SourceKind[] = ["OUTLET", "OFFICIAL", "LAB", "INDIVIDUAL", "COMMUNITY"];

export default function SourcesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <h1 className="font-serif text-display-md text-ink">Our sources</h1>
      <p className="mt-3 max-w-2xl text-gray-body">
        Ruro Daily reads {SOURCES.length} open feeds every day: newsrooms, regulators, research labs and independent writers.
        Every story links back to and credits its original publisher.
      </p>

      {PILLARS.map((pillar) => {
        const inPillar = SOURCES.filter((s) => getCategory(s.defaultCategorySlug)?.pillar === pillar.slug);
        return (
          <section key={pillar.slug} className="mt-12">
            <h2 className="border-b border-ink pb-2 font-serif text-2xl font-semibold text-ink">
              {pillar.name} <span className="text-base font-normal text-gray-body">· {inPillar.length} sources</span>
            </h2>
            <div className="mt-6 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {KIND_ORDER.map((kind) => {
                const list = inPillar.filter((s) => s.kind === kind);
                if (list.length === 0) return null;
                return (
                  <div key={kind}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">{KIND_LABEL[kind]}</h3>
                    <ul className="mt-3 space-y-2">
                      {list.map((s) => (
                        <li key={s.slug}>
                          <a href={s.homepageUrl} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-1 text-sm text-ink hover:underline">
                            {s.name}
                            <ArrowUpRight size={12} className="text-gray-body opacity-0 group-hover:opacity-100" aria-hidden="true" />
                          </a>
                          {s.region && s.region !== "GLOBAL" && <span className="ml-2 text-xs text-gray-body">{s.region}</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </main>
  );
}
