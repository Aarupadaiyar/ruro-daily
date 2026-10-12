/**
 * Single source of truth for brand + URL config. Change the name, domain or
 * tagline here and every page, feed, email and bot user-agent follows.
 */
export const SITE = {
  name: "Ruro Daily",
  shortName: "Ruro",
  tagline: "AI, Tech & Finance — fed to you daily.",
  description:
    "Ruro Daily is a free daily news feeder for AI, Tech and Finance. Top stories in quick Bites, a Finance desk for professionals, and plain-English finance for beginners — pulled from 150+ open news sources and independent writers.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://daily.ruro.in").replace(/\/$/, ""),
  parentUrl: process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://ruro.in",
  /** Public channel links; each is hidden on the site until it is set. */
  telegramUrl: process.env.NEXT_PUBLIC_TELEGRAM_URL || "",
  whatsappUrl: process.env.NEXT_PUBLIC_WHATSAPP_CHANNEL_URL || "",
} as const;

/** Identifies our scraper politely to the sites we read from. */
export const BOT_USER_AGENT = `RuroDailyBot/1.0 (+${SITE.url})`;
