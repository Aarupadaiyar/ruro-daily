import { tokens } from "@/styles/design-tokens";

// This internal digest email intentionally stays light-themed with its own
// hardcoded colors rather than following the site's dark theme tokens.
// Email client dark-mode support is unreliable, and this keeps the digest
// readable regardless of what the site's own palette does.
const emailColor = {
  bg: "#FAFAF0",
  ink: "#0B0B0B",
  accent: "#4C56E8",
  grayBody: "#6B6B63",
  border: "#E4E4D8",
};

export interface DigestArticle {
  title: string;
  summary: string;
  url: string;
  category: string;
}

export interface DigestData {
  date: string;
  topNews: DigestArticle[];
  funding: DigestArticle[];
  research: DigestArticle[];
  openSource: DigestArticle[];
  modelReleases: DigestArticle[];
  hiringTrends: DigestArticle[];
  adminReviewUrl: string;
}

function section(title: string, items: DigestArticle[]) {
  if (items.length === 0) return "";
  const rows = items
    .map(
      (a) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid ${emailColor.border};">
          <a href="${a.url}" style="color:${emailColor.ink};font-weight:600;font-size:15px;text-decoration:none;">${escapeHtml(a.title)}</a>
          <p style="margin:6px 0 0;color:${emailColor.grayBody};font-size:13px;line-height:1.5;">${escapeHtml(a.summary)}</p>
        </td>
      </tr>`
    )
    .join("");

  return `
    <tr><td style="padding:28px 0 8px;">
      <span style="display:inline-block;background:${emailColor.accent};color:#fff;font-size:11px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:4px 12px;border-radius:${tokens.radius.pill};">${title}</span>
    </td></tr>
    <tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>`;
}

export function renderDigestEmail(data: DigestData): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:${emailColor.bg};font-family:${tokens.font.family};">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;padding:32px 20px;">
      <tr><td>
        <div style="display:inline-block;background:${emailColor.accent};color:#fff;font-weight:700;padding:6px 14px;border-radius:${tokens.radius.pill};font-size:14px;">Trafy</div>
        <h1 style="font-size:26px;font-weight:700;letter-spacing:-0.02em;margin:20px 0 4px;color:${emailColor.ink};">Today's AI News Digest</h1>
        <p style="color:${emailColor.grayBody};font-size:14px;margin:0 0 8px;">${data.date} · Internal — admin only</p>
      </td></tr>
      ${section("Top 10 News", data.topNews)}
      ${section("Funding", data.funding)}
      ${section("Research", data.research)}
      ${section("Open Source", data.openSource)}
      ${section("Model Releases", data.modelReleases)}
      ${section("Hiring Trends", data.hiringTrends)}
      <tr><td style="padding-top:32px;">
        <a href="${data.adminReviewUrl}" style="display:inline-block;background:${emailColor.ink};color:#fff;font-weight:600;font-size:14px;padding:12px 24px;border-radius:${tokens.radius.pill};text-decoration:none;">Review in admin panel →</a>
      </td></tr>
      <tr><td style="padding-top:32px;color:#A3A395;font-size:12px;">
        Sent to Trafy admins only, generated automatically from the 7 AM scrape run.
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
