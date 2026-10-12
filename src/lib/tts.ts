import { unstable_cache } from "next/cache";
import { getEdition, todayIST } from "@/lib/edition";
import { buildPodcastScript } from "@/lib/podcast";

/**
 * Realistic narration via Google Cloud Text-to-Speech (free tier: ~1M
 * WaveNet/Neural2 characters a month). One episode is ~3k characters, and each
 * episode is generated at most every 6 hours and shared by all listeners,
 * which keeps usage far inside the free tier.
 *
 * Env: GOOGLE_TTS_API_KEY (required), GOOGLE_TTS_VOICE (default en-IN-Neural2-A).
 */
export const ttsEnabled = () => Boolean(process.env.GOOGLE_TTS_API_KEY);

// Google's MP3 output is 32 kbps CBR, so byte length maps directly to time.
const MP3_BYTES_PER_SEC = 32_000 / 8;

async function synthesize(text: string): Promise<Buffer> {
  const voice = process.env.GOOGLE_TTS_VOICE || "en-IN-Neural2-A";
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${process.env.GOOGLE_TTS_API_KEY}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: voice.split("-").slice(0, 2).join("-"), name: voice },
      audioConfig: { audioEncoding: "MP3", speakingRate: 1.02, pitch: 0 },
    }),
  });
  if (!res.ok) throw new Error(`Google TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const { audioContent } = (await res.json()) as { audioContent: string };
  return Buffer.from(audioContent, "base64");
}

export interface Episode {
  /** Base64 MP3 (kept as a string so it can live in the data cache). */
  audio: string;
  /** Start time (seconds) of each segment; `story` maps to the edition's bite index. */
  chapters: { story: number | null; title: string; start: number }[];
}

async function generateEpisode(date: string): Promise<Episode> {
  const segments = buildPodcastScript(await getEdition(date));
  const parts: Buffer[] = [];
  const chapters: Episode["chapters"] = [];
  let bytes = 0;
  // Segments are synthesised separately (API limit is 5,000 bytes per call)
  // and concatenated — MP3 frames join cleanly.
  for (const seg of segments) {
    chapters.push({ story: seg.story, title: seg.title, start: bytes / MP3_BYTES_PER_SEC });
    const audio = await synthesize(seg.text);
    parts.push(audio);
    bytes += audio.length;
  }
  return { audio: Buffer.concat(parts).toString("base64"), chapters };
}

/**
 * Cached episode for a date. Today's episode is bucketed into 6-hour windows
 * so it refreshes with the news but is generated at most 4 times a day.
 */
export function getEpisode(date: string): Promise<Episode> {
  const bucket = date === todayIST() ? Math.floor(Date.now() / (6 * 3_600_000)) : "final";
  return cachedEpisode(date, String(bucket));
}

const cachedEpisode = unstable_cache((date: string, _bucket: string) => generateEpisode(date), ["podcast-episode"], {
  revalidate: false,
});
