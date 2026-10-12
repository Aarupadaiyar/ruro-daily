import { findTerms } from "./glossary";
import { splitSentences } from "@/lib/text";
import type { BeginnerBite, Bite } from "@/types";

/**
 * Rule-based "explain it like I'm new to finance" layer. Three steps:
 *   1. swap trader jargon for everyday words (PLAIN_SWAPS)
 *   2. keep sentences short (long ones are cut at a clause boundary)
 *   3. add a "what this means for you" note picked by topic (WHY_RULES)
 * Deterministic and free; swap in an LLM later by replacing `toBeginnerBite`.
 */

// Order matters: longer phrases first so "year-on-year" wins over "year".
const PLAIN_SWAPS: [RegExp, string][] = [
  [/\b(?:y\/y|yoy|year-on-year|year-over-year|year over year)\b/gi, "compared with a year ago"],
  [/\b(?:q\/q|qoq|quarter-on-quarter|sequentially)\b/gi, "compared with the last quarter"],
  [/\b(?:m\/m|mom|month-on-month)\b/gi, "compared with last month"],
  [/\bbps\b/gi, "basis points"],
  [/\bequity markets?\b/gi, "stock markets"],
  [/\bequities\b/gi, "stocks"],
  [/\bbourses?\b/gi, "stock exchanges"],
  [/\bbenchmark indices\b/gi, "main stock indexes"],
  [/\bbenchmark index\b/gi, "main stock index"],
  [/\bbullish\b/gi, "optimistic"],
  [/\bbearish\b/gi, "pessimistic"],
  [/\bhawkish\b/gi, "in favour of higher interest rates"],
  [/\bdovish\b/gi, "in favour of lower interest rates"],
  [/\bmonetary policy\b/gi, "interest-rate policy"],
  [/\bheadwinds\b/gi, "challenges"],
  [/\btailwinds\b/gi, "helpful conditions"],
  [/\bprofit[- ]taking\b/gi, "investors cashing in gains"],
  [/\bsell-?off\b/gi, "wave of selling"],
  [/\b(?:surged|soared|skyrocketed|zoomed)\b/gi, "rose sharply"],
  [/\b(?:plunged|tumbled|slumped|tanked|cratered|nosedived)\b/gi, "fell sharply"],
  [/\b(?:slid|dipped|eased|edged lower)\b/gi, "fell slightly"],
  [/\b(?:edged higher|inched up|ticked up)\b/gi, "rose slightly"],
  [/\brallied\b/gi, "rose strongly"],
  [/\bfiis?\b|\bfpis?\b/gi, "foreign investors"],
  [/\bdiis?\b/gi, "Indian institutional investors"],
  [/\btreasury yields\b/gi, "US government bond rates"],
  [/\bguidance\b/gi, "own forecast"],
  [/\bheadline inflation\b/gi, "overall inflation"],
  [/\bcore inflation\b/gi, "inflation (excluding food and fuel)"],
  [/\bfiscal\b/gi, "government budget"],
  [/\bQE\b/g, "central-bank money printing"],
  [/\bm-?cap\b/gi, "market value"],
];

const MAX_SENTENCE_CHARS = 170;

