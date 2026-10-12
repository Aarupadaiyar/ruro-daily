export type SourceType = "RSS" | "API" | "SCRAPE" | "REDDIT" | "GITHUB" | "ARXIV";

/**
 * What kind of publisher this is — shown on the Sources page and used to
 * weight importance (official releases > outlets > individual commentary).
 *   LAB        – company / research-lab blogs (first-party announcements)
 *   OUTLET     – newsrooms and trade publications
 *   INDIVIDUAL – independent writers, newsletters and personal blogs
 *   OFFICIAL   – regulators and central banks (primary sources)
 *   COMMUNITY  – aggregators ranked by readers (e.g. Hacker News)
 */
export type SourceKind = "LAB" | "OUTLET" | "INDIVIDUAL" | "OFFICIAL" | "COMMUNITY";

export interface SourceConfig {
  slug: string;
  name: string;
  type: SourceType;
  kind: SourceKind;
  feedUrl: string;
  homepageUrl: string;
  defaultCategorySlug: string;
  region?: "GLOBAL" | "US" | "IN" | "UK";
  /** Re-route items to a better category by keyword (for broad, mixed-topic feeds). */
  classify?: boolean;
  /** Max items taken per run. Defaults to 12 (see DEFAULT_MAX_ITEMS). */
  maxItems?: number;
  /** Ignore items older than this many days. Defaults to 7 (30 for INDIVIDUAL). */
  maxAgeDays?: number;
  /** Titles matching this are routine notices, not news — never stored or shown. */
  exclude?: RegExp;
}

export const DEFAULT_MAX_ITEMS = 12;

export function maxAgeDaysFor(s: SourceConfig): number {
  return s.maxAgeDays ?? (s.kind === "INDIVIDUAL" ? 30 : 7);
}

// Compact constructor so the table below stays scannable.
const rss = (
  slug: string, name: string, kind: SourceKind, feedUrl: string, homepageUrl: string,
  defaultCategorySlug: string, extra: Partial<SourceConfig> = {}
): SourceConfig => ({ slug, name, type: "RSS", kind, feedUrl, homepageUrl, defaultCategorySlug, region: "GLOBAL", ...extra });

