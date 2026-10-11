import Link from "next/link";
import { cn } from "@/lib/utils";
import { PILLARS, type PillarSlug } from "@/lib/categories";

/** All / AI / Tech / Finance tabs driven by a `?pillar=` query param. */
export function PillarTabs({ basePath, active, paramJoin = "?" }: { basePath: string; active?: PillarSlug; paramJoin?: "?" | "&" }) {
  const tabs = [{ slug: undefined, name: "All" }, ...PILLARS] as const;
  return (
    <div role="tablist" aria-label="Filter by topic" className="inline-flex rounded-pill border border-border bg-paper p-1">
      {tabs.map((t) => {
        const isActive = active === t.slug;
        return (
          <Link
            key={t.name}
            role="tab"
            aria-selected={isActive}
            href={t.slug ? `${basePath}${paramJoin}pillar=${t.slug}` : basePath}
            className={cn(
              "rounded-pill px-4 py-1.5 text-sm font-medium transition-colors",
              isActive ? "bg-ink text-cream" : "text-gray-body hover:text-ink"
            )}
          >
            {t.name}
          </Link>
        );
      })}
    </div>
  );
}
