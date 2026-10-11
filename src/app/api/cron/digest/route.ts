import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resend, ADMIN_EMAILS } from "@/lib/email/resend";
import { renderDigestEmail, type DigestArticle } from "@/lib/email/digest-template";

/**
 * Builds and sends the admin-only digest email. Exported as a plain function
 * (not just a route handler) so /api/cron/scrape can call it directly right
 * after a scrape run finishes — see the note in that file about why this
 * matters on Vercel's free Hobby plan.
 */
export async function sendDailyDigest() {
  if (ADMIN_EMAILS.length === 0) {
    return { sent: false, reason: "No ADMIN_EMAILS configured" };
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

  const byCategory = (slug: string) => recent.filter((a) => a.category.slug === slug).map(toDigestItem);

  const html = renderDigestEmail({
    date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    topNews: recent.slice(0, 10).map(toDigestItem),
    funding: byCategory("funding"),
    research: byCategory("research"),
    openSource: byCategory("open-source"),
    modelReleases: byCategory("llms"),
    hiringTrends: byCategory("hiring"),
    adminReviewUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/admin/articles?status=PENDING`,
  });

  await resend.emails.send({
    from: process.env.DIGEST_FROM_EMAIL ?? "digest@ruro.in",
    to: ADMIN_EMAILS, // admin-only, never public — see product brief
    subject: "Today's AI News Digest",
    html,
  });

  return { sent: true, sentTo: ADMIN_EMAILS.length, articlesIncluded: recent.length };
}

// Kept as a standalone route too, gated the same way as the scrape cron —
// useful for manually resending a digest without re-running the scraper.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendDailyDigest();
  return NextResponse.json(result);
}
