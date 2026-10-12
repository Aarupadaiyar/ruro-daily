import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getStoryTimeline } from "@/lib/articles";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const items = await getStoryTimeline((await params).id);
  return items[0] ? { title: `Story: ${items[0].title}`, robots: { index: false } } : {};
}

/** Story timeline: every outlet's take on one event, oldest first. */
export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const items = await getStoryTimeline((await params).id);
  if (items.length === 0) notFound();
  const first = items[0]!;
  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" });

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">Story timeline</p>
        <h1 className="mt-2 font-serif text-display-md text-ink">{first.title}</h1>
        <p className="mt-2 text-gray-body">
          {items.length} reports
          {(() => {
            const outlets = new Set(items.map((i) => i.source.slug)).size;
            return outlets > 1 ? ` from ${outlets} outlets` : "";
          })()}
          , in the order they were published.
        </p>

        <ol className="mt-10 border-l border-border">
          {items.map((a) => (
            <li key={a.id} className="relative pb-8 pl-6 last:pb-0">
              <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-brand" aria-hidden="true" />
              <time dateTime={a.publishedAt} className="text-xs tabular-nums text-gray-body">{fmt.format(new Date(a.publishedAt))}</time>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={a.pillar}>{a.category.name}</Badge>
                <span className="text-xs text-gray-body">{a.source.name}</span>
              </div>
              <h2 className="mt-2 font-serif text-lg font-semibold leading-snug text-ink">
                <Link href={`/news/${a.slug}`} className="hover:underline hover:decoration-ink/25 hover:underline-offset-4">{a.title}</Link>
              </h2>
              <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-gray-body">{a.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
