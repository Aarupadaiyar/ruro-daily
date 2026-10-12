import { GLOSSARY, findTerms } from "./glossary";

export interface QuizQuestion {
  term: string;
  options: string[];
  answer: number; // index into options
}

/** ISO-week key like "2026-W41" — the quiz changes every Monday. */
export function weekKey(now = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  const week = Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

// Small deterministic PRNG so everyone gets the same quiz each week.
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

/**
 * Five "what does this mean?" questions. Terms that appeared in this week's
 * finance headlines come first, so the quiz doubles as a recap of the news.
 */
export function buildQuiz(headlines: string[], week = weekKey(), count = 5): QuizQuestion[] {
  const rand = rng(week);
  const fromNews = findTerms(headlines.join(". "), 20).map((t) => t.term);
  const rest = GLOSSARY.map((g) => g.term).filter((t) => !fromNews.includes(t)).sort(() => rand() - 0.5);
  const terms = [...new Set([...fromNews, ...rest])].slice(0, count);

  return terms.map((term) => {
    const correct = GLOSSARY.find((g) => g.term === term)!.meaning;
    const wrong = GLOSSARY.filter((g) => g.term !== term).sort(() => rand() - 0.5).slice(0, 3).map((g) => g.meaning);
    const options = [correct, ...wrong].sort(() => rand() - 0.5);
    return { term, options, answer: options.indexOf(correct) };
  });
}
