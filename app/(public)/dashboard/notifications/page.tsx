import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(public)/dashboard/actions";

export default async function NotificationsPage() {
  const user = await requireUser();
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-foreground">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-muted">
            Updates about your account, investments, and security.
          </p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsReadAction}>
            <Button type="submit" variant="secondary" size="sm">
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          title="No notifications"
          description="You're all caught up. We'll let you know when something happens."
        />
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-2xl border p-4",
                n.isRead
                  ? "border-border bg-card"
                  : "border-brand/25 bg-brand/[0.05]",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 gap-3">
                  <Bell
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      n.isRead ? "text-faint" : "text-brand",
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    {n.body && <p className="mt-1 text-sm text-muted">{n.body}</p>}
                    <p className="mt-1.5 text-xs text-faint">
                      {formatDateTime(n.createdAt)}
                      {n.link && (
                        <>
                          {" · "}
                          <Link href={n.link} className="text-brand hover:underline">
                            View
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                {!n.isRead && (
                  <form action={markNotificationReadAction}>
                    <input type="hidden" name="id" value={n.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      Mark read
                    </Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
