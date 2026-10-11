import { BOT_USER_AGENT } from "@/lib/site";
import * as cheerio from "cheerio";

export interface ExtractedDetails {
  title?: string;
  summary?: string;
  content?: string;
  authorName?: string;
  publishedAt?: Date;
  thumbnailUrl?: string;
}

const UA = BOT_USER_AGENT;

// Exact strings that indicate the page returned junk content rather than an article.
const JUNK_TITLE_FRAGMENTS = [
  "skip to content", "log in", "sign in", "subscribe now", "cookie policy",
  "terms of service", "privacy policy", "enable javascript", "just a moment",
  "access denied", "403 forbidden", "404 not found", "page not found",
  "redirecting", "loading…", "loading...",
];

const JUNK_SUMMARY_FRAGMENTS = [
  "skip to content", "javascript is required", "enable javascript",
  "cookie policy", "terms of service", "privacy policy",
  "just a moment", "access denied", "subscribe to continue",
];

export function isPlausibleTitle(title?: string): boolean {
  if (!title) return false;
  const t = title.trim();
  if (t.length < 5 || t.length > 300) return false;
  const low = t.toLowerCase();
  return !JUNK_TITLE_FRAGMENTS.some((f) => low.includes(f));
}

export function isPlausibleSummary(summary?: string): boolean {
  if (!summary) return false;
  const s = summary.trim();
  if (s.length < 10 || s.length > 2000) return false;
  const low = s.toLowerCase();
  return !JUNK_SUMMARY_FRAGMENTS.some((f) => low.includes(f));
}

/** Resolve a possibly-relative URL against a base. Returns "" on failure. */
export function resolveUrl(rawUrl: string, base: string): string {
  if (!rawUrl) return "";
  try {
    return new URL(rawUrl, base).toString();
  } catch {
    return "";
  }
}

/**
 * Confirms a URL is reachable (HEAD then GET fallback).
 * Returns the final destination URL after redirects, or ok:false on failure.
 */
export async function fetchAndResolveUrl(
  url: string
): Promise<{ resolvedUrl: string; ok: boolean; status?: number; error?: string }> {
  // HEAD first — lightweight
  try {
    const r = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(8_000),
    });
    if (r.ok) return { resolvedUrl: r.url || url, ok: true, status: r.status };
    if (r.status === 404 || r.status === 410) {
      return { resolvedUrl: url, ok: false, status: r.status, error: `HTTP ${r.status}` };
    }
    // Some servers reject HEAD — fall through to GET
  } catch {
    // network error on HEAD — try GET
  }

  // GET fallback
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });
    if (r.ok) return { resolvedUrl: r.url || url, ok: true, status: r.status };
    return { resolvedUrl: url, ok: false, status: r.status, error: `HTTP ${r.status}` };
  } catch (e) {
    return { resolvedUrl: url, ok: false, error: e instanceof Error ? e.message : "Network error" };
  }
}

/**
 * Fetch article page and extract: title, summary, body text, author, date, og:image.
 * og:image / twitter:image are NOT restricted to same-domain — they are almost always
 * on CDNs and that is intentional. Only the <img> body fallback is filtered for
 * obvious junk (tiny, logo, icon, avatar).
 */
