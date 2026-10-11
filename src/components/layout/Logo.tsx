import { cn } from "@/lib/utils";

/**
 * The RURO wordmark (classic Garamond capitals) with a small "Daily" tag
 * marking this as the daily-news product. Rendered as live text so it stays
 * crisp at every size; to use the original artwork instead, drop the file at
 * /public/ruro-logo.png and swap the <span> below for an <Image>.
 */
export function Logo({ className, tag = true }: { className?: string; tag?: boolean }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 text-ink", className)}>
      <span className="font-logo text-[1.9rem] font-semibold leading-none tracking-[0.08em]">RURO</span>
      {tag && (
        <span className="rounded-sm border border-ink/25 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase leading-none tracking-[0.2em] text-gray-body">
          Daily
        </span>
      )}
    </span>
  );
}
