import { recentEditionDates, formatEditionDate } from "@/lib/edition";
import { SITE } from "@/lib/site";
import { ttsEnabled } from "@/lib/tts";

export const dynamic = "force-dynamic";

/** Podcast RSS — subscribe in Apple Podcasts, Spotify, Pocket Casts, etc. */
export function GET() {
  if (!ttsEnabled()) return new Response("Podcast not available yet", { status: 404 });

  const items = recentEditionDates(14)
    .map((date) => {
      const url = `${SITE.url}/api/podcast/${date}`;
      return `
    <item>
      <title>${formatEditionDate(date)}</title>
      <description>The AI, Tech and Finance stories that matter today, in about four minutes.</description>
      <link>${SITE.url}/edition/${date}</link>
      <guid isPermaLink="false">ruro-daily-${date}</guid>
      <pubDate>${new Date(`${date}T00:30:00Z`).toUTCString()}</pubDate>
      <enclosure url="${url}" type="audio/mpeg" length="0"/>
      <itunes:explicit>false</itunes:explicit>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <language>en-in</language>
    <description>${SITE.tagline} A four-minute daily briefing.</description>
    <itunes:author>${SITE.name}</itunes:author>
    <itunes:image href="${SITE.url}/ruro-mark.svg"/>
    <itunes:category text="News"><itunes:category text="Daily News"/></itunes:category>
    <itunes:explicit>false</itunes:explicit>
    ${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
