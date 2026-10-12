"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "/",                  label: "Top Stories" },
  { href: "/edition",           label: "Today's Edition" },
  { href: "/bites",             label: "Bites" },
  { href: "/ai",                label: "AI" },
  { href: "/tech",              label: "Tech" },
  { href: "/finance",           label: "Finance Pro" },
  { href: "/finance/beginners", label: "Finance for Beginners" },
  { href: "/sources",           label: "Sources" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || (href !== "/finance" && pathname.startsWith(href + "/")));

  return (
    <nav aria-label="Sections" className="-mb-px flex gap-6 overflow-x-auto text-sm [scrollbar-width:none]">
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isActive(href) ? "page" : undefined}
          className={cn(
            "shrink-0 border-b-2 py-2.5 font-medium transition-colors",
            isActive(href) ? "border-ink text-ink" : "border-transparent text-gray-body hover:text-ink"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
