import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/newsletter/token";
import { sheetsAppend } from "@/lib/newsletter/channels";

/**
 * POST /api/newsletter/unsubscribe?e=<email>&t=<token>
 * Used by the confirm button on /unsubscribe and by mail clients' one-click
 * "List-Unsubscribe-Post" (which POSTs to the same URL).
 */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const token = url.searchParams.get("t") ?? "";
  if (!email || !verifyUnsubscribeToken(email, token)) {
    return NextResponse.json({ error: "Invalid unsubscribe link" }, { status: 400 });
  }

  await db.newsletterSubscriber.updateMany({ where: { email }, data: { isActive: false } });
  await sheetsAppend({ email, action: "unsubscribe" }).catch(() => undefined);
  return NextResponse.json({ ok: true });
}
