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

  // Same light paper surface as the public site; the sidebar stays dark (bg-ink).
  return (
    <div className="flex bg-cream text-ink">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto p-8">{children}</div>
    </div>
  );
}
