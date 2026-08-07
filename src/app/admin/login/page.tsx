"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await signIn("resend", { email, redirect: false });
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm rounded-card border border-border-dark bg-ink p-8 text-white">
        <span className="inline-block rounded-pill bg-lime px-4 py-1.5 font-bold text-white">Trafy</span>
        <h1 className="mt-6 text-2xl font-bold">Admin sign in</h1>
        <p className="mt-2 text-sm text-gray-bodyDark">Only pre-approved Trafy admin emails can access this panel.</p>

        {sent ? (
          <p className="mt-8 rounded-card border border-lime/30 bg-lime/10 p-4 text-sm text-lime">
            Check {email} for a sign-in link.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 space-y-3">
            <Input
              type="email"
              required
              placeholder="you@trafy.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-ink-soft text-white placeholder:text-gray-bodyDark"
            />
            <Button type="submit" variant="primary" className="w-full">Send sign-in link</Button>
          </form>
        )}
      </div>
    </main>
  );
}
