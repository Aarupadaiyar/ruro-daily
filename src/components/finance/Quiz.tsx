"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/finance/quiz";

export function Quiz({ week, questions }: { week: string; questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));
  const [best, setBest] = useState<number | null>(null);
  const answered = picked.filter((p) => p !== null).length;
  const score = picked.reduce<number>((s, p, i) => s + (p === questions[i]?.answer ? 1 : 0), 0);
  const finished = answered === questions.length;

  useEffect(() => {
    try {
      const v = localStorage.getItem(`ruro_quiz_${week}`);
      if (v) setBest(Number(v));
    } catch {}
  }, [week]);

  useEffect(() => {
    if (!finished) return;
    try {
      const prev = Number(localStorage.getItem(`ruro_quiz_${week}`) ?? -1);
      if (score > prev) localStorage.setItem(`ruro_quiz_${week}`, String(score));
      setBest(Math.max(prev, score));
    } catch {}
  }, [finished, score, week]);

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <fieldset key={q.term} className="rounded-card border border-border bg-paper p-6">
          <legend className="sr-only">Question {qi + 1}</legend>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">Question {qi + 1} of {questions.length}</p>
          <p className="mt-2 font-serif text-xl font-semibold text-ink">What does “{q.term}” mean?</p>
          <div className="mt-4 space-y-2">
            {q.options.map((opt, oi) => {
              const chosen = picked[qi] === oi;
              const reveal = picked[qi] !== null;
              const correct = oi === q.answer;
              return (
                <button
                  key={oi}
                  type="button"
                  disabled={reveal}
                  onClick={() => setPicked((p) => p.map((v, i) => (i === qi ? oi : v)))}
                  className={cn(
                    "block w-full rounded-card-sm border px-4 py-3 text-left text-sm leading-relaxed transition-colors",
                    !reveal && "border-border hover:border-ink/30 hover:bg-cream",
                    reveal && correct && "border-pillar-finance bg-pillar-finance/10 text-ink",
                    reveal && chosen && !correct && "border-red-700/40 bg-red-50 text-ink",
                    reveal && !chosen && !correct && "border-border text-gray-body"
                  )}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {picked[qi] !== null && (
            <p className={cn("mt-3 text-sm font-medium", picked[qi] === q.answer ? "text-pillar-finance" : "text-red-700")}>
              {picked[qi] === q.answer ? "Correct!" : "Not quite — the highlighted answer is right."}
            </p>
          )}
        </fieldset>
      ))}

      <div className="rounded-card border border-border bg-brand-tint p-6 text-center" aria-live="polite">
        {finished ? (
          <>
            <p className="font-serif text-2xl font-semibold text-ink">You scored {score} / {questions.length}</p>
            <p className="mt-1 text-sm text-ink/75">
              {score === questions.length ? "Perfect — you're reading money news like a pro." : "Nice work. Each week the quiz uses terms from that week's news."}
              {best !== null && best > score ? ` Your best this week: ${best}.` : ""}
            </p>
            <Link href="/finance/beginners#basics" className="mt-4 inline-block text-sm font-medium text-brand hover:underline">Brush up on the basics →</Link>
          </>
        ) : (
          <p className="text-sm text-ink/75">{answered} of {questions.length} answered{best !== null ? ` · best this week: ${best}/${questions.length}` : ""}</p>
        )}
      </div>
    </div>
  );
}
