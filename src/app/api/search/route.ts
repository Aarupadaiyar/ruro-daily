import { NextRequest, NextResponse } from "next/server";
import { searchArticles } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json([]);
  return NextResponse.json(await searchArticles(q, { take: 8 }));
}