// ─── Working sources confirmed live ────────────────────────────────────────
// Every feed below returned HTTP 200 with items when last verified (Oct 2026).
// Sources marked [BROKEN]/[BLOCKED] are blocked (403), gone (404/410), or
// return empty feeds; they stay commented out so the pipeline never silently
// returns 0 items for them.
export const SOURCES: SourceConfig[] = [
  // ══ AI ════════════════════════════════════════════════════════════════════
  // ── AI labs (first-party) ────────────────────────────────────────────────
  rss("openai",        "OpenAI Blog",         "LAB", "https://openai.com/news/rss.xml",                             "https://openai.com/news",                 "llms"),
  rss("deepmind",      "Google DeepMind",     "LAB", "https://deepmind.google/blog/rss.xml",                        "https://deepmind.google/blog",            "research"),
  rss("google-ai",     "Google AI Blog",      "LAB", "https://blog.google/technology/ai/rss/",                      "https://blog.google/technology/ai/",      "llms"),
  rss("microsoft-ai",  "Microsoft Blog",      "LAB", "https://blogs.microsoft.com/feed/",                           "https://blogs.microsoft.com/",            "infrastructure"),
  rss("nvidia",        "NVIDIA AI Blog",      "LAB", "https://blogs.nvidia.com/blog/category/deep-learning/feed/",  "https://blogs.nvidia.com",                "infrastructure"),
  rss("huggingface",   "Hugging Face Blog",   "LAB", "https://huggingface.co/blog/feed.xml",                        "https://huggingface.co/blog",             "open-source"),
  rss("aws-ml",        "AWS Machine Learning","LAB", "https://aws.amazon.com/blogs/machine-learning/feed/",         "https://aws.amazon.com/blogs/machine-learning/", "mlops"),
  rss("apple-ml",      "Apple Machine Learning Research", "LAB", "https://machinelearning.apple.com/rss.xml",       "https://machinelearning.apple.com",       "research", { maxAgeDays: 30 }),
  { slug: "anthropic", name: "Anthropic News",    type: "SCRAPE", kind: "LAB", feedUrl: "https://www.anthropic.com/news", homepageUrl: "https://www.anthropic.com", defaultCategorySlug: "llms", region: "GLOBAL" },
  { slug: "meta-ai",   name: "Meta AI Blog",      type: "SCRAPE", kind: "LAB", feedUrl: "https://ai.meta.com/blog/",      homepageUrl: "https://ai.meta.com",       defaultCategorySlug: "research", region: "GLOBAL" },
  { slug: "mistral",   name: "Mistral AI",        type: "SCRAPE", kind: "LAB", feedUrl: "https://mistral.ai/news/",       homepageUrl: "https://mistral.ai",        defaultCategorySlug: "llms", region: "GLOBAL" },
  // [BLOCKED] xai: 403 on x.ai/blog
  // [BLOCKED] perplexity: 403 on perplexity.ai/hub/blog

  // ── AI research ──────────────────────────────────────────────────────────
  { slug: "arxiv-ai", name: "arXiv (cs.AI)", type: "ARXIV", kind: "OFFICIAL", feedUrl: "http://export.arxiv.org/api/query?search_query=cat:cs.AI&sortBy=submittedDate&sortOrder=descending", homepageUrl: "https://arxiv.org/list/cs.AI/recent", defaultCategorySlug: "research", region: "GLOBAL", maxItems: 8 },
  { slug: "arxiv-lg", name: "arXiv (cs.LG)", type: "ARXIV", kind: "OFFICIAL", feedUrl: "http://export.arxiv.org/api/query?search_query=cat:cs.LG&sortBy=submittedDate&sortOrder=descending", homepageUrl: "https://arxiv.org/list/cs.LG/recent", defaultCategorySlug: "research", region: "GLOBAL", maxItems: 8 },
  rss("paperswithcode", "Papers with Code",    "COMMUNITY", "https://papers.takara.ai/api/feed",                    "https://paperswithcode.com",              "research", { maxItems: 8 }),
  rss("bair",          "Berkeley AI Research", "LAB",    "https://bair.berkeley.edu/blog/feed.xml",                 "https://bair.berkeley.edu/blog/",         "research", { maxAgeDays: 60 }),
  rss("mit-news-ai",   "MIT News: AI",         "OUTLET", "https://news.mit.edu/rss/topic/artificial-intelligence2", "https://news.mit.edu/topic/artificial-intelligence2", "research"),
  rss("the-gradient",  "The Gradient",         "OUTLET", "https://thegradient.pub/rss/",                            "https://thegradient.pub",                 "research", { maxAgeDays: 30 }),

  // ── AI news outlets ──────────────────────────────────────────────────────
  rss("techcrunch-ai",  "TechCrunch AI",       "OUTLET", "https://techcrunch.com/category/artificial-intelligence/feed/", "https://techcrunch.com/category/artificial-intelligence/", "startups", { classify: true }),
  rss("theverge-ai",    "The Verge AI",        "OUTLET", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", "https://www.theverge.com/ai-artificial-intelligence", "llms", { classify: true }),
  rss("venturebeat-ai", "VentureBeat AI",      "OUTLET", "https://venturebeat.com/category/ai/feed/",               "https://venturebeat.com/category/ai/",    "funding", { classify: true }),
  rss("mit-tech-review","MIT Technology Review","OUTLET","https://www.technologyreview.com/feed/",                  "https://www.technologyreview.com",        "llms", { classify: true }),
  rss("wired-ai",       "WIRED AI",            "OUTLET", "https://www.wired.com/feed/tag/ai/latest/rss",            "https://www.wired.com/tag/artificial-intelligence/", "llms", { classify: true }),
  rss("ars-ai",         "Ars Technica AI",     "OUTLET", "https://arstechnica.com/ai/feed/",                        "https://arstechnica.com/ai/",             "llms", { classify: true }),
  rss("marktechpost",   "MarkTechPost",        "OUTLET", "https://www.marktechpost.com/feed/",                      "https://www.marktechpost.com",            "research", { classify: true }),

  // ── AI: independent writers ──────────────────────────────────────────────
  rss("simon-willison",  "Simon Willison",      "INDIVIDUAL", "https://simonwillison.net/atom/everything/",         "https://simonwillison.net",               "llms", { maxItems: 8, maxAgeDays: 7 }),
  rss("import-ai",       "Import AI (Jack Clark)", "INDIVIDUAL", "https://importai.substack.com/feed",              "https://importai.substack.com",           "research"),
  rss("latent-space",    "Latent Space",        "INDIVIDUAL", "https://www.latent.space/feed",                      "https://www.latent.space",                "agents"),
  rss("interconnects",   "Interconnects (Nathan Lambert)", "INDIVIDUAL", "https://www.interconnects.ai/feed",       "https://www.interconnects.ai",            "open-source"),
  rss("one-useful-thing","One Useful Thing (Ethan Mollick)", "INDIVIDUAL", "https://www.oneusefulthing.org/feed",   "https://www.oneusefulthing.org",          "opinion"),
  rss("raschka",         "Ahead of AI (Sebastian Raschka)", "INDIVIDUAL", "https://magazine.sebastianraschka.com/feed", "https://magazine.sebastianraschka.com", "tutorials"),
  rss("gary-marcus",     "Gary Marcus",         "INDIVIDUAL", "https://garymarcus.substack.com/feed",               "https://garymarcus.substack.com",         "opinion"),
  rss("ai-snake-oil",    "AI Snake Oil",        "INDIVIDUAL", "https://www.aisnakeoil.com/feed",                    "https://www.aisnakeoil.com",              "opinion"),
  rss("lilian-weng",     "Lil'Log (Lilian Weng)","INDIVIDUAL","https://lilianweng.github.io/index.xml",             "https://lilianweng.github.io",            "research", { maxAgeDays: 90 }),
  rss("karpathy",        "Andrej Karpathy",     "INDIVIDUAL", "https://karpathy.github.io/feed.xml",                "https://karpathy.github.io",              "tutorials", { maxAgeDays: 90 }),
  rss("chip-huyen",      "Chip Huyen",          "INDIVIDUAL", "https://huyenchip.com/feed.xml",                     "https://huyenchip.com",                   "mlops", { maxAgeDays: 90 }),
  rss("jay-alammar",     "Jay Alammar",         "INDIVIDUAL", "https://jalammar.github.io/feed.xml",                "https://jalammar.github.io",              "tutorials", { maxAgeDays: 90 }),
  rss("eugene-yan",      "Eugene Yan",          "INDIVIDUAL", "https://eugeneyan.com/rss/",                         "https://eugeneyan.com",                   "mlops", { maxAgeDays: 60 }),
  // [GONE] the-batch (deeplearning.ai) feed → 404
  // [EMPTY] stanford-hai rss.xml → 0 items

  // ══ TECH ══════════════════════════════════════════════════════════════════
  rss("hn-frontpage",  "Hacker News (150+ pts)", "COMMUNITY", "https://hnrss.org/frontpage?points=150",              "https://news.ycombinator.com",            "tech-news", { classify: true, maxAgeDays: 3 }),
  rss("techcrunch",    "TechCrunch",          "OUTLET", "https://techcrunch.com/feed/",                              "https://techcrunch.com",                  "startups", { classify: true }),
  rss("the-verge",     "The Verge",           "OUTLET", "https://www.theverge.com/rss/index.xml",                    "https://www.theverge.com",                "gadgets", { classify: true }),
  rss("ars-technica",  "Ars Technica",        "OUTLET", "https://feeds.arstechnica.com/arstechnica/index",           "https://arstechnica.com",                 "tech-news", { classify: true }),
  rss("wired",         "WIRED",               "OUTLET", "https://www.wired.com/feed/rss",                            "https://www.wired.com",                   "tech-news", { classify: true }),
  rss("engadget",      "Engadget",            "OUTLET", "https://www.engadget.com/rss.xml",                          "https://www.engadget.com",                "gadgets", { classify: true }),
  rss("the-register",  "The Register",        "OUTLET", "https://www.theregister.com/headlines.atom",                "https://www.theregister.com",             "tech-news", { classify: true, region: "UK" }),
  rss("ieee-spectrum", "IEEE Spectrum",       "OUTLET", "https://spectrum.ieee.org/feeds/feed.rss",                  "https://spectrum.ieee.org",               "tech-news", { classify: true }),
  rss("github-blog",   "The GitHub Blog",     "LAB",    "https://github.blog/feed/",                                 "https://github.blog",                     "software"),
  rss("cloudflare-blog","Cloudflare Blog",    "LAB",    "https://blog.cloudflare.com/rss/",                          "https://blog.cloudflare.com",             "software", { classify: true }),
  rss("ycombinator",   "Y Combinator Blog",   "LAB",    "https://www.ycombinator.com/blog/rss",                      "https://www.ycombinator.com/blog",        "startups", { maxAgeDays: 30 }),
  rss("inc42",         "Inc42",               "OUTLET", "https://inc42.com/feed/",                                   "https://inc42.com",                       "startups", { classify: true, region: "IN" }),
  rss("yourstory",     "YourStory",           "OUTLET", "https://yourstory.com/feed",                                "https://yourstory.com",                   "startups", { classify: true, region: "IN" }),
  // Tech: independent writers
  rss("stratechery",       "Stratechery (Ben Thompson)", "INDIVIDUAL", "https://stratechery.com/feed/",              "https://stratechery.com",                 "opinion"),
  rss("pragmatic-engineer","The Pragmatic Engineer (Gergely Orosz)", "INDIVIDUAL", "https://newsletter.pragmaticengineer.com/feed", "https://newsletter.pragmaticengineer.com", "software"),
  rss("benedict-evans",    "Benedict Evans",     "INDIVIDUAL", "https://www.ben-evans.com/benedictevans?format=rss", "https://www.ben-evans.com",               "opinion"),
  rss("daring-fireball",   "Daring Fireball (John Gruber)", "INDIVIDUAL", "https://daringfireball.net/feeds/main",   "https://daringfireball.net",              "gadgets", { maxItems: 6, maxAgeDays: 7 }),
  // [BROKEN] langchain: malformed XML (unescaped & in feed)
  // [BROKEN] analytics-india: malformed XML (attribute without value)
  // [BLOCKED] reddit-*: 403 (requires OAuth, not open .json)
  // [BROKEN]  producthunt-ai: GraphQL endpoint needs API key → 404
  // [EMPTY]   paul-graham essays mirror → 0 items

  // ══ FINANCE ═══════════════════════════════════════════════════════════════
  // ── Global / US outlets ──────────────────────────────────────────────────
  rss("cnbc-top",       "CNBC Top News",       "OUTLET", "https://www.cnbc.com/id/100003114/device/rss/rss.html",    "https://www.cnbc.com",                    "business", { classify: true, region: "US" }),
  rss("cnbc-markets",   "CNBC Markets",        "OUTLET", "https://www.cnbc.com/id/20910258/device/rss/rss.html",     "https://www.cnbc.com/markets/",           "markets", { classify: true, region: "US" }),
  rss("cnbc-finance",   "CNBC Finance",        "OUTLET", "https://www.cnbc.com/id/10000664/device/rss/rss.html",     "https://www.cnbc.com/finance/",           "business", { classify: true, region: "US" }),
  rss("marketwatch-top","MarketWatch",         "OUTLET", "https://feeds.content.dowjones.io/public/rss/mw_topstories", "https://www.marketwatch.com",           "markets", { classify: true, region: "US" }),
  rss("marketwatch-pulse","MarketWatch Market Pulse","OUTLET","https://feeds.content.dowjones.io/public/rss/mw_marketpulse","https://www.marketwatch.com/latest-news","markets", { classify: true, region: "US" }),
  rss("wsj-markets",    "WSJ Markets",         "OUTLET", "https://feeds.content.dowjones.io/public/rss/RSSMarketsMain", "https://www.wsj.com/finance",           "markets", { classify: true, region: "US" }),
  rss("ft-markets",     "Financial Times Markets","OUTLET","https://www.ft.com/markets?format=rss",                  "https://www.ft.com/markets",              "markets", { classify: true, region: "UK" }),
  rss("economist-finance","The Economist: Finance & Economics","OUTLET","https://www.economist.com/finance-and-economics/rss.xml","https://www.economist.com/finance-and-economics","economy", { classify: true, maxItems: 8 }),
  rss("bbc-business",   "BBC Business",        "OUTLET", "https://feeds.bbci.co.uk/news/business/rss.xml",           "https://www.bbc.com/business",            "business", { classify: true, region: "UK" }),
  rss("guardian-business","The Guardian Business","OUTLET","https://www.theguardian.com/uk/business/rss",            "https://www.theguardian.com/uk/business", "business", { classify: true, region: "UK" }),
  rss("npr-economy",    "NPR Economy",         "OUTLET", "https://feeds.npr.org/1017/rss.xml",                       "https://www.npr.org/sections/economy/",   "economy", { classify: true, region: "US" }),
  rss("coindesk",       "CoinDesk",            "OUTLET", "https://www.coindesk.com/arc/outboundfeeds/rss/",          "https://www.coindesk.com",                "crypto"),
  rss("cointelegraph",  "Cointelegraph",       "OUTLET", "https://cointelegraph.com/rss",                            "https://cointelegraph.com",               "crypto"),
  rss("nerdwallet",     "NerdWallet",          "OUTLET", "https://www.nerdwallet.com/blog/feed/",                    "https://www.nerdwallet.com",              "personal-finance", { region: "US", maxAgeDays: 30 }),

  // ── India outlets ────────────────────────────────────────────────────────
  rss("et-markets",     "Economic Times Markets","OUTLET","https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms", "https://economictimes.indiatimes.com/markets", "markets", { classify: true, region: "IN" }),
  rss("et-wealth",      "ET Wealth",           "OUTLET", "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms", "https://economictimes.indiatimes.com/wealth", "personal-finance", { classify: true, region: "IN" }),
  rss("livemint-markets","Mint Markets",       "OUTLET", "https://www.livemint.com/rss/markets",                     "https://www.livemint.com/market",         "markets", { classify: true, region: "IN" }),
  rss("livemint-money", "Mint Money",          "OUTLET", "https://www.livemint.com/rss/money",                       "https://www.livemint.com/money",          "personal-finance", { classify: true, region: "IN" }),
  rss("hindu-businessline","BusinessLine Markets","OUTLET","https://www.thehindubusinessline.com/markets/feeder/default.rss", "https://www.thehindubusinessline.com/markets/", "markets", { classify: true, region: "IN" }),
  // [BLOCKED] moneycontrol: 403 on all RSS feeds
  // [BLOCKED] business-standard: 403

  // ── Official: regulators & central banks ─────────────────────────────────
  rss("rbi-press",      "Reserve Bank of India","OFFICIAL","https://www.rbi.org.in/pressreleases_rss.xml",           "https://www.rbi.org.in",                  "policy", {
    region: "IN",
    // Daily market-operations notices aren't news for readers.
    exclude: /auction of state government securities|money market operations|result of|reserve money|treasury bills|variable rate (reverse )?repo|underwriting auction|lending rates of/i,
  }),
  rss("fed-press",      "US Federal Reserve",  "OFFICIAL", "https://www.federalreserve.gov/feeds/press_all.xml",     "https://www.federalreserve.gov",          "policy", { region: "US", maxAgeDays: 14 }),
  rss("sec-press",      "US SEC",              "OFFICIAL", "https://www.sec.gov/news/pressreleases.rss",             "https://www.sec.gov",                     "policy", { region: "US", maxItems: 8 }),

  // ── Finance: independent writers ─────────────────────────────────────────
  rss("damodaran",        "Musings on Markets (Aswath Damodaran)", "INDIVIDUAL", "https://aswathdamodaran.blogspot.com/feeds/posts/default", "https://aswathdamodaran.blogspot.com", "markets", { maxAgeDays: 60 }),
  rss("calculated-risk",  "Calculated Risk (Bill McBride)", "INDIVIDUAL", "https://www.calculatedriskblog.com/feeds/posts/default", "https://www.calculatedriskblog.com", "economy", { maxItems: 6, maxAgeDays: 7 }),
  rss("marginal-revolution","Marginal Revolution (Cowen & Tabarrok)", "INDIVIDUAL", "https://marginalrevolution.com/feed", "https://marginalrevolution.com", "economy", { maxItems: 6, maxAgeDays: 7 }),
  rss("abnormal-returns", "Abnormal Returns",  "INDIVIDUAL", "https://abnormalreturns.com/feed/",                    "https://abnormalreturns.com",             "markets", { maxItems: 6, maxAgeDays: 7 }),
  rss("wealth-common-sense","A Wealth of Common Sense (Ben Carlson)", "INDIVIDUAL", "https://awealthofcommonsense.com/feed/", "https://awealthofcommonsense.com", "personal-finance"),
  rss("reformed-broker",  "The Reformed Broker (Josh Brown)", "INDIVIDUAL", "https://thereformedbroker.com/feed/",   "https://thereformedbroker.com",           "markets"),
  rss("of-dollars-and-data","Of Dollars And Data (Nick Maggiulli)", "INDIVIDUAL", "https://ofdollarsanddata.com/feed/", "https://ofdollarsanddata.com",          "personal-finance"),
  rss("noahpinion",       "Noahpinion (Noah Smith)", "INDIVIDUAL", "https://www.noahpinion.blog/feed",              "https://www.noahpinion.blog",             "economy"),
  rss("apricitas",        "Apricitas Economics", "INDIVIDUAL", "https://www.apricitas.io/feed",                      "https://www.apricitas.io",                "economy"),
  rss("net-interest",     "Net Interest (Marc Rubinstein)", "INDIVIDUAL", "https://www.netinterest.co/feed",         "https://www.netinterest.co",              "business"),
  rss("the-diff",         "The Diff (Byrne Hobart)", "INDIVIDUAL", "https://www.thediff.co/feed",                    "https://www.thediff.co",                  "business"),
  rss("kitces",           "Kitces (Michael Kitces)", "INDIVIDUAL", "https://www.kitces.com/feed/",                   "https://www.kitces.com",                  "personal-finance"),
  rss("freefincal",       "freefincal (M. Pattabiraman)", "INDIVIDUAL", "https://freefincal.com/feed/",              "https://freefincal.com",                  "personal-finance", { region: "IN" }),
  rss("mr-money-mustache","Mr. Money Mustache", "INDIVIDUAL", "https://www.mrmoneymustache.com/feed/",              "https://www.mrmoneymustache.com",         "personal-finance", { maxAgeDays: 60 }),
  // [GONE] collab-fund (Morgan Housel) feed → 404
  // [GONE] investopedia, yahoo-finance rssindex → 404

  // ══ Expansion batch 2 (verified Oct 2026) ═════════════════════════════════
  // ── AI: labs & research ──────────────────────────────────────────────────
  rss("google-research",   "Google Research Blog",  "LAB", "https://research.google/blog/rss/",                    "https://research.google/blog/",           "research"),
  rss("microsoft-research","Microsoft Research",    "LAB", "https://www.microsoft.com/en-us/research/feed/",       "https://www.microsoft.com/en-us/research/", "research"),
  rss("allen-ai",          "Ai2 (Allen Institute for AI)", "LAB", "https://allenai.org/rss.xml",                   "https://allenai.org",                     "open-source", { maxAgeDays: 30 }),
  rss("together-ai",       "Together AI Blog",      "LAB", "https://www.together.ai/blog/rss.xml",                 "https://www.together.ai/blog",            "open-source", { maxItems: 6 }),
  rss("wandb",             "Weights & Biases: Fully Connected", "LAB", "https://wandb.ai/fully-connected/rss.xml", "https://wandb.ai/fully-connected",        "mlops", { maxItems: 6 }),
  // ── AI: outlets & newsletters ────────────────────────────────────────────
  rss("the-decoder",       "The Decoder",           "OUTLET", "https://the-decoder.com/feed/",                     "https://the-decoder.com",                 "llms", { classify: true }),
  rss("last-week-in-ai",   "Last Week in AI",       "OUTLET", "https://lastweekin.ai/feed",                        "https://lastweekin.ai",                   "llms", { maxAgeDays: 14 }),
  rss("bens-bites",        "Ben's Bites",           "INDIVIDUAL", "https://www.bensbites.com/feed",                "https://www.bensbites.com",               "agents"),
  rss("zvi",               "Don't Worry About the Vase (Zvi Mowshowitz)", "INDIVIDUAL", "https://thezvi.substack.com/feed", "https://thezvi.substack.com",    "opinion", { maxItems: 4 }),
  rss("dwarkesh",          "Dwarkesh Podcast",      "INDIVIDUAL", "https://www.dwarkesh.com/feed",                 "https://www.dwarkesh.com",                "opinion"),
  rss("exponential-view",  "Exponential View (Azeem Azhar)", "INDIVIDUAL", "https://www.exponentialview.co/feed",  "https://www.exponentialview.co",          "opinion"),
  rss("algorithmic-bridge","The Algorithmic Bridge (Alberto Romero)", "INDIVIDUAL", "https://www.thealgorithmicbridge.com/feed", "https://www.thealgorithmicbridge.com", "opinion"),
  rss("ai-supremacy",      "AI Supremacy (Michael Spencer)", "INDIVIDUAL", "https://www.ai-supremacy.com/feed",    "https://www.ai-supremacy.com",            "opinion"),

  // ── Tech: outlets ────────────────────────────────────────────────────────
  rss("platformer",        "Platformer (Casey Newton)", "INDIVIDUAL", "https://www.platformer.news/rss/",          "https://www.platformer.news",             "tech-news", { classify: true }),
  rss("9to5mac",           "9to5Mac",               "OUTLET", "https://9to5mac.com/feed/",                         "https://9to5mac.com",                     "gadgets", { maxItems: 8 }),
  rss("9to5google",        "9to5Google",            "OUTLET", "https://9to5google.com/feed/",                      "https://9to5google.com",                  "gadgets", { maxItems: 8 }),
  rss("macrumors",         "MacRumors",             "OUTLET", "https://feeds.macrumors.com/MacRumors-All",         "https://www.macrumors.com",               "gadgets", { maxItems: 8 }),
  rss("android-authority", "Android Authority",     "OUTLET", "https://www.androidauthority.com/feed/",            "https://www.androidauthority.com",        "gadgets", { maxItems: 8 }),
  rss("toms-hardware",     "Tom's Hardware",        "OUTLET", "https://www.tomshardware.com/feeds/all",            "https://www.tomshardware.com",            "gadgets", { classify: true, maxItems: 8 }),
  rss("the-next-web",      "The Next Web",          "OUTLET", "https://thenextweb.com/feed",                       "https://thenextweb.com",                  "tech-news", { classify: true }),
  rss("zdnet",             "ZDNET",                 "OUTLET", "https://www.zdnet.com/news/rss.xml",                "https://www.zdnet.com",                   "tech-news", { classify: true }),
  rss("cnet",              "CNET",                  "OUTLET", "https://www.cnet.com/rss/news/",                    "https://www.cnet.com",                    "gadgets", { classify: true }),
  rss("gizmodo",           "Gizmodo",               "OUTLET", "https://gizmodo.com/feed",                          "https://gizmodo.com",                     "tech-news", { classify: true }),
  rss("gadgets360",        "Gadgets 360 (NDTV)",    "OUTLET", "https://feeds.feedburner.com/gadgets360-latest",    "https://www.gadgets360.com",              "gadgets", { classify: true, region: "IN", maxItems: 8 }),
  rss("techpp",            "TechPP",                "OUTLET", "https://techpp.com/feed/",                          "https://techpp.com",                      "gadgets", { region: "IN" }),
  rss("medianama",         "MediaNama",             "OUTLET", "https://www.medianama.com/feed/",                   "https://www.medianama.com",               "tech-news", { classify: true, region: "IN" }),
  // ── Tech: security ───────────────────────────────────────────────────────
  rss("bleepingcomputer",  "BleepingComputer",      "OUTLET", "https://www.bleepingcomputer.com/feed/",            "https://www.bleepingcomputer.com",        "cybersecurity"),
  rss("thehackernews",     "The Hacker News (security)", "OUTLET", "https://feeds.feedburner.com/TheHackersNews",   "https://thehackernews.com",               "cybersecurity"),
  rss("dark-reading",      "Dark Reading",          "OUTLET", "https://www.darkreading.com/rss.xml",               "https://www.darkreading.com",             "cybersecurity", { maxItems: 8 }),
  rss("krebs",             "Krebs on Security (Brian Krebs)", "INDIVIDUAL", "https://krebsonsecurity.com/feed/",   "https://krebsonsecurity.com",             "cybersecurity"),
  rss("schneier",          "Schneier on Security (Bruce Schneier)", "INDIVIDUAL", "https://www.schneier.com/feed/atom/", "https://www.schneier.com",          "cybersecurity", { maxItems: 6 }),
  // ── Tech: software & engineering ─────────────────────────────────────────
  rss("infoq",             "InfoQ",                 "OUTLET", "https://feed.infoq.com/",                           "https://www.infoq.com",                   "software"),
  rss("lwn",               "LWN.net",               "OUTLET", "https://lwn.net/headlines/rss",                     "https://lwn.net",                         "software"),
  rss("phoronix",          "Phoronix",              "OUTLET", "https://www.phoronix.com/rss.php",                  "https://www.phoronix.com",                "software", { maxItems: 8 }),
  rss("smashing",          "Smashing Magazine",     "OUTLET", "https://www.smashingmagazine.com/feed/",            "https://www.smashingmagazine.com",        "software", { maxAgeDays: 14 }),
  rss("lobsters",          "Lobsters",              "COMMUNITY", "https://lobste.rs/rss",                          "https://lobste.rs",                       "software", { classify: true, maxAgeDays: 3, maxItems: 10 }),
  rss("devto",             "DEV Community",         "COMMUNITY", "https://dev.to/feed",                            "https://dev.to",                          "software", { maxItems: 6, maxAgeDays: 3 }),
  rss("martin-fowler",     "Martin Fowler",         "INDIVIDUAL", "https://martinfowler.com/feed.atom",            "https://martinfowler.com",                "software"),
  rss("julia-evans",       "Julia Evans",           "INDIVIDUAL", "https://jvns.ca/atom.xml",                      "https://jvns.ca",                         "software", { maxAgeDays: 60 }),
  rss("overreacted",       "Overreacted (Dan Abramov)", "INDIVIDUAL", "https://overreacted.io/rss.xml",            "https://overreacted.io",                  "software", { maxAgeDays: 60 }),
  // ── Tech: startups & VC writers ──────────────────────────────────────────
  rss("steve-blank",       "Steve Blank",           "INDIVIDUAL", "https://steveblank.com/feed/",                  "https://steveblank.com",                  "startups"),
  rss("avc",               "AVC (Fred Wilson)",     "INDIVIDUAL", "https://avc.xyz/feed",                          "https://avc.xyz",                         "startups"),
  rss("lenny",             "Lenny's Newsletter (Lenny Rachitsky)", "INDIVIDUAL", "https://www.lennysnewsletter.com/feed", "https://www.lennysnewsletter.com",  "startups"),
  rss("not-boring",        "Not Boring (Packy McCormick)", "INDIVIDUAL", "https://www.notboring.co/feed",           "https://www.notboring.co",                "funding"),
  rss("elad-gil",          "Elad Gil",              "INDIVIDUAL", "https://blog.eladgil.com/feed",                 "https://blog.eladgil.com",                "funding"),

  // ── Finance: outlets ─────────────────────────────────────────────────────
  rss("bloomberg-markets", "Bloomberg Markets",     "OUTLET", "https://feeds.bloomberg.com/markets/news.rss",      "https://www.bloomberg.com/markets",       "markets", { classify: true }),
  rss("fortune",           "Fortune",               "OUTLET", "https://fortune.com/feed/fortune-feeds/?id=3230629", "https://fortune.com",                    "business", { classify: true, region: "US" }),
  rss("business-insider",  "Business Insider Markets", "OUTLET", "https://markets.businessinsider.com/rss/news",   "https://markets.businessinsider.com",     "markets", { classify: true, region: "US" }),
  rss("investing-news",    "Investing.com News",    "OUTLET", "https://www.investing.com/rss/news.rss",            "https://www.investing.com/news/",         "markets", { classify: true }),
  rss("seeking-alpha",     "Seeking Alpha Market Currents", "OUTLET", "https://seekingalpha.com/market_currents.xml", "https://seekingalpha.com/market-news",  "markets", { classify: true, region: "US" }),
  rss("kiplinger",         "Kiplinger",             "OUTLET", "https://www.kiplinger.com/feeds/all",               "https://www.kiplinger.com",               "personal-finance", { classify: true, region: "US", maxItems: 8 }),
  rss("ndtv-profit",       "NDTV Profit",           "OUTLET", "https://feeds.feedburner.com/ndtvprofit-latest",    "https://www.ndtvprofit.com",              "markets", { classify: true, region: "IN" }),
  rss("value-research",    "Value Research",        "OUTLET", "https://www.valueresearchonline.com/rss/",          "https://www.valueresearchonline.com",     "personal-finance", { region: "IN" }),
  rss("zerodha-zconnect",  "Zerodha Z-Connect",     "LAB",    "https://zerodha.com/z-connect/feed",                "https://zerodha.com/z-connect",           "personal-finance", { region: "IN", maxAgeDays: 30 }),
  // ── Finance: official ────────────────────────────────────────────────────
  rss("sebi",              "SEBI",                  "OFFICIAL", "https://www.sebi.gov.in/sebirss.xml",             "https://www.sebi.gov.in",                 "policy", {
    region: "IN", maxItems: 6,
    // SEBI's feed is mostly case filings; keep press releases, circulars and consultations.
    exclude: /appeal no|remittance|adjudication order|settlement order|recovery certificate|order in the matter|exemption order|corrigendum|notice of demand|summons|attachment/i,
  }),
  rss("ecb-press",         "European Central Bank", "OFFICIAL", "https://www.ecb.europa.eu/rss/press.html",        "https://www.ecb.europa.eu",               "policy", { maxAgeDays: 14 }),
  rss("boe-news",          "Bank of England",       "OFFICIAL", "https://www.bankofengland.co.uk/rss/news",        "https://www.bankofengland.co.uk",         "policy", { region: "UK", maxItems: 8 }),
  // ── Finance: independent writers ─────────────────────────────────────────
  rss("krugman",           "Paul Krugman",          "INDIVIDUAL", "https://paulkrugman.substack.com/feed",         "https://paulkrugman.substack.com",        "economy"),
  rss("big-picture",       "The Big Picture (Barry Ritholtz)", "INDIVIDUAL", "https://ritholtz.com/feed/",         "https://ritholtz.com",                    "markets", { maxItems: 6, maxAgeDays: 7 }),
  rss("klement",           "Klement on Investing (Joachim Klement)", "INDIVIDUAL", "https://klementoninvesting.substack.com/feed", "https://klementoninvesting.substack.com", "markets"),
  rss("kyla",              "Kyla Scanlon",          "INDIVIDUAL", "https://kyla.substack.com/feed",                "https://kyla.substack.com",               "economy"),
  rss("the-overshoot",     "The Overshoot (Matthew Klein)", "INDIVIDUAL", "https://theovershoot.co/feed",          "https://theovershoot.co",                 "economy"),
  rss("capitalmind",       "Capitalmind",           "INDIVIDUAL", "https://www.capitalmind.in/feed/",              "https://www.capitalmind.in",              "markets", { region: "IN" }),
  rss("basunivesh",        "BasuNivesh (Basavaraj Tonagatti)", "INDIVIDUAL", "https://www.basunivesh.com/feed/",   "https://www.basunivesh.com",              "personal-finance", { region: "IN" }),
  // [GONE/BLOCKED] barrons, entrackr, imf-news, world-bank, moneylife → 404; motley-fool → 401;
  //   unite-ai, tim-harford → 403; synced → 429; financial-express → 0 items; subramoney → timeout
];

export function getActiveSourceBySlug(slug: string) {
  return SOURCES.find((s) => s.slug === slug);
}
