import { splitSentences } from "@/lib/text";

/**
 * Feed summaries are sometimes junk: page chrome ("More in this Section"),
 * a site name ("Press Releases - Reserve Bank of India"), or just the title
 * again. These helpers detect that and rebuild a real 1–2 sentence gist (and,
 * when needed, the real headline) from the article body.
 */
const JUNK_SUMMARY = [
  /^more in this section$/i,
  /press releases?\s*[-–|]/i,
  /^(home|menu|news|latest|share|skip to)\b/i,
  /^read (more|the full)/i,
];

const MIN_GIST = 60;
const MAX_GIST = 240;

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

// Share bars and photo credits that page scrapers pick up as text.
const SHARE_CHROME =
  /\((?:image|photo|picture) credit:[^)]*\)|\b(?:copy link|share this article)\b|\b(?:facebook|x|twitter|whatsapp|reddit|pinterest|flipboard|threads|linkedin|email)(?:\s+(?:facebook|x|twitter|whatsapp|reddit|pinterest|flipboard|threads|linkedin|email)){2,}\b/gi;

/** Remove share-bar text and photo credits from a feed summary. */
export function cleanSummary(summary: string): string {
  return summary.replace(SHARE_CHROME, " ").replace(/\s+/g, " ").trim();
}

export function isUsefulSummary(summary: string | null | undefined, title: string): boolean {
  const s = cleanSummary(summary ?? "");
  if (s.length < MIN_GIST) return false;
  if (JUNK_SUMMARY.some((re) => re.test(s))) return false;
  const ns = normalize(s);
  const nt = normalize(title);
  return !(ns === nt || (nt.length > 20 && ns.startsWith(nt) && ns.length < nt.length + 40));
}

// Feeds that title every item with the site name instead of the headline.
const JUNK_TITLE = /press releases?\s*[|–-]|official website of|^untitled$/i;

export function isJunkTitle(title: string) {
  return JUNK_TITLE.test(title.trim());
}

// Page furniture that precedes the real text on official/press pages.
const CHROME = [
  /more in this section/gi,
  /press releases?\b/gi,
  /\(\s*\d+(\.\d+)?\s*kb\s*\)/gi,
  /date\s*:\s*[a-z]{3,9}\.? \d{1,2},? \d{4}/gi,
  /for immediate release/gi,
  /\b(january|february|march|april|may|june|july|august|september|october|november|december) \d{1,2}, \d{4}/gi,
  /\b(share|tweet|email|print)( this)?( article)?\b/gi,
];

// Marks where a scraped page glued a headline to its body ("requirementsOn").
const GLUE = " ";

// Phrases that open the body of official press releases ("…Exchange Market In view of…").
const BODY_OPENER =
  /\s(?=(?:In view of|On a review|On the basis|On review|The Reserve Bank|Reserve Bank of India has|The following|It has been|As announced|In terms of|In continuation|The Securities and Exchange Commission)\b)/;

// Leading byline: "Jane Doe, Research Scientist, and John Roe, Principal, Google Research To be useful…"
const BYLINE =
  /^.{0,220}?\b(?:Scientist|Engineer|Fellow|Principal|Researcher|Director|Manager|Professor|Lead)s?\b[^.]*?\s(?=(?:To|In|We|This|Today|Our|The|A|An|As|When)\b)/;

function cleanBody(content: string): string {
  let text = content
    .replace(/<[^>]+>/g, " ") // HTML
    .replace(/[#*_`>[\]]+/g, " ") // markdown symbols
    .replace(/\(https?:\/\/[^)]+\)/g, " ")
    .replace(/(\d)([A-Z])/g, "$1 $2") // "2026RBI announces" → "2026 RBI announces"
    .replace(/([a-z]{4,})([A-Z][a-z])/g, `$1${GLUE}$2`) // "requirementsOn the" → boundary
    .replace(/[ \t\r\n]+/g, " ")
    .trim();
  for (const re of CHROME) text = text.replace(re, " ");
  return text
    .replace(BODY_OPENER, GLUE) // headline → body boundary on press releases
    .replace(/\b(on|dated)\s+([,.])/g, "$2") // "on ." left by removed dates
    .replace(/,\s*,/g, ",")
    .replace(/ +/g, " ")
    .trim();
}

/** Strip release numbers, datelines and bylines from the start of body text. */
function stripLead(text: string): string {
  let t = text
    .replace(/^\s*\d{4}-\d+\s+/, "") // SEC release number "2026-102"
    .replace(/^[A-Z][\w .]+,\s*[A-Z][a-z]{2}\.? \d{1,2}, \d{4}\s*[—–-]\s*/, "") // dateline
    .trim();
  const by = t.match(BYLINE);
  if (by && by[0].includes(",")) t = t.slice(by[0].length).trim();
  return t;
}

/** The real headline when a feed only gave us the site name. */
export function headlineFromContent(content: string): string {
  const text = cleanBody(content);
  const cut = text.indexOf(GLUE);
  const head = (cut > 0 ? text.slice(0, cut) : splitSentences(text.replaceAll(GLUE, " "))[0] ?? "")
    .replace(/\s+(on|dated|for|of|from)\s*$/i, "") // dangling word left by a stripped date
    .trim();
  return head.length >= 15 && head.length <= 200 ? head : "";
}

/** Build a 1–2 sentence gist from the article body, or "" if there is no real text. */
export function gistFromContent(content: string, title: string): string {
  let text = cleanBody(content);
  // A glued headline at the start is the title again — skip past it.
  const cut = text.indexOf(GLUE);
  if (cut > 0 && cut < 200) text = text.slice(cut + 1);
  text = text.replaceAll(GLUE, " ");

  // Drop the headline if the body repeats it, so the gist adds information.
  const idx = text.toLowerCase().indexOf(title.toLowerCase().slice(0, 60));
  if (idx >= 0 && idx < 200) text = text.slice(idx + title.length).trim();
  text = stripLead(text);

  let out = "";
  for (const s of splitSentences(text)) {
    if (s.length < 25 || !/[a-z]{3,}/.test(s)) continue; // bylines, dates, fragments
    out = out ? `${out} ${s}` : s;
    if (out.length >= MIN_GIST * 1.5) break;
  }
  if (out.length > MAX_GIST + 20) out = out.slice(0, MAX_GIST).replace(/\s+\S*$/, "") + "…";
  return out.length >= MIN_GIST ? out : "";
}
