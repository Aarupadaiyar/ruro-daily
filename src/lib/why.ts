import { whyItMatters as financeWhy } from "@/lib/finance/simplify";
import type { ArticleCardData } from "@/types";

/**
 * "Why it matters" for AI and Tech stories — one plain line under each bite.
 * Finance stories reuse the beginner-friendly finance rules. First match wins.
 */
const RULES: [RegExp, string][] = [
  [/\b(breach|hack(ed|ers?)?|ransomware|vulnerabilit(y|ies)|zero-day|leak(ed)?|phishing|malware)\b/i,
    "Security incidents can expose personal data — worth checking if you use the affected product and updating passwords or apps."],
  [/\b(ban|regulat\w*|lawsuit|sued|antitrust|court|eu ai act|policy|government|senate|ministry)\b/i,
    "Rules and court decisions decide what AI and tech companies are allowed to build — and what protections you get as a user."],
  [/\b(raises?|raised|funding|series [a-f]|valuation|unicorn|acquir\w*|acquisition|merger|ipo)\b/i,
    "Big money moves show where investors think the next wave of products and jobs will come from."],
  [/\b(layoffs?|job cuts|hiring|jobs|workers|employees)\b/i,
    "Hiring and layoffs at tech companies are an early signal for the wider job market, especially in software."],
  [/\b(gpus?|chips?|nvidia|semiconductor|data cent(er|re)s?|compute|tsmc)\b/i,
    "Chips and data centres are the bottleneck for AI — their supply decides how fast (and how cheaply) new AI features reach you."],
  [/\b(open[- ]source|open weights?|open model|hugging ?face)\b/i,
    "Open models can be used, studied and run by anyone — they keep AI cheaper and less controlled by a few big companies."],
  [/\b(agents?|agentic|automat\w*)\b/i,
    "AI agents that take actions (not just answer questions) are where everyday software is heading — expect them inside the apps you use."],
  [/\b(launch(es|ed)?|releases?|released|unveil\w*|introduc\w*|announc\w*|gpt|claude|gemini|llama|model)\b/i,
    "New models and launches change what the tools you use can do — and what competitors will copy next."],
  [/\b(iphone|android|pixel|galaxy|macbook|laptop|smartphone|wearable|headphones)\b/i,
    "Useful if you're planning a purchase — new launches often bring price drops on the previous models."],
  [/\b(research|study|paper|benchmark|scientists?)\b/i,
    "Research results like this usually reach real products within months to a few years."],
];

export function whyFor(article: Pick<ArticleCardData, "title" | "summary" | "pillar">): string | null {
  const text = `${article.title}. ${article.summary}`;
  if (article.pillar === "finance") return financeWhy(text);
  for (const [re, line] of RULES) if (re.test(text)) return line;
  return null;
}
