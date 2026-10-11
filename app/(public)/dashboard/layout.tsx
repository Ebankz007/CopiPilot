import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardNav } from "@/components/dashboard/sidebar";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unread = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {user.fullName.split(" ")[0]}&apos;s dashboard
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <Badge tone="brand">{user.role === "AFFILIATE" ? "Affiliate" : "Client"}</Badge>
            <span>{user.email}</span>
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-2">
            <DashboardNav unread={unread} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
