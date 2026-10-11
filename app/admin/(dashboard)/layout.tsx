import { requireAdmin } from "@/lib/auth";
import { permissionsFor } from "@/lib/rbac";
import { AdminSidebar } from "@/components/admin/sidebar";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar adminName={admin.name} permissions={permissionsFor(admin.role)} />
      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
