import Link from "next/link";
import { Search } from "lucide-react";
import { SearchBar } from "@/components/blog/SearchBar";
import { Logo } from "@/components/layout/Logo";
import { NavLinks } from "@/components/layout/NavLinks";
import { SITE } from "@/lib/site";

export function Navbar() {
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo />
        </Link>
        <p className="hidden text-xs text-gray-body lg:block">{today} · Today&apos;s edition</p>
        <div className="hidden w-72 md:block">
          <SearchBar compact />
        </div>
        <Link href="/search" aria-label="Search news" className="rounded-pill border border-border bg-paper p-2 text-ink/70 hover:text-ink md:hidden">
          <Search size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <NavLinks />
      </div>
    </header>
  );
}
