import type { Edition } from "@/lib/edition";
import type { PillarSlug } from "@/lib/categories";

/**
 * Turns an edition into a short spoken episode: a host-style intro, each
 * story with a topic transition, "why it matters", and a sign-off. Shared by
 * the server (MP3 generation) and the browser-voice fallback, so both read
 * the same script. Capped at PODCAST_STORIES to keep episodes ~3–4 minutes.
 */
export const PODCAST_STORIES = 7;

export interface PodcastSegment {
  /** Index into edition.bites, or null for intro/outro/explainer. */
  story: number | null;
  title: string;
  text: string;
}

const TRANSITION: Record<PillarSlug, string[]> = {
  ai: ["In AI,", "Over in artificial intelligence,", "Next, in AI,"],
  tech: ["In tech,", "Over in technology,", "Next, from the tech world,"],
  finance: ["In markets and money,", "Turning to finance,", "Next, in business,"],
};

function spokenDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`));
}

// Make text read naturally aloud: drop URLs/brackets, expand symbols.
function speakable(s: string) {
  return s
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s*\([^)]{0,60}\)/g, "")
    .replace(/₹\s?([\d,.]+)\s?(crore|lakh|cr)\b/gi, "$1 $2 rupees")
    .replace(/₹\s?([\d,.]+)/g, "$1 rupees")
    .replace(/\$\s?([\d,.]+)\s?(bn|billion)\b/gi, "$1 billion dollars")
    .replace(/\$\s?([\d,.]+)\s?(mn|million)\b/gi, "$1 million dollars")
    .replace(/\$\s?([\d,.]+)/g, "$1 dollars")
    .replace(/(\d)%/g, "$1 percent")
    .replace(/\s&\s/g, " and ")
    .replace(/…/g, ".")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildPodcastScript(edition: Edition): PodcastSegment[] {
  const stories = edition.bites.slice(0, PODCAST_STORIES);
  const greeting = edition.isToday ? "Good morning." : "Hello.";
  const segments: PodcastSegment[] = [
    {
      story: null,
      title: "Intro",
      text: `${greeting} This is Ruro Daily for ${spokenDate(edition.date)}. Here are the ${stories.length} stories that matter today, in about four minutes.`,
    },
  ];

  let lastPillar: PillarSlug | null = null;
  stories.forEach((b, i) => {
    const pillar = b.article.pillar;
    const options = TRANSITION[pillar];
    const lead = i === 0 ? "First up," : pillar === lastPillar ? "Also," : options[i % options.length];
    lastPillar = pillar;
    const why = b.why ? ` Why it matters: ${b.why}` : "";
    segments.push({
      story: i,
      title: b.article.title,
      text: speakable(`${lead} ${b.article.title}. ${b.text}${why}`),
    });
  });

  if (edition.explainer) {
    segments.push({
      story: null,
      title: "Money, simply explained",
      text: speakable(`And before you go, money in simple words. ${edition.explainer.article.title}. ${edition.explainer.plainText}`),
    });
  }

  segments.push({
    story: null,
    title: "Outro",
    text: "That's your Ruro Daily. The full edition, with links to every source, is at daily dot ruro dot in. See you tomorrow.",
  });
  return segments;
}
