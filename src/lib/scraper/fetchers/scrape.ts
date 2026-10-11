import { BOT_USER_AGENT } from "@/lib/site";
import * as cheerio from "cheerio";
import type { SourceConfig } from "../sources";
import type { ScrapedArticle } from "@/lib/validations/article";

const UA = BOT_USER_AGENT;

/**
 * Per-source selector configs.
 * `link: "self"` means the *item element itself* is an <a>, so href comes from node.attr("href").
 * `title: "self"` means use the item element's own text content as the title.
 * Any other value is treated as a child CSS selector.
 */
const SELECTORS: Record<
  string,
  { item: string; title: string; link: string; summary?: string; image?: string }
> = {
  anthropic: {
    item: "a[href*='/news/']",
    title: "self",
    link: "self",
  },
  "meta-ai": {
    // Meta AI renders full absolute links in <a href="https://ai.meta.com/blog/...">
    item: "a[href*='ai.meta.com/blog/']",
    title: "self",
    link: "self",
  },
  mistral: {
    item: "a[href*='/news/']",
    title: "self",
    link: "self",
  },
  xai: {
    item: "a[href*='/blog/']",
    title: "self",
    link: "self",
  },
  perplexity: {
    item: "a[href*='/hub/blog/']",
    title: "self",
    link: "self",
  },
  "github-trending-ai": {
    item: "article.Box-row",
    title: "h2 a",
    link: "h2 a",
    summary: "p",
  },
};

export async function fetchScrapeSource(
  source: SourceConfig
): Promise<Partial<ScrapedArticle>[]> {
  const config = SELECTORS[source.slug];
  if (!config) {
    throw new Error(
      `No selector config for scrape source "${source.slug}" — add one to SELECTORS.`
    );
  }

  const res = await fetch(source.feedUrl, {
    headers: { "User-Agent": UA },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Fetch failed for ${source.slug}: ${res.status}`);

  const $ = cheerio.load(await res.text());
  const seen = new Set<string>();
  const results: Partial<ScrapedArticle>[] = [];

  $(config.item)
    .slice(0, 25)
    .each((_, el) => {
      const node = $(el);

      // ── title ──────────────────────────────────────────────
      let title: string;
      if (config.title === "self") {
        title = node.text().replace(/\s+/g, " ").trim();
      } else {
        title = node.find(config.title).first().text().replace(/\s+/g, " ").trim();
      }

      // ── href ───────────────────────────────────────────────
      let rawHref: string | undefined;
      if (config.link === "self") {
        rawHref = node.attr("href");
      } else {
        rawHref = node.find(config.link).first().attr("href");
      }

      if (!title || title.length < 5 || !rawHref) return;

      const resolvedUrl = (() => {
        try {
          return new URL(rawHref, source.homepageUrl).toString();
        } catch {
          return null;
        }
      })();
      if (!resolvedUrl) return;

      // dedupe within this run (same page often has multiple <a> to the same URL)
      if (seen.has(resolvedUrl)) return;
      seen.add(resolvedUrl);

      // ── summary ────────────────────────────────────────────
      const summary = config.summary
        ? node.find(config.summary).first().text().replace(/\s+/g, " ").trim()
        : "";

      // ── image ─────────────────────────────────────────────
      let thumbnailUrl: string | undefined;
      if (config.image) {
        const src = node.find(config.image).first().attr("src");
        if (src) {
          try {
            thumbnailUrl = new URL(src, source.homepageUrl).toString();
          } catch {}
        }
      }

      results.push({
        title,
        summary,
        content: "",
        sourceUrl: resolvedUrl,
        sourceSlug: source.slug,
        thumbnailUrl,
        categorySlug: source.defaultCategorySlug,
        publishedAt: new Date(),
      });
    });

  return results;
}
