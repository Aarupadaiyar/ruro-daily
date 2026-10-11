/**
 * Keyword re-categoriser for broad feeds (CNBC top news, Hacker News, The
 * Verge…) whose items span AI, Tech and Finance. Only applied to sources with
 * `classify: true`; everything else keeps its source's default category.
 *
 * Rules are checked in order against the headline first, then the summary,
 * so a headline about Bitcoin beats a summary that merely mentions markets.
 */
const RULES: [string, RegExp][] = [
  // Finance — most specific first
  ["crypto",           /\b(bitcoin|ethereum|crypto|stablecoins?|blockchain|solana|binance|coinbase|defi|nft)\b/i],
  ["policy",           /\b(rbi|repo rate|federal reserve|\bfed\b|fomc|powell|central bank|sebi|\bsec\b|ecb|bank of england|rate (cut|hike)|monetary policy)\b/i],
  ["personal-finance", /\b(personal finance|retire(ment)?|savings? account|mutual funds?|\bsips?\b|income tax|tax[- ]saving|\bitr\b|credit cards?|home loans?|mortgage rates?|\bemi\b|fixed deposits?|\bfds?\b|ppf|nps|401\(k\)|budgeting)\b/i],
  ["economy",          /\b(inflation|\bcpi\b|\bgdp\b|recession|unemployment|jobs report|payrolls|tariffs?|trade deficit|economy|economic growth|fiscal)\b/i],
  ["markets",          /\b(stocks?|shares|sensex|nifty|s&p 500|nasdaq|dow jones|wall street|treasur(y|ies)|bond yields?|ipos?|equit(y|ies)|commodit(y|ies)|gold price|crude|oil prices?|forex|rupee)\b/i],
  ["business",         /\b(earnings|quarterly results|q[1-4] results|revenue|profit|ceo|merger|acquisition|acquires|layoffs?|bankruptcy)\b/i],

  // AI
  ["llms",             /\b(llms?|gpt-?\d|chatgpt|claude|gemini|llama|mistral|language models?|openai|anthropic|deepmind)\b/i],
  ["agents",           /\b(ai agents?|agentic|autonomous agents?|computer use)\b/i],
  ["robotics",         /\b(robots?|robotics|humanoid|self-driving|autonomous vehicles?|waymo)\b/i],
  ["infrastructure",   /\b(gpus?|nvidia|data cent(er|re)s?|ai chips?|tpus?|semiconductors?|tsmc)\b/i],
  ["open-source",      /\b(open[- ]source|open weights?|hugging ?face)\b/i],
  ["research",         /\b(arxiv|paper|researchers|study finds|benchmark)\b/i],

  // Tech
  ["cybersecurity",    /\b(hack(ed|ers?)?|breach|ransomware|malware|vulnerabilit(y|ies)|cve-|phishing|zero-day|cyber ?attack|security flaw)\b/i],
  ["funding",          /\b(raises? \$|raised \$|series [a-f]\b|seed round|funding round|valuation|unicorn|venture capital|\bvc\b)\b/i],
  ["gadgets",          /\b(iphone|ipad|macbook|pixel|galaxy|android|smartphones?|laptops?|wearables?|headphones|smartwatch|apple watch|vision pro|console|playstation|xbox|nintendo)\b/i],
  ["software",         /\b(programming|developers?|javascript|typescript|python|rust|golang|github|open[- ]source|linux|kernel|api|database|framework|compiler)\b/i],
  ["startups",         /\b(startups?|founders?|y combinator|launch(es|ed)?)\b/i],
  ["llms",             /\b(\bai\b|artificial intelligence|machine learning)\b/i],
];

export function classifyArticle(title: string, summary: string, fallback: string): string {
  for (const text of [title, summary]) {
    for (const [slug, re] of RULES) if (re.test(text)) return slug;
  }
  return fallback;
}
