"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
      if (res.ok) setResults(await res.json());
    }, 200); // debounce

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative">
      <div className={cn("flex items-center gap-2 rounded-pill border border-border bg-white px-4", compact ? "py-2" : "py-3")}>
        <Search size={16} className="text-ink/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search articles, tags, companies…"
          className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-card border border-black/10 bg-white shadow-soft-lg">
          {results.map((r) => (
            <button
              key={r.id}
              onMouseDown={() => router.push(`/intelligence/news/${r.slug}`)}
              className="block w-full border-b border-black/10 px-4 py-3 text-left last:border-none hover:bg-black/5"
            >
              <p className="text-sm font-medium text-ink">{r.title}</p>
              <p className="mt-0.5 text-xs text-ink/50">{r.category.name} · {r.source.name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
