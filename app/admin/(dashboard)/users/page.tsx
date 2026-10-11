import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { updateUserStatusAction } from "@/app/admin/actions/engagement";

const ROLE_LABEL: Record<string, string> = {
  RETAIL: "Retail",
  IB: "IB",
  REFERRAL: "Referral",
};

export default async function AdminUsersPage() {
  await requirePermission("users");
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminHeader
        title="Users"
        description="Registered platform accounts. Suspend to block sign-in without deleting data."
      />

      {users.length === 0 ? (
        <EmptyState title="No users yet" description="Registered accounts will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Name</th>
                <th className={thClass}>Email</th>
                <th className={thClass}>Role</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Joined</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={tdClass}>
                    <span className="font-medium text-foreground">{user.fullName}</span>
                  </td>
                  <td className={tdClass}>{user.email}</td>
                  <td className={tdClass}>{ROLE_LABEL[user.role] ?? user.role}</td>
                  <td className={tdClass}>
                    <Badge tone={user.status === "ACTIVE" ? "success" : "danger"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className={tdClass}>{user.createdAt.toLocaleDateString()}</td>
                  <td className={tdClass}>
                    <form action={updateUserStatusAction} className="flex justify-end">
                      <input type="hidden" name="id" value={user.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={user.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE"}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                      >
                        {user.status === "ACTIVE" ? "Suspend" : "Activate"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
