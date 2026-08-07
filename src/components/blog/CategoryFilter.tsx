"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";

// Re-export so existing imports from this file keep working.
export { CATEGORIES } from "@/lib/categories";

export function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/intelligence"
        className={cn("shrink-0 rounded-pill border px-4 py-2 text-sm font-medium", !activeSlug ? "border-lime bg-lime text-white" : "border-black/10 bg-white text-ink/55 hover:text-ink")}
      >
        All
      </Link>
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.slug}
          href={`/intelligence/category/${cat.slug}`}
          className={cn(
            "shrink-0 rounded-pill border px-4 py-2 text-sm font-medium",
            activeSlug === cat.slug ? "border-lime bg-lime text-white" : "border-black/10 bg-white text-ink/55 hover:text-ink"
          )}
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
