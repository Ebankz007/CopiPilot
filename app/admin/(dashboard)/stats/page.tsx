import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { deleteStatAction, saveStatAction } from "@/app/admin/actions/catalog";

export default async function AdminStatsPage() {
  await requirePermission("content");
  const stats = await prisma.stat.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminHeader
        title="Performance stats"
        description="Headline figures shown on the homepage and About page. Keep these illustrative and labelled as sample data."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add stat
        </h2>
        <ActionForm action={saveStatAction} submitLabel="Create stat">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label>Label</Label>
              <Input name="label" placeholder="Win rate" required />
            </div>
            <div>
              <Label>Value</Label>
              <Input name="value" placeholder="68.5" required />
            </div>
            <div>
              <Label>Suffix</Label>
              <Input name="suffix" placeholder="%" />
            </div>
            <div>
              <Label>Order</Label>
              <Input name="order" type="number" defaultValue={stats.length} />
            </div>
          </div>
          <div>
            <Label>Note</Label>
            <Input name="note" placeholder="Trailing 12 months" />
          </div>
          <Checkbox name="isEnabled" defaultChecked label="Enabled" />
        </ActionForm>
      </div>

      <div className="space-y-3">
        {stats.map((stat) => (
          <details key={stat.id} className="rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <p className="text-sm text-foreground">
                <span className="font-medium">
                  {stat.value}
                  {stat.suffix}
                </span>{" "}
                — {stat.label}
              </p>
              <span className="text-xs text-faint">
                {stat.isEnabled ? "enabled" : "hidden"}
              </span>
            </summary>
            <div className="border-t border-border p-5">
              <ActionForm action={saveStatAction} submitLabel="Save stat">
                <input type="hidden" name="id" value={stat.id} />
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label>Label</Label>
                    <Input name="label" defaultValue={stat.label} required />
                  </div>
                  <div>
                    <Label>Value</Label>
                    <Input name="value" defaultValue={stat.value} required />
                  </div>
                  <div>
                    <Label>Suffix</Label>
                    <Input name="suffix" defaultValue={stat.suffix ?? ""} />
                  </div>
                  <div>
                    <Label>Order</Label>
                    <Input name="order" type="number" defaultValue={stat.order} />
                  </div>
                </div>
                <div>
                  <Label>Note</Label>
                  <Input name="note" defaultValue={stat.note ?? ""} />
                </div>
                <Checkbox name="isEnabled" defaultChecked={stat.isEnabled} label="Enabled" />
              </ActionForm>
              <form action={deleteStatAction} className="mt-3">
                <input type="hidden" name="id" value={stat.id} />
                <DangerButton message={`Delete “${stat.label}”?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
