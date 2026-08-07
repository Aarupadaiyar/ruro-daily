import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

// This layout only wraps the (protected) route group — dashboard, articles,
// sources, logs, newsletter. /admin/login lives as a sibling outside this
// group specifically so it's never subject to this redirect.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Explicitly light rather than the (now dark) `bg-cream` token: the admin
  // panel is an internal tool, out of scope for the public site's dark
  // theme, and every text-ink heading/table in here assumes a light surface.
  return (
    <div className="flex bg-[#FAFAF0] text-[#0B0B0B]">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  );
}
