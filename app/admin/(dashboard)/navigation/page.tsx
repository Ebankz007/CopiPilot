import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Select } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import {
  createNavAction,
  deleteNavAction,
  updateNavAction,
} from "@/app/admin/actions/content";

export default async function AdminNavigationPage() {
  await requirePermission("content");
  const items = await prisma.navigationItem.findMany({
    orderBy: [{ location: "asc" }, { order: "asc" }],
  });

  const header = items.filter((i) => i.location === "HEADER");
  const footer = items.filter((i) => i.location === "FOOTER");

  return (
    <>
      <AdminHeader
        title="Navigation"
        description="Header and footer links. Order controls display sequence; disabled items are hidden."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add link
        </h2>
        <ActionForm action={createNavAction} submitLabel="Add item">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" name="label" required />
            </div>
            <div>
              <Label htmlFor="url">URL</Label>
              <Input id="url" name="url" placeholder="/strategies" required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Select id="location" name="location" defaultValue="HEADER">
                <option value="HEADER">Header</option>
                <option value="FOOTER">Footer</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="order">Order</Label>
              <Input id="order" name="order" type="number" defaultValue={0} />
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox name="isEnabled" defaultChecked label="Enabled" />
            <Checkbox name="isExternal" label="Opens in new tab" />
          </div>
        </ActionForm>
      </div>

      {[
        { title: "Header", list: header },
        { title: "Footer", list: footer },
      ].map((group) => (
        <section key={group.title} className="mb-8">
          <h2 className="mb-3 font-display text-base font-semibold text-foreground">
            {group.title} ({group.list.length})
          </h2>
          <div className="space-y-2">
            {group.list.map((item) => (
              <details key={item.id} className="rounded-xl border border-border bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3">
                  <span className="text-sm text-foreground">
                    {item.label}{" "}
                    <code className="ml-2 text-xs text-faint">{item.url}</code>
                  </span>
                  <span className="text-xs text-faint">
                    {item.isEnabled ? "enabled" : "hidden"} · #{item.order}
                  </span>
                </summary>
                <div className="border-t border-border p-4">
                  <ActionForm action={updateNavAction} submitLabel="Save">
                    <input type="hidden" name="id" value={item.id} />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <Label>Label</Label>
                        <Input name="label" defaultValue={item.label} required />
                      </div>
                      <div>
                        <Label>URL</Label>
                        <Input name="url" defaultValue={item.url} required />
                      </div>
                      <div>
                        <Label>Location</Label>
                        <Select name="location" defaultValue={item.location}>
                          <option value="HEADER">Header</option>
                          <option value="FOOTER">Footer</option>
                        </Select>
                      </div>
                      <div>
                        <Label>Order</Label>
                        <Input name="order" type="number" defaultValue={item.order} />
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-6">
                      <Checkbox name="isEnabled" defaultChecked={item.isEnabled} label="Enabled" />
                      <Checkbox name="isExternal" defaultChecked={item.isExternal} label="New tab" />
                    </div>
                  </ActionForm>
                  <form action={deleteNavAction} className="mt-3">
                    <input type="hidden" name="id" value={item.id} />
                    <DangerButton message={`Delete “${item.label}”?`} />
                  </form>
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
