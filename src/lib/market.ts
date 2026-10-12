import { unstable_cache } from "next/cache";

/**
 * Market snapshot for the top-of-page strip. Uses Yahoo Finance's public
 * chart endpoint (no key). Cached 10 minutes; any failure just hides a quote.
 */
export interface Quote {
  label: string;
  price: number;
  changePct: number;
  /** Prefix for the price, e.g. "$". Empty for index points. */
  unit: string;
  decimals: number;
}

const SYMBOLS = [
  { symbol: "^NSEI",   label: "Nifty 50", unit: "",  decimals: 0 },
  { symbol: "^BSESN",  label: "Sensex",   unit: "",  decimals: 0 },
  { symbol: "INR=X",   label: "USD/INR",  unit: "₹", decimals: 2 },
  { symbol: "GC=F",    label: "Gold",     unit: "$", decimals: 0 },
  { symbol: "BTC-USD", label: "Bitcoin",  unit: "$", decimals: 0 },
  { symbol: "^GSPC",   label: "S&P 500",  unit: "",  decimals: 0 },
] as const;

async function fetchQuote(s: (typeof SYMBOLS)[number]): Promise<Quote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s.symbol)}?range=5d&interval=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(5_000), cache: "no-store" }
    );
    if (!res.ok) return null;
    const meta = (await res.json())?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    const prev = meta?.chartPreviousClose ?? meta?.previousClose;
    if (typeof price !== "number" || typeof prev !== "number" || prev === 0) return null;
    return { label: s.label, price, changePct: ((price - prev) / prev) * 100, unit: s.unit, decimals: s.decimals };
  } catch {
    return null;
  }
}

export const getMarketSnapshot = unstable_cache(
  async (): Promise<Quote[]> => (await Promise.all(SYMBOLS.map(fetchQuote))).filter((q): q is Quote => q !== null),
  ["market-snapshot"],
  { revalidate: 600 }
);
