import { SITE } from "@/lib/site";
import { db } from "@/lib/db";
import { DEFAULT_MAX_ITEMS, SOURCES, maxAgeDaysFor, type SourceConfig } from "./sources";
import { classifyArticle } from "./classify";
import { getCategory } from "@/lib/categories";
import { usableThumbnail } from "@/lib/images";
import { gistFromContent, headlineFromContent, isJunkTitle, isUsefulSummary } from "@/lib/gist";
import { fetchRssSource } from "./fetchers/rss";
import { fetchScrapeSource } from "./fetchers/scrape";
import { fetchArxivSource } from "./fetchers/arxiv";
import { fetchRedditSource } from "./fetchers/reddit";
import { findClusterMatch } from "./dedupe";
import { computeImportanceScore } from "./scoring";
import { scrapedArticleSchema, type ScrapedArticle } from "@/lib/validations/article";
import {
  resolveUrl,
  fetchAndResolveUrl,
  extractArticleDetails,
  isPlausibleTitle,
  isPlausibleSummary,
} from "./extractor";
import readingTime from "reading-time";

export interface ScrapeRunSummary {
  sourceSlug: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
  itemsFound: number;
  itemsNew: number;
  itemsUpdated: number;
  itemsDuped: number;
  itemsSkipped: number;
  durationMs: number;
  errorMessage?: string;
}

const FETCHERS: Record<string, (s: SourceConfig) => Promise<Partial<ScrapedArticle>[]>> = {
  RSS:    fetchRssSource,
  SCRAPE: fetchScrapeSource,
  ARXIV:  fetchArxivSource,
  REDDIT: fetchRedditSource,
  API:    fetchRssSource,
  GITHUB: fetchScrapeSource,
};

function getMinInterval(slug: string, type: string): number {
  if (type === "REDDIT") return 60; // Reddit rate limits are strict
  if (type === "ARXIV") return 30;  // arXiv asks for throttled access
  if (type === "SCRAPE") return 15; // Scraped HTML listing pages
  return 10;                        // Default RSS/API
}

/**
 * Entry point called by both the cron route and the admin "run scraper" button.
 * Iterates every active source, fetches, validates, dedupes, scores, and persists
 * articles as PUBLISHED. A single source failure never blocks the rest of the run.
 */
export async function runFullScrape(force = false): Promise<ScrapeRunSummary[]> {
  // ── 1. Concurrency Guard ───────────────────────────────────────────────
  // Find or create the special 'scraper-lock' system source record
  const lockSource = await db.source.upsert({
    where: { slug: "scraper-lock" },
    create: {
      slug: "scraper-lock",
      name: "Scraper Concurrency Lock",
      type: "API",
      homepageUrl: SITE.url,
      isActive: false,
    },
    update: {},
  });

  // Check if there is an active lock (status === PARTIAL) in the last 10 minutes
  const activeLock = await db.scrapeLog.findFirst({
    where: {
      sourceId: lockSource.id,
      status: "PARTIAL",
      runAt: { gte: new Date(Date.now() - 10 * 60 * 1000) },
    },
    orderBy: { runAt: "desc" },
  });

  if (!force && activeLock) {
    console.log(`[SKIP RUN] Another scrape run is already in progress (started at ${activeLock.runAt.toISOString()})`);
    return [
      {
        sourceSlug: "scraper-lock",
        status: "FAILED",
        itemsFound: 0,
        itemsNew: 0,
        itemsUpdated: 0,
        itemsDuped: 0,
        itemsSkipped: 0,
        durationMs: 0,
        errorMessage: "skipped — previous run still in progress",
      },
    ];
  }

  // Create lock log to PARTIAL (in progress)
  const currentLockLog = await db.scrapeLog.create({
    data: {
      sourceId: lockSource.id,
      status: "PARTIAL",
      runAt: new Date(),
    },
  });

  const summaries: ScrapeRunSummary[] = [];

  try {
    // Run sources in parallel (bounded) — 80+ feeds sequentially would blow
    // past the cron's time budget. A failure in one never blocks the rest.
    const activeSources = SOURCES.filter((s) => s.slug !== "scraper-lock");
    summaries.push(...(await mapPool(activeSources, SOURCE_CONCURRENCY, (s) => scrapeSource(s, force))));
  } finally {
    // Release the concurrency lock log to SUCCESS
    await db.scrapeLog.update({
      where: { id: currentLockLog.id },
      data: {
        status: "SUCCESS",
        durationMs: Date.now() - currentLockLog.runAt.getTime(),
      },
    });
  }

  return summaries;
}

const SOURCE_CONCURRENCY = 6;

