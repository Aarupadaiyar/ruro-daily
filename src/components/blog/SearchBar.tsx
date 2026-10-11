"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

/**
 * Instant search: suggestions appear as you type; Enter opens the full
 * results page at /search?q=…
 */
export function SearchBar({ compact = false, defaultValue = "", autoFocus = false }: { compact?: boolean; defaultValue?: string; autoFocus?: boolean }) {
  const [query, setQuery] = useState(defaultValue);
  const [results, setResults] = useState<ArticleCardData[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (res.ok) setResults(await res.json());
      } catch {
        // aborted or offline — keep the previous suggestions
      }
    }, 200); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form role="search" onSubmit={submit} className="relative">
      <div className={cn("flex items-center gap-2 rounded-pill border border-border bg-paper px-4 focus-within:border-brand", compact ? "py-2" : "py-3")}>
        <Search size={16} className="shrink-0 text-ink/40" aria-hidden="true" />
        <input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search news…"
          aria-label="Search news"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-card border border-border bg-paper shadow-soft-lg">
          {results.map((r) => (
            <button
              type="button"
              key={r.id}
              onMouseDown={() => router.push(`/news/${r.slug}`)}
              className="block w-full border-b border-border px-4 py-3 text-left hover:bg-cream-dim"
            >
              <p className="text-sm font-medium text-ink">{r.title}</p>
              <p className="mt-0.5 text-xs text-gray-body">{r.category.name} · {r.source.name}</p>
            </button>
          ))}
          <button
            type="submit"
            onMouseDown={(e) => e.preventDefault()}
            className="block w-full px-4 py-3 text-left text-sm font-medium text-brand hover:bg-cream-dim"
          >
            See all results for “{query.trim()}” →
          </button>
        </div>
      )}
    </form>
  );
}
