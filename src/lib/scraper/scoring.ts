import type { ScrapedArticle } from "@/lib/validations/article";
import { getActiveSourceBySlug } from "./sources";

const HIGH_SIGNAL_SOURCES = new Set([
  // AI labs
  "openai", "anthropic", "deepmind", "meta-ai", "google-ai",
  // Finance primary sources and top-tier newsrooms
  "rbi-press", "fed-press", "sec-press", "wsj-markets", "ft-markets", "economist-finance",
]);

const HIGH_SIGNAL_KEYWORDS = [
  // AI / tech
  "launch", "release", "funding", "raises", "acquire", "acquisition",
  "state-of-the-art", "sota", "benchmark", "open-source", "open source",
  "gpt", "claude", "gemini", "llama",
  // Finance
  "rate cut", "rate hike", "repo rate", "interest rate", "inflation", "recession",
  "record high", "record low", "crash", "ipo", "earnings", "gdp", "tariff",
  "sensex", "nifty", "s&p 500", "nasdaq", "bitcoin",
];

/**
 * Importance score (0-100) — a heuristic, computed at scrape time, meant to
 * approximate "how big is this story" independent of how popular it becomes
 * later. Cheap keyword/source weighting now; swap the keyword pass for an
 * LLM classification call if/when quality needs to improve.
 */
export function computeImportanceScore(article: ScrapedArticle): number {
  let score = 30; // baseline

  if (HIGH_SIGNAL_SOURCES.has(article.sourceSlug)) score += 25;

  // Commentary from individuals is valuable but rarely "the top story".
  const kind = getActiveSourceBySlug(article.sourceSlug)?.kind;
  if (kind === "OFFICIAL") score += 10;
  if (kind === "INDIVIDUAL") score -= 5;

  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  const keywordHits = HIGH_SIGNAL_KEYWORDS.filter((kw) => haystack.includes(kw)).length;
  score += Math.min(30, keywordHits * 8);

  if (article.title.length < 90) score += 5; // punchy headlines tend to be announcements

  return Math.max(0, Math.min(100, score));
}

/**
 * Popularity score — recalculated periodically (see cron/digest route) from
 * actual engagement: views, read time, bookmarks, shares. Decays over time
 * so old articles fall out of "Top 10 Today" naturally.
 */
export function computePopularityScore(input: {
  views24h: number;
  avgReadTimeSecs: number;
  bookmarks: number;
  shares: number;
  ageHours: number;
}): number {
  const engagementRaw =
    input.views24h * 1 +
    input.bookmarks * 8 +
    input.shares * 6 +
    Math.min(input.avgReadTimeSecs / 10, 20);

  const recencyDecay = Math.exp(-input.ageHours / 36); // half-life ~25h
  return Math.round(engagementRaw * recencyDecay * 100) / 100;
}
