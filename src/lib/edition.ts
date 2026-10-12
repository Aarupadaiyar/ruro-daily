import { listArticles } from "@/lib/articles";
import { rankBites } from "@/lib/bites";
import { toBeginnerBite } from "@/lib/finance/simplify";
import type { Prefs } from "@/lib/prefs";
import type { BeginnerBite, Bite } from "@/types";

/**
 * The daily edition: ~10 balanced top stories you can finish in 5 minutes.
 *   - Today's edition is a rolling last-24h window (always fresh).
 *   - Past editions cover one IST calendar day, so archive pages are stable.
 */
export const EDITION_SIZE = 10;
const IST_OFFSET_MS = 5.5 * 3_600_000;

export interface Edition {
  date: string; // YYYY-MM-DD (IST)
  isToday: boolean;
  bites: Bite[];
  /** One finance story explained for beginners. */
  explainer: BeginnerBite | null;
}

/** Today's date in IST as YYYY-MM-DD. */
export function todayIST(now = Date.now()): string {
  return new Date(now + IST_OFFSET_MS).toISOString().slice(0, 10);
}

export function isValidEditionDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const t = Date.parse(`${date}T00:00:00Z`);
  return !Number.isNaN(t) && date <= todayIST() && date >= "2026-01-01";
}

/** The last `n` edition dates, newest first. */
export function recentEditionDates(n: number): string[] {
  const today = Date.parse(`${todayIST()}T00:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(today - i * 86_400_000).toISOString().slice(0, 10));
}

export async function getEdition(date = todayIST(), prefs?: Prefs): Promise<Edition> {
  const isToday = date === todayIST();
  // IST midnight for `date`, expressed in UTC.
  const dayStart = Date.parse(`${date}T00:00:00Z`) - IST_OFFSET_MS;
  const window = isToday
    ? { sinceHours: 24 }
    : { from: new Date(dayStart).toISOString(), to: new Date(dayStart + 86_400_000).toISOString() };
  const now = isToday ? Date.now() : dayStart + 86_400_000;

  const pool = await listArticles({ ...window, take: 250 });
  const bites = await rankBites(pool, { take: EDITION_SIZE, prefs, maxPerPillar: 4 }, now);

  // Explainer: the top finance story not already in the edition.
  const shown = new Set(bites.map((b) => b.article.id));
  const finance = (await rankBites(pool.filter((a) => a.pillar === "finance"), { take: 5 }, now)).find((b) => !shown.has(b.article.id));

  return { date, isToday, bites, explainer: finance ? toBeginnerBite(finance) : null };
}

export function formatEditionDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`)
  );
}
