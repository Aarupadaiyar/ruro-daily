"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Newspaper, Database, ScrollText, Mail, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/sources", label: "Sources", icon: Database },
  { href: "/admin/logs", label: "Scrape Logs", icon: ScrollText },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-border-dark bg-ink p-6 text-white">
      <div>
        <span className="inline-block rounded-pill bg-lime px-4 py-1.5 font-bold text-white">Trafy</span>
        <p className="mt-1 text-xs uppercase tracking-wide text-gray-bodyDark">Intelligence Admin</p>

        <nav className="mt-8 space-y-1">
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium",
                  active ? "bg-lime text-white" : "text-gray-bodyDark hover:bg-ink-soft hover:text-white"
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="flex items-center gap-3 rounded-pill px-4 py-2.5 text-sm font-medium text-gray-bodyDark hover:bg-ink-soft hover:text-white"
      >
        <LogOut size={16} />
        Sign out
      </button>
    </aside>
  );
}
