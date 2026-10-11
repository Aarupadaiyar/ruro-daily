# Ruro Daily

**AI, Tech & Finance — fed to you daily.** A free daily news feeder at [daily.ruro.in](https://daily.ruro.in), part of [ruro.in](https://ruro.in).

Ruro Daily reads **150+ open news sources and independent writers** (newsrooms, regulators, AI labs, Substack writers, community sites), dedupes and ranks their stories, and serves them as a calm, light, newspaper-style reading experience.

## Features

| Page | What it does |
|---|---|
| `/` **Top Stories** | Lead story + "also leading", rotating Bites strip, AI / Tech / Finance sections and a strictly newest-first Latest grid. Picks rotate on every visit (weighted toward importance) so returning readers see a fresh mix. |
| `/bites` **Bites** | The day's top, main and most-covered stories, each in 1–2 sentences. Filter by AI / Tech / Finance. |
| `/finance` **Finance Pro** | Dense desk for professionals: Markets, Central banks & policy, Economy, Business, Crypto, Personal finance. |
| `/finance/beginners` **Finance for Beginners** | Top finance stories in plain English + "what this means for you", inline jargon explanations, one-minute basics lessons and a glossary. |
| `/ai`, `/tech`, `/category/[slug]` | Pillar and category pages. |
| `/search` | Ranked keyword search (title > summary, recency boost) with topic filter. Instant suggestions in the header. |
| `/sources` | Every source, grouped by topic and kind (outlet, official, lab, independent writer, community). |
| `/rss.xml`, `/sitemap.xml` | Feeds for readers and search engines. |
| `/admin` | Magic-link admin: articles, sources, scrape logs, newsletter. |

All summarising is **rule-based and free** (no LLM key needed): see `src/lib/bites.ts` and `src/lib/finance/`.

## Running locally

```bash
npm install
cp .env.example .env      # Postgres URL, NextAuth secret, ADMIN_EMAILS, CRON_SECRET, Resend key
npm run db:push
npm run scrape:manual     # pull real articles from every source
npm run dev
```

## How the pipeline works

1. **Sources** — `src/lib/scraper/sources.ts`. Each source has a `kind`, default category, optional `classify` (keyword re-categorisation for mixed feeds), `maxItems` and `maxAgeDays`.
2. **Scrape** — `src/lib/scraper/index.ts` runs sources 6 at a time, skips already-stored URLs before any page fetch, extracts metadata, drops generic logo thumbnails (`src/lib/images.ts`), clusters near-duplicate headlines across outlets, and scores importance (`scoring.ts`).
3. **Schedule** — Vercel Cron (`vercel.json`) runs daily at 07:00 with the email digest; `.github/workflows/scrape.yml` triggers a scrape every 2 hours (needs `SITE_URL` and `CRON_SECRET` repo secrets).
4. **Render** — all public queries go through `src/lib/articles.ts`.

## Design system

Light "paper" reading theme with muted accents only — see `tailwind.config.ts` (tokens are mirrored in `src/styles/design-tokens.ts` for the email template). Headlines and article bodies use Source Serif 4; UI uses Inter; the RURO wordmark uses Cormorant Garamond. Brand name, domain and tagline live in one place: `src/lib/site.ts`.

The site used to be "Trafy Intelligence" under `/intelligence`; those URLs permanently redirect to the new paths (`next.config.mjs`).
