import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Signed unsubscribe tokens — lets a subscriber unsubscribe from a link in
 * the email without logging in, while nobody can unsubscribe someone else.
 */
function secret() {
  const s = process.env.NEWSLETTER_SECRET || process.env.NEXTAUTH_SECRET || process.env.CRON_SECRET;
  if (!s) throw new Error("Set NEWSLETTER_SECRET (or NEXTAUTH_SECRET) to sign unsubscribe links");
  return s;
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("base64url");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}
