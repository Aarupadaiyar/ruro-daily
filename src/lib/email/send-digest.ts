import { db } from "@/lib/db";
import { getResend, ADMIN_EMAILS } from "@/lib/email/resend";
import { renderDigestEmail, type DigestArticle } from "@/lib/email/digest-template";

/**
 * Builds and sends the admin-only daily digest email.
 * Plain library function — NOT exported from any route.ts so Next.js
 * production type-checking stays happy. Imported directly by:
 *   - src/app/api/cron/digest/route.ts  (standalone manual trigger)
 *   - src/app/api/cron/scrape/route.ts  (called only when ?digest=true)
 */
export async function sendDailyDigest() {
  if (ADMIN_EMAILS.length === 0) {
    return { sent: false, reason: "No ADMIN_EMAILS configured" };
  }
  const resend = getResend();
  if (!resend) {
    return { sent: false, reason: "No RESEND_API_KEY configured" };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await db.article.findMany({
    where: { scrapedAt: { gte: since } },
    include: { category: true },
    orderBy: { importanceScore: "desc" },
    take: 200,
  });

  const toDigestItem = (a: (typeof recent)[number]): DigestArticle => ({
    title: a.title,
    summary: a.summary,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/articles/${a.id}/edit`,
    category: a.category.name,
  });

  const byCategory = (slug: string) =>
    recent.filter((a) => a.category.slug === slug).map(toDigestItem);

  const html = renderDigestEmail({
    date: new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }),
    topNews:       recent.slice(0, 10).map(toDigestItem),
    funding:       byCategory("funding"),
    research:      byCategory("research"),
    openSource:    byCategory("open-source"),
    modelReleases: byCategory("llms"),
    hiringTrends:  byCategory("hiring"),
    adminReviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/articles?status=PENDING`,
  });

  await resend.emails.send({
    from: process.env.DIGEST_FROM_EMAIL ?? "digest@ruro.in",
    to:   ADMIN_EMAILS,
    subject: "Ruro Daily: today's AI, Tech & Finance digest",
    html,
  });

  return { sent: true, sentTo: ADMIN_EMAILS.length, articlesIncluded: recent.length };
}
