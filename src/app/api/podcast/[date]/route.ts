import { NextResponse } from "next/server";
import { isValidEditionDate, todayIST } from "@/lib/edition";
import { getEpisode, ttsEnabled } from "@/lib/tts";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/podcast/2026-10-12 → the day's episode as MP3 (realistic voice).
 * Chapter start times ride along in an `X-Chapters` header (base64 JSON) so
 * the player can jump between stories. 404 when TTS isn't configured — the
 * player then falls back to the device's own voice.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!ttsEnabled()) return NextResponse.json({ error: "Realistic voice not configured" }, { status: 404 });
  if (!isValidEditionDate(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });

  try {
    const episode = await getEpisode(date);
    const audio = Buffer.from(episode.audio, "base64");
    const isToday = date === todayIST();
    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "X-Chapters": Buffer.from(JSON.stringify(episode.chapters)).toString("base64"),
        "Access-Control-Expose-Headers": "X-Chapters",
        // Past episodes never change; today's refreshes every few hours.
        "Cache-Control": isToday ? "public, s-maxage=3600, stale-while-revalidate=21600" : "public, s-maxage=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[podcast] generation failed:", err);
    return NextResponse.json({ error: "Episode unavailable" }, { status: 503 });
  }
}
