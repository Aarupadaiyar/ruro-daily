import Link from "next/link";
import { Rss } from "lucide-react";
import { FollowLinks } from "@/components/edition/FollowLinks";
import { Logo } from "@/components/layout/Logo";
import { SOURCES } from "@/lib/scraper/sources";
import { SITE } from "@/lib/site";

const COLUMNS = [
  { heading: "Read",    links: [["Today's Edition", "/edition"], ["Top Stories", "/"], ["Bites", "/bites"], ["AI", "/ai"], ["Tech", "/tech"]] },
  { heading: "Finance", links: [["Finance Pro", "/finance"], ["Finance for Beginners", "/finance/beginners"], ["Markets", "/category/markets"], ["Weekly money quiz", "/finance/beginners/quiz"]] },
  { heading: "About",   links: [["How we pick stories", "/about"], ["Our sources", "/sources"], ["RSS feed", "/rss.xml"], ["ruro.in", SITE.parentUrl]] },
] as const;

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border">
      <div className="bg-cream-dim px-4 py-14 text-center sm:px-6">
        <h2 className="mx-auto max-w-2xl font-serif text-display-sm text-ink">Your daily edition, in your inbox.</h2>
        <p className="mx-auto mt-3 max-w-md text-gray-body">
          One short email each morning: the top AI, Tech and Finance stories in bites.
        </p>
        <FollowLinks source="footer" />
      </div>

      <div className="px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-gray-body">
              {SITE.tagline} Curated from {SOURCES.length}+ open news sources and independent writers.
            </p>
            <a href="/rss.xml" className="mt-4 inline-flex items-center gap-1.5 text-sm text-gray-body hover:text-ink">
              <Rss size={15} /> RSS
            </a>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-body">{col.heading}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href} className="text-ink/80 hover:text-ink hover:underline">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-12 max-w-7xl border-t border-border pt-6 text-xs text-gray-body">
          © {new Date().getFullYear()} Ruro. Headlines and summaries link to and credit their original publishers.
          Finance content is for general information only and is not investment advice.
        </p>
      </div>
    </footer>
  );
}
