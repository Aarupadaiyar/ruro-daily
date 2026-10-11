import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE } from "@/lib/site";

// Force dynamic rendering so Next.js never calls this during `next build`.
// Without this, Next.js tries to statically generate the sitemap at build
// time — before the Vercel runtime has a live DB connection — which throws
// PrismaClientInitializationError and fails the whole build.
// With `dynamic = "force-dynamic"` the sitemap is generated fresh on every
// request (just like a normal dynamic route), so Prisma only runs in the
// live environment where DATABASE_URL is available.
export const dynamic = "force-dynamic";

const base =
    SITE.url;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Wrap in try/catch so a DB hiccup returns a minimal sitemap rather than a
  // 500 — important during zero-downtime deploys and cold starts.
  let articles: { slug: string; updatedAt: Date }[] = [];
  try {
    articles = await db.article.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 5000,
    });
  } catch (err) {
    console.error("[sitemap] DB query failed, returning static-only sitemap:", err);
  }

  return [
    {
      url: `${base}`,
      changeFrequency: "hourly",
      priority: 1,
    },
    ...["/bites", "/ai", "/tech", "/finance", "/finance/beginners"].map((path) => ({
      url: `${base}${path}`,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),
    { url: `${base}/sources`, changeFrequency: "weekly", priority: 0.4 },
    ...articles.map((a) => ({
      url: `${base}/news/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