export async function extractArticleDetails(
  url: string,
  fallback?: Partial<ExtractedDetails>
): Promise<ExtractedDetails> {
  let html = "";
  let finalUrl = url;

  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA },
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (r.ok) {
      html = await r.text();
      finalUrl = r.url || url;
    }
  } catch (e) {
    console.warn(`[extractor] fetch failed for ${url}: ${(e as Error).message}`);
  }

  if (!html) {
    return {
      title:       fallback?.title,
      summary:     fallback?.summary,
      content:     fallback?.content || fallback?.summary || "",
      authorName:  fallback?.authorName,
      publishedAt: fallback?.publishedAt,
      thumbnailUrl: fallback?.thumbnailUrl,
    };
  }

  const $ = cheerio.load(html);

  // ── 1. Title ──────────────────────────────────────────────────────────────
  const rawTitle =
    $('meta[property="og:title"]').attr("content") ||
    $('meta[name="twitter:title"]').attr("content") ||
    $("title").first().text() ||
    $("h1").first().text();
  const title = rawTitle?.replace(/\s+/g, " ").trim();

  // ── 2. Summary ────────────────────────────────────────────────────────────
  const rawSummary =
    $('meta[property="og:description"]').attr("content") ||
    $('meta[name="twitter:description"]').attr("content") ||
    $('meta[name="description"]').attr("content");
  let summary = rawSummary?.replace(/\s+/g, " ").trim();

  // ── 3. Body text ─────────────────────────────────────────────────────────
  // Try common article containers first, then fall back to all <p> tags.
  const ARTICLE_SELECTORS = [
    "article", "[role='main']", ".post-content", ".entry-content",
    ".article-content", ".article-body", ".post-body", "main",
  ];
  let contentText = "";
  for (const sel of ARTICLE_SELECTORS) {
    const el = $(sel).first();
    if (el.length) {
      el.find("script, style, nav, footer, header, aside, noscript, iframe").remove();
      const txt = el.text().replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      if (txt.length > 200) { contentText = txt; break; }
    }
  }
  if (!contentText) {
    const paras: string[] = [];
    $("p").each((_, p) => {
      const t = $(p).text().trim();
      if (t.length > 40) paras.push(t);
    });
    contentText = paras.join("\n\n");
  }

  // If og:description is missing / bad, derive summary from body
  if (!isPlausibleSummary(summary)) {
    const first = contentText.split("\n\n")[0] || contentText;
    summary = first.slice(0, 500).trim();
  }

  // ── 4. Author ─────────────────────────────────────────────────────────────
  const rawAuthor =
    $('meta[name="author"]').attr("content") ||
    $('meta[property="article:author"]').attr("content") ||
    $('[rel="author"]').first().text() ||
    $(".author-name, .author, .byline").first().text();
  const authorName = rawAuthor?.replace(/\s+/g, " ").trim() || fallback?.authorName;

  // ── 5. Published date ─────────────────────────────────────────────────────
  let publishedAt: Date | undefined;
  const rawDate =
    $('meta[property="article:published_time"]').attr("content") ||
    $('meta[name="publish-date"]').attr("content") ||
    $('meta[name="pubdate"]').attr("content") ||
    $("time[datetime]").first().attr("datetime");
  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) publishedAt = d;
  }

  // ── 6. Thumbnail image ────────────────────────────────────────────────────
  // Priority: og:image → twitter:image → first substantial <img>
  // NOTE: og/twitter images are almost always CDN URLs on different domains.
  // We do NOT restrict to same-domain for those — that was the previous bug.
  let thumbnailUrl: string | undefined;

  const ogImg  = $('meta[property="og:image"]').attr("content");
  const twImg  = $('meta[name="twitter:image"]').attr("content");
  const candImg = ogImg || twImg;

  if (candImg) {
    const resolved = resolveUrl(candImg.trim(), finalUrl);
    if (resolved && resolved.startsWith("http")) thumbnailUrl = resolved;
  }

  // Body <img> fallback (only if still no thumbnail)
  if (!thumbnailUrl) {
    const articleEl =
      $("article").first() ||
      $("[role='main']").first() ||
      $("main").first() ||
      $("body");

    articleEl.find("img").each((_, imgEl) => {
      if (thumbnailUrl) return;
      const src = $(imgEl).attr("src");
      if (!src || src.startsWith("data:")) return;
      const resolved = resolveUrl(src.trim(), finalUrl);
      if (!resolved || !resolved.startsWith("http")) return;

      const cls = ($(imgEl).attr("class") || "").toLowerCase();
      const alt = ($(imgEl).attr("alt")   || "").toLowerCase();
      const srcl = src.toLowerCase();
      const isJunk = ["logo", "avatar", "icon", "spacer", "pixel", "badge", "spinner"]
        .some((kw) => cls.includes(kw) || alt.includes(kw) || srcl.includes(kw));
      if (isJunk) return;

      const w = parseInt($(imgEl).attr("width") || "0", 10);
      const h = parseInt($(imgEl).attr("height") || "0", 10);
      if ((w > 0 && w < 80) || (h > 0 && h < 80)) return;

      thumbnailUrl = resolved;
    });
  }

  return {
    title:        isPlausibleTitle(title)   ? title   : fallback?.title,
    summary:      isPlausibleSummary(summary) ? summary : fallback?.summary,
    content:      contentText || fallback?.content || fallback?.summary || "",
    authorName:   authorName  || fallback?.authorName,
    publishedAt:  publishedAt || fallback?.publishedAt,
    thumbnailUrl: thumbnailUrl || fallback?.thumbnailUrl,
  };
}
