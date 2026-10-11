import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES, type PillarSlug } from "@/lib/categories";

// Re-export so existing imports from this file keep working.
export { CATEGORIES } from "@/lib/categories";

/** Category chips. Pass `pillar` to show only that pillar's categories. */
export function CategoryFilter({ activeSlug, pillar, allHref = "/" }: { activeSlug?: string; pillar?: PillarSlug; allHref?: string }) {
  const cats = pillar ? CATEGORIES.filter((c) => c.pillar === pillar) : CATEGORIES;
  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-pill border px-3.5 py-1.5 text-sm transition-colors",
      active ? "border-ink bg-ink text-cream" : "border-border bg-paper text-gray-body hover:border-ink/30 hover:text-ink"
    );

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link href={allHref} className={chip(!activeSlug)}>All</Link>
      {cats.map((cat) => (
        <Link key={cat.slug} href={`/category/${cat.slug}`} className={chip(activeSlug === cat.slug)}>
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
