import { getMarketSnapshot } from "@/lib/market";
import { cn } from "@/lib/utils";

/** Thin market strip under the header: Nifty, Sensex, USD/INR, gold, BTC, S&P. */
export async function MarketStrip() {
  const quotes = await getMarketSnapshot();
  if (quotes.length === 0) return null;

  return (
    <div className="border-b border-border bg-paper">
      <ul className="mx-auto flex max-w-7xl gap-6 overflow-x-auto px-4 py-1.5 text-xs sm:px-6 lg:px-10 [scrollbar-width:none]" aria-label="Market snapshot">
        {quotes.map((q) => {
          const up = q.changePct >= 0;
          return (
            <li key={q.label} className="flex shrink-0 items-baseline gap-1.5 tabular-nums">
              <span className="text-gray-body">{q.label}</span>
              <span className="font-medium text-ink">
                {q.unit}
                {q.price.toLocaleString("en-IN", { maximumFractionDigits: q.decimals, minimumFractionDigits: q.decimals })}
              </span>
              <span className={cn(up ? "text-pillar-finance" : "text-red-700")}>
                {up ? "▲" : "▼"} {Math.abs(q.changePct).toFixed(2)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
