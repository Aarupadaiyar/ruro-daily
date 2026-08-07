import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TrendingCompany, UpcomingEvent } from "@/types";

export function TrendingCompanies({ companies }: { companies: TrendingCompany[] }) {
  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Trending Companies</p>
      <ul className="mt-4 space-y-3">
        {companies.map((c) => (
          <li key={c.slug} className="flex items-center justify-between text-sm">
            <Link href={`/intelligence?company=${c.slug}`} className="text-ink hover:underline">{c.name}</Link>
            <span className="text-xs text-ink/50">{c.mentionCount} stories</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function UpcomingEvents({ events }: { events: UpcomingEvent[] }) {
  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Upcoming AI Events</p>
      <ul className="mt-4 space-y-4">
        {events.map((e) => (
          <li key={e.name}>
            <a href={e.url} className="text-sm font-medium text-ink hover:underline">{e.name}</a>
            <p className="text-xs text-ink/50">{e.date} · {e.location}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function PopularTags({ tags }: { tags: string[] }) {
  return (
    <Card className="p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Popular Tags</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link key={tag} href={`/intelligence?tag=${tag}`}>
            <Badge variant="outline">{tag}</Badge>
          </Link>
        ))}
      </div>
    </Card>
  );
}
