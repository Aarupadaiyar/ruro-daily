import { BOT_USER_AGENT } from "@/lib/site";
import type { SourceConfig } from "../sources";
import type { ScrapedArticle } from "@/lib/validations/article";

interface RedditPost {
  data: {
    title: string;
    selftext: string;
    permalink: string;
    url: string;
    author: string;
    thumbnail: string;
    created_utc: number;
    score: number;
  };
}

// Reddit's public .json endpoints work without auth for read-only, low-volume
// use, but are rate-limited hard — one request per source per run is enough.
export async function fetchRedditSource(source: SourceConfig): Promise<Partial<ScrapedArticle>[]> {
  const res = await fetch(source.feedUrl, {
    headers: { "User-Agent": BOT_USER_AGENT },
  });
  if (!res.ok) throw new Error(`Reddit fetch failed for ${source.slug}: ${res.status}`);

  const json = (await res.json()) as { data: { children: RedditPost[] } };

  return json.data.children
    .filter((post) => post.data.score >= 20) // filter low-signal posts
    .slice(0, 15)
    .map((post) => ({
      title: post.data.title,
      summary: post.data.selftext.slice(0, 400) || `${post.data.score} upvotes on r/${source.name}`,
      content: post.data.selftext,
      sourceUrl: `https://www.reddit.com${post.data.permalink}`,
      sourceSlug: source.slug,
      authorName: `u/${post.data.author}`,
      thumbnailUrl: post.data.thumbnail?.startsWith("http") ? post.data.thumbnail : undefined,
      categorySlug: source.defaultCategorySlug,
      publishedAt: new Date(post.data.created_utc * 1000),
      importanceScore: Math.min(100, post.data.score / 5),
    }));
}
