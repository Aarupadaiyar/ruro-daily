import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEdition } from "@/lib/edition";
import { brevoSendBatch, telegramPost, type EmailMessage } from "@/lib/newsletter/channels";
import { emailSubject, renderEditionEmail, renderEditionText, renderTelegram } from "@/lib/newsletter/compose";
import { unsubscribeToken } from "@/lib/newsletter/token";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Morning send: today's edition → every active subscriber (Brevo) and the
 * Telegram channel. Channels that aren't configured are skipped, not failed.
 * Add ?only=telegram or ?only=email to send just one; ?dry=1 to preview counts.
 */
export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const only = req.nextUrl.searchParams.get("only");
  const dry = req.nextUrl.searchParams.get("dry") === "1";

  const edition = await getEdition();
  if (edition.bites.length === 0) return NextResponse.json({ sent: false, reason: "Edition is empty" });

  const result: Record<string, unknown> = { date: edition.date, stories: edition.bites.length };

  if (only !== "telegram") {
    const subscribers = await db.newsletterSubscriber.findMany({ where: { isActive: true }, select: { email: true } });
    const subject = emailSubject(edition);
    const messages: EmailMessage[] = subscribers.map(({ email }) => {
      const q = `e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
      const pageUrl = `${SITE.url}/unsubscribe?${q}`;
      return {
        to: email,
        subject,
        html: renderEditionEmail(edition, pageUrl),
        text: renderEditionText(edition, pageUrl),
        unsubscribeUrl: `${SITE.url}/api/newsletter/unsubscribe?${q}`,
      };
    });
    result.email = dry ? { wouldSend: messages.length } : await brevoSendBatch(messages);
  }

  if (only !== "email") {
    result.telegram = dry ? { preview: renderTelegram(edition).slice(0, 300) } : await telegramPost(renderTelegram(edition));
  }

  return NextResponse.json(result);
}
