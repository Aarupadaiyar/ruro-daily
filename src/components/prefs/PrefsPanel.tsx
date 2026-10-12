"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import { PILLARS, type PillarSlug } from "@/lib/categories";
import { PREFS_COOKIE, type Prefs, type Region } from "@/lib/prefs";
import { cn } from "@/lib/utils";

const REGIONS: { value: Region; label: string }[] = [
  { value: "ALL", label: "Global" },
  { value: "IN", label: "India first" },
  { value: "US", label: "US first" },
];

/** "Customise my edition" — topics + region, saved in a cookie (no account). */
export function PrefsPanel({ initial }: { initial: Prefs }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function togglePillar(slug: PillarSlug) {
    setPrefs((p) => {
      const has = p.pillars.includes(slug);
      const pillars = has ? p.pillars.filter((x) => x !== slug) : [...p.pillars, slug];
      return { ...p, pillars: pillars.length ? pillars : p.pillars }; // keep at least one
    });
  }

  function save() {
    document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(JSON.stringify(prefs))}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    startTransition(() => router.refresh());
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-pill border px-3 py-1.5 text-sm transition-colors",
      active ? "border-ink bg-ink text-cream" : "border-border bg-paper text-gray-body hover:text-ink"
    );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-pill border border-border bg-paper px-3.5 py-1.5 text-sm text-ink hover:border-ink/30"
      >
        <SlidersHorizontal size={15} aria-hidden="true" />
        {pending ? "Updating…" : "Customise"}
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-72 rounded-card border border-border bg-paper p-5 shadow-soft-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">Topics</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PILLARS.map((p) => (
              <button key={p.slug} type="button" aria-pressed={prefs.pillars.includes(p.slug)} onClick={() => togglePillar(p.slug)} className={chip(prefs.pillars.includes(p.slug))}>
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-gray-body">Region</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <button key={r.value} type="button" aria-pressed={prefs.region === r.value} onClick={() => setPrefs((p) => ({ ...p, region: r.value }))} className={chip(prefs.region === r.value)}>
                {r.label}
              </button>
            ))}
          </div>
          <button type="button" onClick={save} className="mt-5 w-full rounded-pill bg-brand py-2 text-sm font-semibold text-brand-fg hover:bg-brand-dim">
            Save
          </button>
          <p className="mt-2 text-center text-xs text-gray-body">Saved on this device. No account needed.</p>
        </div>
      )}
    </div>
  );
}
