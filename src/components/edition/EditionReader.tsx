"use client";

import { useEffect, useRef, useState } from "react";
import { PodcastPlayer } from "@/components/edition/PodcastPlayer";
import type { PodcastSegment } from "@/lib/podcast";

/**
 * Client shell around the (server-rendered) edition: tracks how many bites
 * have been read, offers "listen" via the browser's built-in speech engine
 * (free, no server), and records a daily reading streak on this device.
 */
export function EditionReader({
  date, total, segments, children, doneCard,
}: {
  date: string;
  total: number;
  /** Podcast script for the "Listen" player. */
  segments: PodcastSegment[];
  children: React.ReactNode;
  doneCard: React.ReactNode;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [read, setRead] = useState<Set<number>>(new Set());
  const [streak, setStreak] = useState<number | null>(null);
  const done = total > 0 && read.size >= total;


  // A bite counts as read once half of it — or, for cards taller than the
  // screen, half the screen's worth of it — has been visible.
  useEffect(() => {
    const items = listRef.current?.querySelectorAll<HTMLElement>("[data-bite-index]");
    if (!items?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((e) => e.intersectionRatio >= 0.5 || e.intersectionRect.height >= window.innerHeight * 0.5)
          .map((e) => Number((e.target as HTMLElement).dataset.biteIndex));
        if (seen.length) setRead((prev) => new Set([...prev, ...seen]));
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [total]);

  // Streak: consecutive days on which the edition was finished.
  useEffect(() => {
    if (!done) return;
    try {
      const raw = JSON.parse(localStorage.getItem("ruro_streak") ?? "{}") as { last?: string; count?: number };
      const yesterday = new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000).toISOString().slice(0, 10);
      const count = raw.last === date ? raw.count ?? 1 : raw.last === yesterday ? (raw.count ?? 0) + 1 : 1;
      localStorage.setItem("ruro_streak", JSON.stringify({ last: date, count }));
      setStreak(count);
    } catch {
      setStreak(1);
    }
  }, [done, date]);

  const pct = total ? Math.round((read.size / total) * 100) : 0;

  return (
    <div>
      <div className="sticky top-[104px] z-20 -mx-4 mb-6 flex items-center gap-4 border-b border-border bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-card sm:border sm:px-5">
        <div className="flex-1">
          <div className="flex items-baseline justify-between text-xs text-gray-body">
            <span>
              {Math.min(read.size, total)} of {total} read
            </span>
            <span>~{Math.max(1, Math.round(total * 0.5))} min</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-pill bg-cream-dim" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Edition progress">
            <div className="h-full rounded-pill bg-brand transition-[width] duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <PodcastPlayer date={date} segments={segments} />
      </div>

      <div ref={listRef}>{children}</div>

      <div className="mt-8" aria-live="polite">
        {done ? (
          <div className="rounded-card border border-brand/30 bg-brand-tint p-8 text-center">
            <p className="text-4xl" aria-hidden="true">✓</p>
            <h2 className="mt-2 font-serif text-display-sm text-ink">You&apos;re done for today</h2>
            <p className="mt-2 text-ink/75">
              That&apos;s everything that mattered.
              {streak && streak > 1 ? ` ${streak}-day reading streak — see you tomorrow.` : " Come back tomorrow for a fresh edition."}
            </p>
            {doneCard}
          </div>
        ) : (
          <p className="text-center text-sm text-gray-body">Keep scrolling: {total - Math.min(read.size, total)} left in today&apos;s edition.</p>
        )}
      </div>
    </div>
  );
}