export function toPlainEnglish(text: string): string {
  let out = text;
  for (const [re, plain] of PLAIN_SWAPS) {
    out = out.replace(re, (m) => matchCase(m, plain));
  }
  // Drop parenthetical asides — they are where tickers and jargon hide.
  out = out.replace(/\s*\((?:[^()]{0,80})\)/g, "");

  return splitSentences(out)
    .slice(0, 2)
    .map(shorten)
    .join(" ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function shorten(sentence: string): string {
  if (sentence.length <= MAX_SENTENCE_CHARS) return sentence;
  // Cut at the last clause boundary that keeps the core of the sentence.
  const cut = sentence.slice(0, MAX_SENTENCE_CHARS);
  const idx = Math.max(cut.lastIndexOf(", "), cut.lastIndexOf("; "), cut.lastIndexOf(" — "));
  const head = idx > 60 ? cut.slice(0, idx) : cut.replace(/\s+\S*$/, "");
  return head.replace(/[,;:\s]+$/, "") + ".";
}

function matchCase(original: string, replacement: string) {
  const first = original.charAt(0);
  return first !== first.toLowerCase()
    ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
    : replacement;
}

// First match wins, so put the most specific topics first.
const WHY_RULES: [RegExp, string][] = [
  [/\b(?:repo|rate cut|rate hike|interest rates?|policy rate|federal reserve|\bfed\b|rbi|monetary)\b/i,
    "Interest-rate decisions flow through to your loan EMIs and your FD returns. Cuts usually make borrowing cheaper; hikes make saving pay a little more."],
  [/\b(?:inflation|cpi|consumer prices?|price rise)\b/i,
    "Inflation is how fast prices rise. If your savings earn less than inflation, they are quietly losing buying power — one reason people invest rather than only save."],
  [/\b(?:ipos?|initial public offering|listing)\b/i,
    "IPOs often come with hype. Before applying, check whether the company actually makes a profit, and only use money you won't need for a few years."],
  [/\b(?:crypto|bitcoin|ethereum|stablecoin|token)\b/i,
    "Crypto can swing 10% or more in a day. If you invest at all, keep it a small slice of your money — only what you could afford to lose."],
  [/\b(?:gold|silver)\b/i,
    "Gold is a classic 'safety' asset that people buy when markets are nervous. Many planners suggest keeping it to around 5–10% of your savings."],
  [/\b(?:oil|crude|brent|petrol|diesel|fuel)\b/i,
    "Oil prices feed into petrol, transport and the cost of many everyday goods — big moves here can show up in your monthly budget."],
  [/\b(?:rupee|dollar|currency|forex|exchange rate)\b/i,
    "A weaker rupee makes anything priced in dollars — imported gadgets, foreign travel, studying abroad — more expensive for you."],
  [/\b(?:income tax|gst|tax|itr|budget)\b/i,
    "Tax changes can alter your take-home pay or what you pay at the shop. Check whether the change applies to you and note any deadlines."],
  [/\b(?:mutual funds?|sips?|etfs?|index funds?|nps|ppf)\b/i,
    "Funds and SIPs are how most people invest without picking stocks. What matters most over time: low fees, staying invested, and not reacting to every headline."],
  [/\b(?:loans?|emi|credit cards?|mortgage|home loan|credit score|cibil)\b/i,
    "This affects borrowing. Paying EMIs and card bills on time keeps your credit score healthy, which gets you cheaper loans later."],
  [/\b(?:jobs?|unemployment|layoffs?|hiring|payrolls?|wages?)\b/i,
    "The job market is a health check on the economy. When layoffs rise, it's a good reminder to keep an emergency fund of 3–6 months of expenses."],
  [/\b(?:earnings|profits?|revenues?|quarterly results|q[1-4])\b/i,
    "Earnings show whether a company is growing. Good results often lift its share price; disappointing ones pull it down — even for great companies."],
  [/\b(?:sensex|nifty|s&p|dow|nasdaq|stocks?|shares?|markets?|index)\b/i,
    "Markets move every day — that's normal. If you invest for the long term through SIPs or index funds, a single day's move rarely matters."],
  [/\b(?:sebi|sec|regulator|regulation|rules?)\b/i,
    "Regulators write the rules that protect ordinary investors. New rules can change which products you can buy and how they are sold to you."],
  [/\b(?:recession|gdp|growth|economy)\b/i,
    "Economic growth affects jobs, salaries and company profits. Slower growth usually means more caution from businesses and lenders."],
];

export function whyItMatters(text: string): string | null {
  for (const [re, message] of WHY_RULES) if (re.test(text)) return message;
  return null;
}

export function toBeginnerBite(bite: Bite): BeginnerBite {
  const haystack = `${bite.article.title}. ${bite.text}`;
  return {
    ...bite,
    plainText: toPlainEnglish(bite.text),
    whyItMatters: whyItMatters(haystack),
    terms: findTerms(haystack, 3),
  };
}
