import { Resend } from "resend";

// Created lazily: `new Resend()` throws without an API key, and `next build`
// loads every route module while collecting page data — so constructing it
// at import time breaks deploys on any environment without RESEND_API_KEY.
let client: Resend | null = null;

/** The Resend client, or null when RESEND_API_KEY is not configured. */
export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  client ??= new Resend(process.env.RESEND_API_KEY);
  return client;
}

export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
