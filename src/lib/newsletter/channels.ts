/**
 * Outbound channels for the daily edition. Every function is a no-op that
 * reports `skipped` when its env vars are missing, so the site works before
 * any of them are configured.
 *
 *   Brevo     BREVO_API_KEY, NEWSLETTER_FROM_EMAIL, NEWSLETTER_FROM_NAME
 *   Sheets    SHEETS_WEBHOOK_URL   (Google Apps Script web app — see NEWSLETTER_SETUP.md)
 *   Telegram  TELEGRAM_BOT_TOKEN, TELEGRAM_CHANNEL_ID
 */
type Result = { ok: true; detail?: string } | { ok: false; skipped?: boolean; error: string };

const BREVO = "https://api.brevo.com/v3";

function brevoHeaders() {
  return { "api-key": process.env.BREVO_API_KEY!, "content-type": "application/json", accept: "application/json" };
}

/** Add/refresh a contact in Brevo (keeps Brevo's list in sync for exports). */
export async function brevoAddContact(email: string): Promise<Result> {
  if (!process.env.BREVO_API_KEY) return { ok: false, skipped: true, error: "BREVO_API_KEY not set" };
  const listId = Number(process.env.BREVO_LIST_ID) || undefined;
  const res = await fetch(`${BREVO}/contacts`, {
    method: "POST",
    headers: brevoHeaders(),
    body: JSON.stringify({ email, updateEnabled: true, ...(listId ? { listIds: [listId] } : {}) }),
  });
  return res.ok || res.status === 204 ? { ok: true } : { ok: false, error: `Brevo contact ${res.status}: ${await res.text()}` };
}

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
  unsubscribeUrl: string;
}

/**
 * Send personalised emails in batches. Brevo's `messageVersions` lets one API
 * call carry up to 1000 recipients, each with their own unsubscribe link.
 */
export async function brevoSendBatch(messages: EmailMessage[]): Promise<Result> {
  if (!process.env.BREVO_API_KEY || !process.env.NEWSLETTER_FROM_EMAIL) {
    return { ok: false, skipped: true, error: "BREVO_API_KEY / NEWSLETTER_FROM_EMAIL not set" };
  }
  if (messages.length === 0) return { ok: true, detail: "no recipients" };
  const sender = { email: process.env.NEWSLETTER_FROM_EMAIL, name: process.env.NEWSLETTER_FROM_NAME || "Ruro Daily" };

  let sent = 0;
  for (let i = 0; i < messages.length; i += 1000) {
    const batch = messages.slice(i, i + 1000);
    const first = batch[0]!;
    const res = await fetch(`${BREVO}/smtp/email`, {
      method: "POST",
      headers: brevoHeaders(),
      body: JSON.stringify({
        sender,
        subject: first.subject,
        htmlContent: first.html,
        textContent: first.text,
        messageVersions: batch.map((m) => ({
          to: [{ email: m.to }],
          subject: m.subject,
          htmlContent: m.html,
          textContent: m.text,
          headers: {
            // One-click unsubscribe (Gmail/Yahoo bulk-sender requirement).
            "List-Unsubscribe": `<${m.unsubscribeUrl}>`,
            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          },
        })),
      }),
    });
    if (!res.ok) return { ok: false, error: `Brevo send ${res.status} after ${sent} sent: ${await res.text()}` };
    sent += batch.length;
  }
  return { ok: true, detail: `${sent} sent` };
}

/** Append a signup row to a Google Sheet via an Apps Script web app. */
export async function sheetsAppend(row: { email: string; source?: string; action: "subscribe" | "unsubscribe" }): Promise<Result> {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return { ok: false, skipped: true, error: "SHEETS_WEBHOOK_URL not set" };
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...row, at: new Date().toISOString(), secret: process.env.SHEETS_WEBHOOK_SECRET ?? "" }),
    redirect: "follow",
  });
  return res.ok ? { ok: true } : { ok: false, error: `Sheets webhook ${res.status}` };
}

/** Post an HTML-formatted message to the Telegram channel. */
export async function telegramPost(html: string): Promise<Result> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHANNEL_ID;
  if (!token || !chat) return { ok: false, skipped: true, error: "TELEGRAM_BOT_TOKEN / TELEGRAM_CHANNEL_ID not set" };
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text: html, parse_mode: "HTML", link_preview_options: { is_disabled: true } }),
  });
  const body = (await res.json().catch(() => null)) as { ok?: boolean; description?: string } | null;
  return body?.ok ? { ok: true } : { ok: false, error: `Telegram: ${body?.description ?? res.status}` };
}
