"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, X, Star, Pin, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface AdminArticle {
  id: string;
  title: string;
  status: string;
  isFeatured: boolean;
  isPinned: boolean;
  publishedAt: string | null;
  scrapedAt: string;
  source: { name: string };
  category: { name: string };
}

export function ArticleTable({ filters }: { filters: Record<string, string> }) {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const qs = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/admin/articles?${qs}`);
    if (res.ok) setArticles(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  async function patch(id: string, data: Record<string, unknown>) {
    await fetch(`/api/admin/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this article permanently?")) return;
    await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-sm text-gray-body">Loading articles…</p>;
  if (articles.length === 0) return <p className="text-sm text-gray-body">No articles match these filters.</p>;

  return (
    <div className="overflow-hidden rounded-card border border-border bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-cream-dim text-left text-xs uppercase tracking-wide text-gray-body">
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Source</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => (
            <tr key={a.id} className="border-b border-border last:border-none">
              <td className="max-w-xs px-4 py-3 font-medium text-ink">{a.title}</td>
              <td className="px-4 py-3 text-gray-body">{a.source.name}</td>
              <td className="px-4 py-3"><Badge variant="outline">{a.category.name}</Badge></td>
              <td className="px-4 py-3"><Badge variant={a.status === "PUBLISHED" ? "brand" : "outline"}>{a.status}</Badge></td>
              <td className="px-4 py-3 text-gray-body">{formatDate(a.publishedAt ?? a.scrapedAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {a.status === "PENDING" && (
                    <>
                      <button title="Approve" onClick={() => patch(a.id, { status: "APPROVED" })} className="rounded-pill p-1.5 hover:bg-brand/30"><Check size={15} /></button>
                      <button title="Reject" onClick={() => patch(a.id, { status: "REJECTED" })} className="rounded-pill p-1.5 hover:bg-red-100"><X size={15} /></button>
                    </>
                  )}
                  {a.status === "APPROVED" && (
                    <Button size="sm" variant="primary" onClick={() => patch(a.id, { status: "PUBLISHED" })}>Publish</Button>
                  )}
                  <button title="Feature" onClick={() => patch(a.id, { isFeatured: !a.isFeatured })} className={`rounded-pill p-1.5 hover:bg-brand/30 ${a.isFeatured ? "text-ink" : "text-gray-body"}`}><Star size={15} fill={a.isFeatured ? "currentColor" : "none"} /></button>
                  <button title="Pin" onClick={() => patch(a.id, { isPinned: !a.isPinned })} className={`rounded-pill p-1.5 hover:bg-brand/30 ${a.isPinned ? "text-ink" : "text-gray-body"}`}><Pin size={15} fill={a.isPinned ? "currentColor" : "none"} /></button>
                  <Link href={`/admin/articles/${a.id}/edit`} title="Edit" className="rounded-pill p-1.5 text-gray-body hover:bg-cream-dim"><Eye size={15} /></Link>
                  <button title="Delete" onClick={() => remove(a.id)} className="rounded-pill p-1.5 text-gray-body hover:bg-red-100 hover:text-red-600"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
