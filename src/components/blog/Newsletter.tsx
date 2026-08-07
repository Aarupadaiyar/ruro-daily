"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Newsletter({
  variant = "card",
  source,
}: {
  variant?: "card" | "on-lime";
  source: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (variant === "on-lime") {
    return (
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-pill bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 outline-none"
        />
        <Button type="submit" variant="secondary" disabled={status === "loading"}>
          {status === "done" ? "Subscribed ✓" : "Subscribe"}
        </Button>
      </form>
    );
  }

  return (
    <div className="rounded-card border border-border bg-white/5 p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-body">Newsletter</p>
      <h3 className="mt-2 text-lg font-bold text-white">Weekly AI briefing</h3>
      <p className="mt-1 text-sm text-gray-body">The stories that mattered, in your inbox every Friday.</p>
      <form onSubmit={handleSubmit} className={cn("mt-4 flex flex-col gap-2")}>
        <Input
          type="email"
          required
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" variant="primary" disabled={status === "loading"}>
          {status === "done" ? "Subscribed ✓" : "Subscribe"}
        </Button>
        {status === "error" && <p className="text-xs text-red-400">Something went wrong. Try again.</p>}
      </form>
    </div>
  );
}
