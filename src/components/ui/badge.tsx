import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "eyebrow" | "lime" | "outline";
}

export function Badge({ className, variant = "outline", ...props }: BadgeProps) {
  const styles = {
    eyebrow: "border border-border bg-white/5 text-white",
    lime: "bg-lime text-white",
    outline: "border border-black/10 bg-white text-ink/60",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-3 py-1 text-xs font-medium uppercase tracking-wide",
        styles,
        className
      )}
      {...props}
    />
  );
}
