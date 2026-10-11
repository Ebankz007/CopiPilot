import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { DangerButton } from "@/components/admin/danger-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteMessageAction,
  updateMessageStatusAction,
} from "@/app/admin/actions/engagement";

export default async function AdminMessagesPage() {
  await requirePermission("messages");
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        title="Messages"
        description="Enquiries submitted through the contact form."
      />

      {messages.length === 0 ? (
        <EmptyState title="No messages" description="Contact-form submissions will appear here." />
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs text-muted">
                    <a href={`mailto:${m.email}`} className="hover:text-gold">
                      {m.email}
                    </a>
                    {m.phone ? ` · ${m.phone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={m.status === "NEW" ? "gold" : "neutral"}>
                    {m.status}
                  </Badge>
                  <span className="text-xs text-faint">
                    {m.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {m.subject && (
                <p className="mt-3 text-sm font-medium text-foreground">{m.subject}</p>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {m.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                {m.status !== "READ" && (
                  <form action={updateMessageStatusAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="READ" />
                    <button
                      type="submit"
                      className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      Mark read
                    </button>
                  </form>
                )}
                {m.status !== "ARCHIVED" && (
                  <form action={updateMessageStatusAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="status" value="ARCHIVED" />
                    <button
                      type="submit"
                      className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                    >
                      Archive
                    </button>
                  </form>
                )}
                <form action={deleteMessageAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <DangerButton message="Delete this message?" />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
