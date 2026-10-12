import { PILLARS, type PillarSlug } from "@/lib/categories";

/**
 * Reader preferences — no account needed. Stored in a cookie so the server can
 * render a personalised edition on the first paint (no flicker).
 */
export type Region = "ALL" | "IN" | "US";

export interface Prefs {
  pillars: PillarSlug[];
  region: Region;
}

export const PREFS_COOKIE = "ruro_prefs";
export const DEFAULT_PREFS: Prefs = { pillars: PILLARS.map((p) => p.slug), region: "ALL" };

export function parsePrefs(raw: string | undefined): Prefs {
  if (!raw) return DEFAULT_PREFS;
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Partial<Prefs>;
    const valid = new Set<string>(PILLARS.map((p) => p.slug));
    const pillars = (v.pillars ?? []).filter((p): p is PillarSlug => valid.has(p));
    const region: Region = v.region === "IN" || v.region === "US" ? v.region : "ALL";
    return { pillars: pillars.length ? pillars : DEFAULT_PREFS.pillars, region };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function isDefaultPrefs(p: Prefs) {
  return p.region === "ALL" && p.pillars.length === DEFAULT_PREFS.pillars.length;
}
