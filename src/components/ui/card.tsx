import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-black/10 bg-white shadow-soft transition-shadow hover:shadow-soft-lg", className)} {...props} />;
}

export function CardDark({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-card border border-border-dark bg-ink text-white", className)} {...props} />;
}
