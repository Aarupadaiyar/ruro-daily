"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ArticleCardData } from "@/types";

export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <Card className="group flex flex-col overflow-hidden p-0">
      <Link href={`/intelligence/news/${article.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-cream-dim">
        {article.thumbnailUrl ? (
          <Image
            src={article.thumbnailUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-body">Trafy Intelligence</div>
        )}
        <Badge variant="lime" className="absolute left-4 top-4">{article.category.name}</Badge>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link href={`/intelligence/news/${article.slug}`}>
          <h3 className="text-lg font-bold leading-snug text-ink group-hover:underline">{article.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-ink/55">{article.summary}</p>

        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 text-xs text-ink/45">
          <span>{article.source.name} · {formatDate(article.publishedAt)}</span>
          <div className="flex items-center gap-3">
            <span>{article.readingTimeMins} min</span>
            <button aria-label="Bookmark" className="hover:text-ink"><Bookmark size={15} /></button>
            <button aria-label="Share" className="hover:text-ink"><Share2 size={15} /></button>
          </div>
        </div>
      </div>
    </Card>
  );
}
