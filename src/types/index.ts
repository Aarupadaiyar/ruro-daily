import type { PillarSlug } from "@/lib/categories";

export interface ArticleCardData {
  id: string;
  slug: string;
  title: string;
  summary: string;
  thumbnailUrl: string | null;
  category: { slug: string; name: string };
  pillar: PillarSlug;
  source: { slug: string; name: string };
  author: { slug: string; name: string } | null;
  publishedAt: string;
  readingTimeMins: number;
  popularityScore: number;
  importanceScore: number;
  sourceUrl: string;
  clusterId: string | null;
  /** Publisher region from the source config ("GLOBAL" when unspecified). */
  region: "GLOBAL" | "US" | "IN" | "UK";
}

/** A top story condensed to a 1–2 sentence "bite". */
export interface Bite {
  article: ArticleCardData;
  /** 1–2 sentences, ≤ ~240 chars. */
  text: string;
  /** How many outlets covered the same story (1 = only this one). */
  coverage: number;
  rank: number;
  /** One line on why this story matters (rule-based), or null. */
  why: string | null;
}

/** A finance story rewritten for beginners. */
export interface BeginnerBite extends Bite {
  /** Plain-English version of `text`, with jargon swapped out. */
  plainText: string;
  /** "What this means for you" — rule-based by topic. */
  whyItMatters: string | null;
  /** Glossary terms found in the story, for the inline explainer list. */
  terms: { term: string; meaning: string }[];
}

export interface TrendingCompany {
  name: string;
  slug: string;
  mentionCount: number;
}

export interface UpcomingEvent {
  name: string;
  date: string;
  location: string;
  url: string;
}
