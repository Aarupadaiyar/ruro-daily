import { formatEditionDate, type Edition } from "@/lib/edition";
import { SITE } from "@/lib/site";
import { tokens } from "@/styles/design-tokens";

/** How many stories go into the email / channel posts (the site shows all 10). */
const TOP = 7;

const c = tokens.color;

function esc(s: string) {
  return s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);
}

const articleUrl = (slug: string) => `${SITE.url}/news/${slug}`;
const editionUrl = (e: Edition) => (e.isToday ? `${SITE.url}/edition` : `${SITE.url}/edition/${e.date}`);

export function emailSubject(e: Edition) {
  const lead = e.bites[0]?.article.title;
  return lead ? `${lead} — and ${Math.min(TOP, e.bites.length) - 1} more` : `${SITE.name}: ${formatEditionDate(e.date)}`;
}

/** Light, single-column HTML email that matches the site. */
export function renderEditionEmail(e: Edition, unsubscribeUrl: string): string {
  const items = e.bites
    .slice(0, TOP)
    .map(
      (b, i) => `
      <tr><td style="padding:18px 0;border-bottom:1px solid ${c.border};">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${c.grayBody};">${i + 1} · ${esc(b.article.category.name)} · ${esc(b.article.source.name)}</p>
        <a href="${articleUrl(b.article.slug)}" style="font-family:${tokens.font.serif};font-size:19px;line-height:1.3;font-weight:700;color:${c.ink};text-decoration:none;">${esc(b.article.title)}</a>
        <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:${c.ink};">${esc(b.text)}</p>
        ${b.why ? `<p style="margin:8px 0 0;padding-left:10px;border-left:2px solid ${c.brand};font-size:13px;line-height:1.55;color:${c.grayBody};"><strong style="color:${c.brand};">Why it matters:</strong> ${esc(b.why)}</p>` : ""}
      </td></tr>`
    )
    .join("");

  const explainer = e.explainer
    ? `<tr><td style="padding:24px 0 8px;">
        <div style="background:#E7EFEE;border-radius:12px;padding:18px;">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${c.brand};">Money, simply explained</p>
          <a href="${articleUrl(e.explainer.article.slug)}" style="font-family:${tokens.font.serif};font-size:17px;font-weight:700;color:${c.ink};text-decoration:none;">${esc(e.explainer.article.title)}</a>
          <p style="margin:8px 0 0;font-size:14px;line-height:1.6;color:${c.ink};">${esc(e.explainer.plainText)}</p>
          ${e.explainer.whyItMatters ? `<p style="margin:8px 0 0;font-size:13px;line-height:1.55;color:${c.grayBody};"><strong>What this means for you:</strong> ${esc(e.explainer.whyItMatters)}</p>` : ""}
        </div>
      </td></tr>`
    : "";

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:${c.cream};font-family:${tokens.font.family};">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:28px 20px;">
    <tr><td>
      <p style="margin:0;font-family:Georgia,serif;font-size:26px;letter-spacing:.08em;color:${c.ink};">RURO <span style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:.2em;border:1px solid ${c.border};padding:2px 6px;color:${c.grayBody};vertical-align:middle;">DAILY</span></p>
      <p style="margin:6px 0 0;font-size:13px;color:${c.grayBody};">${formatEditionDate(e.date)} · ${Math.min(TOP, e.bites.length)} stories · 3 min</p>
    </td></tr>
    ${items}
    ${explainer}
    <tr><td style="padding:24px 0;">
      <a href="${editionUrl(e)}" style="display:inline-block;background:${c.brand};color:#fff;font-weight:600;font-size:14px;padding:12px 22px;border-radius:999px;text-decoration:none;">Read the full edition →</a>
    </td></tr>
    <tr><td style="padding-top:12px;border-top:1px solid ${c.border};font-size:12px;line-height:1.6;color:${c.grayBody};">
      You're getting this because you subscribed at ${esc(SITE.url.replace(/^https?:\/\//, ""))}. Stories link to and credit their original publishers.
      Not investment advice.<br><a href="${unsubscribeUrl}" style="color:${c.grayBody};">Unsubscribe</a>
    </td></tr>
  </table></body></html>`;
}

export function renderEditionText(e: Edition, unsubscribeUrl: string): string {
  const lines = e.bites.slice(0, TOP).map((b, i) => `${i + 1}. ${b.article.title}\n${b.text}\n${articleUrl(b.article.slug)}`);
  return `${SITE.name} — ${formatEditionDate(e.date)}\n\n${lines.join("\n\n")}\n\nFull edition: ${editionUrl(e)}\n\nUnsubscribe: ${unsubscribeUrl}`;
}

/** Telegram channel post (HTML parse mode, < 4096 chars). */
export function renderTelegram(e: Edition): string {
  const head = `<b>${esc(SITE.name)} · ${esc(formatEditionDate(e.date))}</b>\n`;
  const foot = `\n<a href="${editionUrl(e)}">Read the full edition →</a>`;
  let body = "";
  for (const [i, b] of e.bites.slice(0, TOP).entries()) {
    const item = `\n${i + 1}. <a href="${articleUrl(b.article.slug)}"><b>${esc(b.article.title)}</b></a>\n${esc(b.text)}\n`;
    if ((head + body + item + foot).length > 4000) break;
    body += item;
  }
  return head + body + foot;
}

/** WhatsApp Channel post (plain text with *bold*), for the admin copy button. */
export function renderWhatsApp(e: Edition): string {
  const items = e.bites.slice(0, 5).map((b, i) => `${i + 1}. *${b.article.title}*\n${b.text}`);
  return `*${SITE.name}* · ${formatEditionDate(e.date)}\n\n${items.join("\n\n")}\n\nAll 10 stories in 5 minutes 👉 ${editionUrl(e)}`;
}
