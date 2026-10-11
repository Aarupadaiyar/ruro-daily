import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";
import type { PillarSlug } from "@/lib/categories";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "eyebrow" | "brand" | "outline" | PillarSlug;
}

export function Badge({ className, variant = "outline", ...props }: BadgeProps) {
  const styles = {
    eyebrow: "border border-border bg-paper text-gray-body",
    brand:   "bg-brand-tint text-brand",
    outline: "border border-border bg-paper text-gray-body",
    // Pillar chips: a faint wash of the pillar hue — readable, never loud.
    ai:      "bg-pillar-ai/10 text-pillar-ai",
    tech:    "bg-pillar-tech/10 text-pillar-tech",
    finance: "bg-pillar-finance/10 text-pillar-finance",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide",
        styles,
        className
      )}
      {...props}
    />
  );
}
