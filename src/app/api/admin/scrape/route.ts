import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { revalidateTag } from "next/cache";
import { runFullScrape } from "@/lib/scraper";
import { ARTICLES_TAG } from "@/lib/articles";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const summaries = await runFullScrape();
  revalidateTag(ARTICLES_TAG); // show new stories now, not when the 5-min cache expires
  return NextResponse.json({ summaries });
}
