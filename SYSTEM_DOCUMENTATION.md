# Ruro Daily System Documentation

This document describes the design, features, architecture, and backend systems powering the Ruro Daily web portal.

---

## 1. Core Functionality & Purpose
Ruro Daily is an automated AI news and research aggregator. It collects model releases, funding rounds, research papers, and technology updates from around the web, presenting them in a curated feed.

---

## 2. Scraping Pipeline (`src/lib/scraper`)

The scraper is the core ingestion engine. It runs automatically (configured via cron jobs or manually triggered from the admin panel) and is managed primarily through [src/lib/scraper/index.ts](file:///c:/Users/aarup/OneDrive/Desktop/repository%20folder/trafyai/src/lib/scraper/index.ts).

### Ingestion Source Types
The system supports multiple ingestion modes, defined by `SourceType`:
- **RSS & API**: Reads structured feeds from standard content hubs.
- **SCRAPE**: Crawls raw HTML from target list/index pages.
- **ARXIV**: Pulls academic preprints and research papers.
- **REDDIT**: Scrapes posts from relevant AI subreddits.
- **GITHUB**: Monitors repositories and developer trends.

### Processing Steps
1. **Concurrency Lock**: To prevent race conditions, the database sets a `scraper-lock` state. If another scraping run is already running, subsequent requests are safely blocked.
2. **URL Resolution**: The engine resolves raw URLs to their canonical destination (e.g. following redirects).
3. **Deduplication**: Validated URLs are checked against existing records in the `articles` database table. If duplicate text is detected, the process skips inserting a new record.
4. **Metadata Extraction**: Using [extractor.ts](file:///c:/Users/aarup/OneDrive/Desktop/repository%20folder/trafyai/src/lib/scraper/extractor.ts), the scraper reads and formats the main article text, titles, publish dates, reading times, and thumbnails.
5. **Quality Gates**: The article is validated against:
   - Zod schema constraints.
   - Word count and text quality filters.
   - Text plausibility rules (e.g., rejecting broken characters or placeholder text).
6. **Persistence**: Approved articles are inserted directly into the database with a state of `PUBLISHED` alongside a calculated `importanceScore`.

---

## 3. Newsletter Ingestion Flow

The portal contains built-in forms allowing users to subscribe to newsletter updates.

* **API Endpoints**: The client component triggers `POST` requests to `/api/newsletter`.
* **Database Target**: Subscriptions are upserted into the `newsletter_subscribers` table via Prisma.
* **Storage Model**:
  ```prisma
  model NewsletterSubscriber {
    id           String   @id @default(cuid())
    email        String   @unique
    subscribedAt DateTime @default(now())
    isActive     Boolean  @default(true)
    source       String?
  }
  ```
  This tracks subscription status, timestamp, and source (e.g. `"footer"` vs `"hero"`).

---

## 4. Admin Dashboard Access

Administrators have access to a secure dashboard located at `/admin`.

* **Newsletter Management**: Located at `/admin/newsletter` ([page.tsx](file:///c:/Users/aarup/OneDrive/Desktop/repository%20folder/trafyai/src/app/admin/%28protected%29/newsletter/page.tsx)), this page counts and lists the active subscribers with registration sources.
* **Logs & Control**: Scraper runs and logs are recorded in the `scrape_logs` model, allowing administrators to monitor run durations, errors, and new item counts.
