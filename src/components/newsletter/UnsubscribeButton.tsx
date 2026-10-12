"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function UnsubscribeButton({ email, token }: { email: string; token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function confirm() {
    setStatus("loading");
    const res = await fetch(`/api/newsletter/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => null);
    setStatus(res?.ok ? "done" : "error");
  }

  if (status === "done") return <p className="mt-6 text-ink">You&apos;re unsubscribed. Sorry to see you go — you can resubscribe any time from the site.</p>;
  return (
    <div className="mt-6">
      <Button onClick={confirm} disabled={status === "loading"}>{status === "loading" ? "Unsubscribing…" : "Unsubscribe"}</Button>
      {status === "error" && <p className="mt-3 text-sm text-red-700">This link is invalid or expired. Use the link from your latest email.</p>}
    </div>
  );
}
