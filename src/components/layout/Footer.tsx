import Image from "next/image";
import Link from "next/link";
import { Newsletter } from "@/components/blog/Newsletter";
import { Github, Linkedin } from "lucide-react";

// Guards against an empty-string env var too (`??` alone would not fall
// back on ""), which previously could leave this link pointing at nothing.
const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://trafy.ai";

const COLUMNS = [
  { 
    heading: "Intelligence", 
    links: [
      ["Latest News", "/intelligence"], 
      ["Categories", "/intelligence/category/llms"], 
      ["Trending", "/intelligence?sort=trending"], 
      ["RSS Feed", "/intelligence/rss.xml"]
    ] 
  },
  { 
    heading: "For Talent", 
    links: [
      ["Get Started", "https://www.trafy.ai/#talent"], 
      ["AI Assessment", "https://academy.trafy.ai/"], 
      ["Free Portfolio", "https://app.trafy.ai/"]
    ] 
  },
  { 
    heading: "For Companies", 
    links: [
      ["Hire Talent", "https://www.trafy.ai/#companies"], 
      ["Private Workspace", "https://build.trafy.ai/"], 
      ["Enterprise", "https://www.trafy.ai/#how"]
    ] 
  },
] as const;

export function Footer() {
  return (
    <footer>
      <div className="relative overflow-hidden bg-cream px-6 py-20 text-center">
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-lime/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-display-sm text-white">Stay ahead of the AI curve.</h2>
          <p className="mx-auto mt-3 max-w-md text-white/65">
            One email a week: the model releases, funding rounds, and research that actually matter.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <Newsletter variant="on-lime" source="footer" />
          </div>
        </div>
      </div>

      <div className="bg-ink px-6 py-16 text-white lg:px-10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 md:grid-cols-4">
          <div>
            <a href={MAIN_SITE} className="inline-flex">
              <Image src="/trafy-logo-light.svg" alt="Trafy" width={80} height={49} className="h-8 w-auto" />
            </a>
            <p className="mt-4 max-w-xs text-sm text-gray-bodyDark">
              Work Tech connecting global AI talent with the world&apos;s top AI companies.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="https://www.linkedin.com/company/trafy-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-lime transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://github.com/trafy-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-lime transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-bodyDark">{col.heading}</p>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map(([label, href]) => {
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={href}>
                      <Link 
                        href={href} 
                        className="text-white/80 hover:text-lime"
                        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
