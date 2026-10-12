import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSignupSchema } from "@/lib/validations/article";
import { brevoAddContact, sheetsAppend } from "@/lib/newsletter/channels";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = newsletterSignupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const email = parsed.data.email.trim().toLowerCase();

  await db.newsletterSubscriber.upsert({
    where: { email },
    create: { email, source: parsed.data.source },
    update: { isActive: true },
  });

  // Mirror to Brevo and the Google Sheet. Best-effort: the DB is the source of
  // truth, so a slow or failing integration never blocks the signup.
  const results = await Promise.allSettled([brevoAddContact(email), sheetsAppend({ email, source: parsed.data.source, action: "subscribe" })]);
  for (const r of results) {
    if (r.status === "rejected") console.error("[newsletter] sync failed:", r.reason);
    else if (!r.value.ok && !("skipped" in r.value && r.value.skipped)) console.error("[newsletter]", r.value.error);
  }

  return NextResponse.json({ ok: true });
}
