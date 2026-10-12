"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Headphones, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import type { PodcastSegment } from "@/lib/podcast";
import { cn } from "@/lib/utils";

type Chapter = { story: number | null; title: string; start: number };
type Mode = "idle" | "loading" | "mp3" | "device";

const SPEEDS = [1, 1.25, 1.5, 0.9];

/** Best-sounding installed voice: natural/neural/online voices first, Indian English preferred. */
function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith("en"));
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|neural|online|premium|enhanced/i.test(v.name) ? 10 : 0) +
    (/google/i.test(v.name) ? 4 : 0) +
    (v.lang === "en-IN" ? 3 : v.lang === "en-GB" ? 2 : v.lang === "en-US" ? 1 : 0) +
    (v.localService ? 0 : 1);
  return voices.sort((a, b) => score(b) - score(a))[0] ?? null;
}

function splitForSpeech(text: string) {
  // Chrome stops long utterances after ~15s, so speak sentence by sentence.
  return text.match(/[^.!?]+[.!?]+["”’]?|\S[^.!?]*$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
}

/**
 * Edition podcast. Uses the realistic MP3 from /api/podcast/[date] when the
 * server has a TTS key; otherwise reads the same script with the device voice.
 */
export function PodcastPlayer({ date, segments }: { date: string; segments: PodcastSegment[] }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [playing, setPlaying] = useState(false);
  const [segment, setSegment] = useState(0);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const speakToken = useRef(0); // invalidates queued utterances after skip/stop

  const current = segments[segment];

  // Highlight + scroll to the story being read.
  useEffect(() => {
    document.querySelectorAll("[data-bite-index]").forEach((el) => el.removeAttribute("data-playing"));
    if (mode === "idle" || current?.story == null) return;
    const el = document.querySelector(`[data-bite-index="${current.story}"]`);
    el?.setAttribute("data-playing", "true");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [segment, mode, current?.story]);

  // ── Device-voice engine ────────────────────────────────────────────────
  const speakFrom = useCallback(
    (index: number, rate: number) => {
      const synth = window.speechSynthesis;
      synth.cancel();
      const token = ++speakToken.current;
      const voice = pickVoice();
      const run = (i: number) => {
        if (token !== speakToken.current) return;
        if (i >= segments.length) {
          setPlaying(false);
          setSegment(0);
          return;
        }
        setSegment(i);
        const parts = splitForSpeech(segments[i]!.text);
        parts.forEach((part, pi) => {
          const u = new SpeechSynthesisUtterance(part);
          if (voice) u.voice = voice;
          u.lang = voice?.lang ?? "en-IN";
          u.rate = rate;
          if (pi === parts.length - 1) u.onend = () => setTimeout(() => run(i + 1), 350); // short pause between stories
          synth.speak(u);
        });
      };
      run(index);
      setPlaying(true);
    },
    [segments]
  );

  // ── MP3 engine ─────────────────────────────────────────────────────────
  async function start() {
    setMode("loading");
    try {
      const res = await fetch(`/api/podcast/${date}`);
      if (!res.ok || !res.headers.get("content-type")?.includes("audio")) throw new Error("no mp3");
      const header = res.headers.get("X-Chapters");
      setChapters(header ? (JSON.parse(atob(header)) as Chapter[]) : []);
      const audio = new Audio(URL.createObjectURL(await res.blob()));
      audio.playbackRate = speed;
      audio.ontimeupdate = () => setTime(audio.currentTime);
      audio.onloadedmetadata = () => setDuration(audio.duration);
      audio.onplay = () => setPlaying(true);
      audio.onpause = () => setPlaying(false);
      audio.onended = () => setPlaying(false);
      audioRef.current = audio;
      setMode("mp3");
      await audio.play();
    } catch {
      if (!("speechSynthesis" in window)) {
        setMode("idle");
        return;
      }
      setMode("device");
      speakFrom(0, speed);
    }
  }

  // Keep the segment index in sync with MP3 playback position.
  useEffect(() => {
    if (mode !== "mp3" || chapters.length === 0) return;
    let idx = 0;
    chapters.forEach((c, i) => {
      if (time >= c.start) idx = i;
    });
    setSegment(idx);
  }, [time, chapters, mode]);

  function toggle() {
    if (mode === "idle") return void start();
    if (mode === "mp3") {
      const a = audioRef.current!;
      a.paused ? a.play() : a.pause();
    } else if (mode === "device") {
      if (playing) {
        speakToken.current++;
        window.speechSynthesis.cancel();
        setPlaying(false);
      } else speakFrom(segment, speed);
    }
  }

  function jump(delta: number) {
    const target = Math.min(Math.max(segment + delta, 0), segments.length - 1);
    if (mode === "mp3" && audioRef.current && chapters[target]) audioRef.current.currentTime = chapters[target]!.start + 0.01;
    if (mode === "device") speakFrom(target, speed);
  }

  function cycleSpeed() {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]!;
    setSpeed(next);
    if (mode === "mp3" && audioRef.current) audioRef.current.playbackRate = next;
    if (mode === "device" && playing) speakFrom(segment, next);
  }

  function close() {
    speakToken.current++;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    setMode("idle");
    setSegment(0);
    document.querySelectorAll("[data-bite-index]").forEach((el) => el.removeAttribute("data-playing"));
  }

  // Lock-screen / headphone controls.
  useEffect(() => {
    if (!("mediaSession" in navigator) || mode === "idle") return;
    navigator.mediaSession.metadata = new MediaMetadata({ title: current?.title ?? "Ruro Daily", artist: "Ruro Daily", album: date });
    navigator.mediaSession.setActionHandler("play", toggle);
    navigator.mediaSession.setActionHandler("pause", toggle);
    navigator.mediaSession.setActionHandler("nexttrack", () => jump(1));
    navigator.mediaSession.setActionHandler("previoustrack", () => jump(-1));
  });

  useEffect(() => () => {
    speakToken.current++;
    window.speechSynthesis?.cancel();
    audioRef.current?.pause();
  }, []);

  const progress =
    mode === "mp3" && duration ? (time / duration) * 100 : mode === "device" ? ((segment + (playing ? 0.5 : 0)) / segments.length) * 100 : 0;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <>
      <button
        type="button"
        onClick={mode === "idle" ? start : toggle}
        className="inline-flex shrink-0 items-center gap-2 rounded-pill border border-border bg-paper px-3.5 py-1.5 text-sm text-ink hover:border-ink/30"
      >
        {playing ? <Pause size={15} aria-hidden="true" /> : <Headphones size={15} aria-hidden="true" />}
        {mode === "loading" ? "Loading…" : playing ? "Pause" : mode === "idle" ? "Listen · 4 min" : "Resume"}
      </button>

      {mode !== "idle" && (
        <div role="region" aria-label="Podcast player" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-paper/95 shadow-soft-lg backdrop-blur">
          <div className="h-0.5 bg-cream-dim">
            <div className="h-full bg-brand transition-[width] duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
            <button type="button" onClick={() => jump(-1)} aria-label="Previous story" className="rounded-full p-2 text-ink/70 hover:bg-cream-dim hover:text-ink">
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-brand-fg hover:bg-brand-dim"
            >
              {mode === "loading" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-fg border-t-transparent" /> : playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button type="button" onClick={() => jump(1)} aria-label="Next story" className="rounded-full p-2 text-ink/70 hover:bg-cream-dim hover:text-ink">
              <SkipForward size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-ink">{current?.title}</p>
              <p className="text-xs text-gray-body">
                {current?.story != null ? `Story ${current.story + 1}` : "Ruro Daily"}
                {mode === "mp3" && duration ? ` · ${fmt(time)} / ${fmt(duration)}` : ""}
                {mode === "device" ? " · device voice" : mode === "mp3" ? " · natural voice" : ""}
              </p>
            </div>

            <button type="button" onClick={cycleSpeed} className={cn("rounded-pill border border-border px-2.5 py-1 text-xs tabular-nums text-ink hover:border-ink/30")} aria-label="Playback speed">
              {speed}×
            </button>
            <button type="button" onClick={close} aria-label="Close player" className="rounded-full p-2 text-ink/60 hover:bg-cream-dim hover:text-ink">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
