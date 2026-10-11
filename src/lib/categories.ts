/**
 * Single source of truth for category slugs and display names.
 * Kept in a plain (non-"use client") module so it can be imported by:
 *   - CategoryFilter.tsx (client component)
 *   - category/[category]/page.tsx  (server component)
 * without triggering Next.js's "cannot import a client module on the server" error.
 *
 * Every category belongs to one pillar. Pillars drive the Bites filters, the
 * Finance desks and the colour-coding across the site.
 */
export const PILLARS = [
  { slug: "ai",      name: "AI",      description: "Models, research, agents and the AI industry." },
  { slug: "tech",    name: "Tech",    description: "Software, gadgets, security and startups." },
  { slug: "finance", name: "Finance", description: "Markets, the economy, money and crypto." },
] as const;

export type PillarSlug = (typeof PILLARS)[number]["slug"];

export const CATEGORIES = [
  // ── AI ───────────────────────────────────────────────────────────────────
  { slug: "llms",               name: "LLMs",               pillar: "ai",      description: "Large language models: launches, benchmarks and the labs behind them." },
  { slug: "agents",             name: "Agents",             pillar: "ai",      description: "AI agents and the tools that let models take action." },
  { slug: "open-source",        name: "Open Source",        pillar: "ai",      description: "Open models, datasets and libraries anyone can use." },
  { slug: "research",           name: "Research",           pillar: "ai",      description: "Papers and breakthroughs from labs and universities." },
  { slug: "prompt-engineering", name: "Prompt Engineering", pillar: "ai",      description: "Getting better results out of AI models." },
  { slug: "infrastructure",     name: "AI Infrastructure",  pillar: "ai",      description: "Chips, data centres and the compute race." },
  { slug: "robotics",           name: "Robotics",           pillar: "ai",      description: "Robots, autonomy and embodied AI." },
  { slug: "computer-vision",    name: "Computer Vision",    pillar: "ai",      description: "Image, video and multimodal AI." },
  { slug: "mlops",              name: "MLOps",              pillar: "ai",      description: "Shipping and running machine learning in production." },
  { slug: "data-science",       name: "Data Science",       pillar: "ai",      description: "Analytics, statistics and data tooling." },
  { slug: "opinion",            name: "Opinion",            pillar: "ai",      description: "Essays and analysis from independent writers." },
  { slug: "tutorials",          name: "Tutorials",          pillar: "ai",      description: "Hands-on guides and explainers." },

  // ── Tech ─────────────────────────────────────────────────────────────────
  { slug: "tech-news",          name: "Tech News",          pillar: "tech",    description: "The day's biggest technology stories." },
  { slug: "software",           name: "Software & Dev",     pillar: "tech",    description: "Programming, developer tools and engineering culture." },
  { slug: "cybersecurity",      name: "Cybersecurity",      pillar: "tech",    description: "Breaches, vulnerabilities and digital privacy." },
  { slug: "gadgets",            name: "Gadgets",            pillar: "tech",    description: "Phones, laptops, wearables and consumer tech." },
  { slug: "startups",           name: "Startups",           pillar: "tech",    description: "New companies, launches and founder stories." },
  { slug: "funding",            name: "Funding",            pillar: "tech",    description: "Venture rounds, acquisitions and IPO pipelines." },

  // ── Finance ──────────────────────────────────────────────────────────────
  { slug: "markets",            name: "Markets",            pillar: "finance", description: "Stocks, indices, bonds and commodities." },
  { slug: "economy",            name: "Economy",            pillar: "finance", description: "Inflation, jobs, growth and trade." },
  { slug: "policy",             name: "Central Banks & Policy", pillar: "finance", description: "RBI, the Fed, SEC/SEBI and regulation." },
  { slug: "business",           name: "Business",           pillar: "finance", description: "Company earnings, deals and corporate news." },
  { slug: "personal-finance",   name: "Personal Finance",   pillar: "finance", description: "Saving, investing, taxes and money habits." },
  { slug: "crypto",             name: "Crypto",             pillar: "finance", description: "Bitcoin, blockchains and digital assets." },
] as const satisfies readonly { slug: string; name: string; pillar: PillarSlug; description: string }[];

export type CategorySlug = (typeof CATEGORIES)[number]["slug"];

export function getCategory(slug: string) {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Pillar for a category slug. Unknown/legacy slugs fall back to "ai". */
export function pillarOf(categorySlug: string): PillarSlug {
  return getCategory(categorySlug)?.pillar ?? "ai";
}

export function categorySlugsForPillar(pillar: PillarSlug): string[] {
  return CATEGORIES.filter((c) => c.pillar === pillar).map((c) => c.slug);
}
