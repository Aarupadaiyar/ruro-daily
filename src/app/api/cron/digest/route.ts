import { NextResponse } from "next/server";
import { sendDailyDigest } from "@/lib/email/send-digest";

// Standalone trigger for the admin digest, gated the same way as the scrape
// cron — useful for manually resending a digest without re-running the
// scraper. The digest logic lives in src/lib/email/send-digest.ts: route
// files may only export route handlers, or `next build` fails type-checking.
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await sendDailyDigest();
  return NextResponse.json(result);
}
