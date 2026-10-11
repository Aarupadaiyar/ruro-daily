import { BOT_USER_AGENT } from "@/lib/site";
import Parser from "rss-parser";
import * as cheerio from "cheerio";
import type { SourceConfig } from "../sources";
import type { ScrapedArticle } from "@/lib/validations/article";

const parser = new Parser({
  timeout: 15_000,
  headers: { "User-Agent": BOT_USER_AGENT },
});

export async function fetchRssSource(source: SourceConfig): Promise<Partial<ScrapedArticle>[]> {
  const res = await fetch(source.feedUrl, {
    headers: { "User-Agent": BOT_USER_AGENT },
  });
  if (!res.ok) throw new Error(`RSS fetch failed for ${source.slug}: ${res.status}`);
  let xmlText = await res.text();

  // Fix unescaped ampersands that break XML parser
  xmlText = xmlText.replace(/&(?!(amp|lt|gt|quot|apos|#\d+|#[xX][0-9a-fA-F]+);)/g, "&amp;");

  let feedItems: any[] = [];
  try {
    const feed = await parser.parseString(xmlText);
    feedItems = feed.items ?? [];
  } catch (err) {
    console.warn(`rss-parser failed for ${source.slug}, falling back to Cheerio XML parsing. Error: ${(err as Error).message}`);
    const $ = cheerio.load(xmlText, { xmlMode: true });
    $("item, entry").each((_, el) => {
      const node = $(el);
      const title = node.find("title").text().trim();
      const link = node.find("link").attr("href") || node.find("link").text().trim();
      const contentSnippet = node.find("description").text().trim() || node.find("summary").text().trim();
      const contentEncoded = node.find("content\\:encoded, content").text().trim();
      const creator = node.find("dc\\:creator, creator, author > name").text().trim();
      const pubDate = node.find("pubDate, published, updated").text().trim();

      feedItems.push({
        title,
        link,
        contentSnippet,
        content: contentEncoded || contentSnippet,
        creator,
        isoDate: pubDate,
      });
    });
  }

  return feedItems.slice(0, 25).map((item) => ({
    title: item.title ?? "Untitled",
    summary: stripHtml(item.contentSnippet ?? item.summary ?? "").slice(0, 500),
    content: item["content:encoded"] || item.content || item.summary || item.contentSnippet || "",
    sourceUrl: item.link ?? "",
    sourceSlug: source.slug,
    thumbnailUrl: extractThumbnail(item),
    authorName: item.creator ?? item.author,
    categorySlug: source.defaultCategorySlug,
    publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
  }));
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function extractThumbnail(item: Parser.Item & Record<string, unknown>): string | undefined {
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  const mediaContent = item["media:content"] as { $: { url?: string } } | undefined;
  if (mediaContent?.$.url) return mediaContent.$.url;

  const contentStr = (item["content:encoded"] as string | undefined) || (item.content as string | undefined) || "";
  const match = contentStr.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1];
}
