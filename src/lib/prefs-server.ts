import { cookies } from "next/headers";
import { parsePrefs, PREFS_COOKIE, type Prefs } from "@/lib/prefs";

/** Read the reader's preferences from the request cookie (server only). */
export async function getPrefs(): Promise<Prefs> {
  return parsePrefs((await cookies()).get(PREFS_COOKIE)?.value);
}
