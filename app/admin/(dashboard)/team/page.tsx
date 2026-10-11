import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ADMIN_ROLES, ADMIN_ROLE_DESCRIPTIONS, ADMIN_ROLE_LABELS } from "@/lib/rbac";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Select } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { formatDateTime } from "@/lib/utils";
import {
  createAdminAction,
  deleteAdminAction,
  updateAdminAction,
} from "@/app/admin/actions/team";

export default async function AdminTeamPage() {
  const current = await requirePermission("team");
  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <AdminHeader
        title="Team"
        description="Manage who can access the admin. Roles map to a fixed permission matrix — see the descriptions below."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add team member
        </h2>
        <ActionForm action={createAdminAction} submitLabel="Add member">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Email</Label>
              <Input name="email" type="email" required />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Role</Label>
              <Select name="role" defaultValue="CONTENT_ADMIN">
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ADMIN_ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Temporary password</Label>
              <Input name="password" type="password" minLength={8} required />
            </div>
            <div className="flex items-end pb-2.5">
              <Checkbox name="isActive" defaultChecked label="Active" />
            </div>
          </div>
          <p className="text-xs text-faint">
            {ADMIN_ROLES.map((r) => `${ADMIN_ROLE_LABELS[r]}: ${ADMIN_ROLE_DESCRIPTIONS[r]}`).join(
              "  •  ",
            )}
          </p>
        </ActionForm>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Name</th>
              <th className={thClass}>Email</th>
              <th className={thClass}>Role</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Last login</th>
              <th className={thClass}>Manage</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => {
              const isSelf = admin.id === current.id;
              return (
                <tr key={admin.id}>
                  <td className={tdClass}>
                    <span className="text-foreground">{admin.name}</span>
                    {isSelf && <span className="ml-2 text-xs text-brand">you</span>}
                  </td>
                  <td className={tdClass}>{admin.email}</td>
                  <td className={tdClass}>
                    <form action={updateAdminAction} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={admin.id} />
                      <input type="hidden" name="isActive" value={admin.isActive ? "on" : ""} />
                      <Select name="role" defaultValue={admin.role} className="h-9 w-40 text-xs">
                        {ADMIN_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ADMIN_ROLE_LABELS[r]}
                          </option>
                        ))}
                      </Select>
                      <Button type="submit" size="sm" variant="ghost" disabled={isSelf}>
                        Save
                      </Button>
                    </form>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={admin.isActive ? "success" : "danger"}>
                      {admin.isActive ? "ACTIVE" : "DISABLED"}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : "—"}
                  </td>
                  <td className={tdClass}>
                    <form action={deleteAdminAction}>
                      <input type="hidden" name="id" value={admin.id} />
                      <DangerButton
                        message={`Remove ${admin.email} from the team?`}
                        className={isSelf ? "pointer-events-none opacity-40" : undefined}
                      >
                        Remove
                      </DangerButton>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
