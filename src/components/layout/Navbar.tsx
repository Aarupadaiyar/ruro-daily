import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/blog/SearchBar";

// Guards against an empty-string env var too (`??` alone would not fall
// back on ""), which previously could leave this link pointing at nothing.
const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://trafy.ai";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Main Homepage redirecting to original landing page */}
        <a href={MAIN_SITE} className="flex items-center">
          <Image src="/trafy-logo-light.svg" alt="Trafy" width={80} height={49} className="h-8 w-auto" priority />
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {/* Article Section */}
          <Link href="/intelligence" className="font-semibold text-white">
            Articles
          </Link>
          {/* Contact Section redirecting to main contact page */}
          <a href={`${MAIN_SITE}/#contact`} className="text-gray-body hover:text-white">
            Contact
          </a>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="w-56">
            <SearchBar compact />
          </div>
        </div>
      </div>
    </header>
  );
}