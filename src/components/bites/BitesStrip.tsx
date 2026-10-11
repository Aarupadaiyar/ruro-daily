import Link from "next/link";
import { BiteCard } from "@/components/bites/BiteCard";
import type { Bite } from "@/types";

/** Horizontal row of today's top bites for the home page. */
export function BitesStrip({ bites, title = "Today in Bites", href = "/bites" }: { bites: Bite[]; title?: string; href?: string }) {
  if (bites.length === 0) return null;
  return (
    <section className="border-b border-border bg-cream-dim px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-display-sm text-ink">{title}</h2>
            <p className="mt-1 text-sm text-gray-body">The day&apos;s biggest stories, each in a sentence or two.</p>
          </div>
          <Link href={href} className="shrink-0 text-sm font-medium text-brand hover:underline">All bites →</Link>
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          {bites.map((bite) => (
            <li key={bite.article.id} className="w-[82%] shrink-0 snap-start sm:w-[340px]">
              <BiteCard bite={bite} compact />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
