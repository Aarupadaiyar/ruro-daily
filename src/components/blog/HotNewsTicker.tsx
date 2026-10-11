interface TickerItem {
  slug: string;
  title: string;
}

/** Slow-scrolling "latest headlines" strip. Pauses on hover; static for reduced motion. */
export function HotNewsTicker({ items }: { items: TickerItem[] }) {
  // Duplicate the list so the CSS marquee loops seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="group flex items-center overflow-hidden border-b border-border bg-paper">
      <span className="z-10 shrink-0 border-r border-border bg-paper px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-brand sm:px-6 lg:px-10">
        Latest
      </span>
      <div className="ticker-track flex w-max gap-10 py-2.5 pl-6 group-hover:[animation-play-state:paused]">
        {loop.map((item, i) => (
          <a
            key={`${item.slug}-${i}`}
            href={`/news/${item.slug}`}
            tabIndex={i >= items.length ? -1 : undefined}
            className="whitespace-nowrap text-sm text-ink/80 hover:text-ink hover:underline"
          >
            {item.title}
          </a>
        ))}
      </div>

      <style>{`
        .ticker-track { animation: marquee 70s linear infinite; }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
