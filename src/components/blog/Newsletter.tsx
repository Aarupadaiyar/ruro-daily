"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function Newsletter({
  variant = "card",
  source,
}: {
  variant?: "card" | "inline";
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

  const form = (
    <form onSubmit={handleSubmit} className={variant === "inline" ? "flex flex-col gap-2 sm:flex-row" : "mt-4 flex flex-col gap-2"}>
      <label htmlFor={`nl-${source}`} className="sr-only">Email address</label>
      <Input
        id={`nl-${source}`}
        type="email"
        required
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" variant="primary" disabled={status === "loading" || status === "done"}>
        {status === "done" ? "Subscribed ✓" : "Subscribe"}
      </Button>
      {status === "error" && <p className="text-xs text-red-700">Something went wrong. Try again.</p>}
    </form>
  );

  if (variant === "inline") return form;

  return (
    <div className="rounded-card border border-border bg-paper p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-body">Morning email</p>
      <h3 className="mt-2 font-serif text-lg font-semibold text-ink">Get the daily Bites</h3>
      <p className="mt-1 text-sm text-gray-body">Top stories in two minutes, every morning.</p>
      {form}
    </div>
  );
}