async function scrapeSource(sourceConfig: SourceConfig, force: boolean): Promise<ScrapeRunSummary> {
  const start = Date.now();
  let itemsFound = 0, itemsNew = 0, itemsUpdated = 0, itemsDuped = 0, itemsSkipped = 0;

  try {
    // Ensure source row exists
    const source = await db.source.upsert({
      where:  { slug: sourceConfig.slug },
      create: {
        slug:        sourceConfig.slug,
        name:        sourceConfig.name,
        type:        sourceConfig.type,
        feedUrl:     sourceConfig.feedUrl,
        homepageUrl: sourceConfig.homepageUrl,
      },
      update: {},
    });

    // Rate limit / backoff check
    if (!force) {
      const lastSuccess = await db.scrapeLog.findFirst({
        where: { sourceId: source.id, status: "SUCCESS" },
        orderBy: { runAt: "desc" },
      });
      if (lastSuccess) {
        const elapsedMinutes = (Date.now() - lastSuccess.runAt.getTime()) / (1000 * 60);
        const minInterval = getMinInterval(sourceConfig.slug, sourceConfig.type);
        if (elapsedMinutes < minInterval) {
          console.log(`[SKIP FETCH] ${sourceConfig.slug} was successfully scraped ${Math.round(elapsedMinutes)} mins ago (min: ${minInterval} mins)`);
          return({
            sourceSlug: sourceConfig.slug,
            status: "SUCCESS",
            itemsFound: 0,
            itemsNew: 0,
            itemsUpdated: 0,
            itemsDuped: 0,
            itemsSkipped: 0,
            durationMs: 0,
          });
        }
      }
    }

    const fetcher = FETCHERS[sourceConfig.type];
    if (!fetcher) throw new Error(`No fetcher for type "${sourceConfig.type}"`);

    // Cap per-source volume and drop stale items (old posts in personal-blog
    // feeds, archives in big outlet feeds) before doing any per-item network work.
    const cutoff = Date.now() - maxAgeDaysFor(sourceConfig) * 86_400_000;
    const rawItems = (await fetcher(sourceConfig))
      .filter((r) => !r.publishedAt || new Date(r.publishedAt).getTime() >= cutoff)
      .filter((r) => !sourceConfig.exclude?.test(r.title ?? ""))
      .slice(0, sourceConfig.maxItems ?? DEFAULT_MAX_ITEMS);
    itemsFound = rawItems.length;
    console.log(`[${sourceConfig.slug}] fetched ${itemsFound} recent items`);

    for (const raw of rawItems) {
      // ── 1. Resolve & validate URL ────────────────────────────────────────
      const rawUrl = resolveUrl(raw.sourceUrl ?? "", sourceConfig.homepageUrl);
      if (!rawUrl) {
        console.log(`  [SKIP] empty URL`);
        itemsSkipped++;
        continue;
      }

      // Fast path: already stored under this exact URL → skip all page fetches.
      if (await db.article.findUnique({ where: { sourceUrl: rawUrl }, select: { id: true } })) {
        itemsDuped++;
        continue;
      }

      const check = await fetchAndResolveUrl(rawUrl);
      if (!check.ok) {
        console.log(`  [SKIP] ${check.status ?? "ERR"} ${rawUrl} — ${check.error ?? ""}`);
        itemsSkipped++;
        continue;
      }
      const resolvedUrl = check.resolvedUrl;

      // ── 2. Check for existing DB record (update-on-change) ───────────────
      const existing = await db.article.findUnique({ where: { sourceUrl: resolvedUrl } });

      // ── 3. Fetch article page for quality metadata + image ───────────────
      const extracted = await extractArticleDetails(resolvedUrl, {
        title:       raw.title,
        summary:     raw.summary,
        content:     raw.content,
        authorName:  raw.authorName,
        publishedAt: raw.publishedAt,
        thumbnailUrl: raw.thumbnailUrl,
      });

      // ── 4. Quality gates ─────────────────────────────────────────────────
      if (!isPlausibleTitle(extracted.title)) {
        console.log(`  [SKIP] bad title: "${extracted.title?.slice(0, 60)}"`);
        itemsSkipped++;
        continue;
      }
      if (!isPlausibleSummary(extracted.summary)) {
        console.log(`  [SKIP] bad summary (${extracted.summary?.length ?? 0} chars) for ${resolvedUrl}`);
        itemsSkipped++;
        continue;
      }
      if (!extracted.content?.trim()) {
        console.log(`  [SKIP] empty content for ${resolvedUrl}`);
        itemsSkipped++;
        continue;
      }

      // ── 4b. Real headline + gist ─────────────────────────────────────────
      // Some feeds give the site name as the title or page chrome as the
      // summary; rebuild both from the body, and skip items with no real text.
      let title = extracted.title!;
      if (isJunkTitle(title)) title = headlineFromContent(extracted.content);
      const summary = isUsefulSummary(extracted.summary, title) ? extracted.summary! : gistFromContent(extracted.content, title);
      if (!title || !summary) {
        console.log(`  [SKIP] no real headline/summary for ${resolvedUrl}`);
        itemsSkipped++;
        continue;
      }

      // ── 5. Validate with Zod schema ──────────────────────────────────────
      const parsed = scrapedArticleSchema.safeParse({
        ...raw,
        title,
        summary:         summary.slice(0, 590),
        content:         extracted.content,
        sourceUrl:       resolvedUrl,
        thumbnailUrl:    usableThumbnail(extracted.thumbnailUrl) ?? undefined,
        authorName:      extracted.authorName,
        publishedAt:     extracted.publishedAt ?? raw.publishedAt ?? new Date(),
        importanceScore: raw.importanceScore ?? 0,
        tags: [],
      });

      if (!parsed.success) {
        const errs = JSON.stringify(parsed.error.flatten().fieldErrors);
        console.log(`  [SKIP] schema fail for ${resolvedUrl}: ${errs}`);
        itemsSkipped++;
        continue;
      }

      const article = parsed.data;

      // ── 6a. UPDATE if duplicate with changed content ─────────────────────
      if (existing) {
        const changed =
          existing.title        !== article.title ||
          existing.summary      !== article.summary ||
          existing.thumbnailUrl !== article.thumbnailUrl;

        if (changed) {
          await db.article.update({
            where: { id: existing.id },
            data: {
              title:        article.title,
              summary:      article.summary,
              thumbnailUrl: article.thumbnailUrl,
              updatedAt:    new Date(),
            },
          });
          console.log(`  [UPDATE] ${resolvedUrl}`);
          itemsUpdated++;
        } else {
          itemsDuped++;
        }
        continue;
      }

      // ── 6b. INSERT new article ────────────────────────────────────────────
      const clusterId = await findClusterMatch(article);

      const categorySlug = sourceConfig.classify
        ? classifyArticle(article.title, article.summary, article.categorySlug)
        : article.categorySlug;
      const categoryName = getCategory(categorySlug)?.name ?? titleCase(categorySlug);
      const category = await db.category.upsert({
        where:  { slug: categorySlug },
        create: { slug: categorySlug, name: categoryName },
        update: { name: categoryName },
      });

      const author = article.authorName
        ? await db.author.upsert({
            where:  { slug: slugify(article.authorName) },
            create: { slug: slugify(article.authorName), name: article.authorName },
            update: {},
          })
        : null;

      const slug = `${slugify(article.title)}-${Date.now().toString(36)}`;

      await db.article.create({
        data: {
          slug,
          title:          article.title,
          summary:        article.summary,
          content:        article.content,
          thumbnailUrl:   article.thumbnailUrl ?? null,
          sourceUrl:      resolvedUrl,
          sourceId:       source.id,
          categoryId:     category.id,
          authorId:       author?.id ?? null,
          status:         "PUBLISHED",
          publishedAt:    article.publishedAt,
          importanceScore: computeImportanceScore(article),
          readingTimeMins: Math.max(1, Math.ceil(readingTime(article.content).minutes)),
          clusterId:      clusterId ?? null,
        },
      });

      console.log(`  [NEW] "${article.title.slice(0, 70)}"`);
      itemsNew++;
    }

    await logRun(source.id, "SUCCESS", itemsFound, itemsNew, itemsDuped, Date.now() - start);
    return({
      sourceSlug: sourceConfig.slug, status: "SUCCESS",
      itemsFound, itemsNew, itemsUpdated, itemsDuped, itemsSkipped,
      durationMs: Date.now() - start,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[${sourceConfig.slug}] FAILED: ${message}`);
    const src = await db.source.findUnique({ where: { slug: sourceConfig.slug } });
    if (src) await logRun(src.id, "FAILED", itemsFound, itemsNew, itemsDuped, Date.now() - start, message);
    return({
      sourceSlug: sourceConfig.slug, status: "FAILED",
      itemsFound, itemsNew, itemsUpdated, itemsDuped, itemsSkipped,
      durationMs: Date.now() - start, errorMessage: message,
    });
  }
}

// ── helpers ────────────────────────────────────────────────────────────────

/** Promise.all with at most `limit` tasks in flight; preserves input order. */
async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i] as T);
    }
  });
  await Promise.all(workers);
  return results;
}

async function logRun(
  sourceId: string, status: "SUCCESS" | "FAILED",
  itemsFound: number, itemsNew: number, itemsDuped: number,
  durationMs: number, errorMessage?: string
) {
  await db.scrapeLog.create({
    data: { sourceId, status, itemsFound, itemsNew, itemsDuped, durationMs, errorMessage },
  });
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function titleCase(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
