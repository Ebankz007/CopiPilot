import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import {
  deleteTestimonialAction,
  saveTestimonialAction,
} from "@/app/admin/actions/engagement";

export default async function AdminTestimonialsPage() {
  await requirePermission("content");
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <AdminHeader
        title="Testimonials"
        description="Member quotes shown on the homepage. Only publish quotes you can stand behind."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add testimonial
        </h2>
        <ActionForm action={saveTestimonialAction} submitLabel="Create testimonial">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Role</Label>
              <Input name="role" placeholder="Retail trader" />
            </div>
            <div>
              <Label>Location / company</Label>
              <Input name="company" placeholder="London" />
            </div>
          </div>
          <div>
            <Label>Quote</Label>
            <Textarea name="quote" rows={3} required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Order</Label>
              <Input name="order" type="number" defaultValue={testimonials.length} />
            </div>
            <div className="flex items-end pb-2.5">
              <Checkbox name="isEnabled" defaultChecked label="Enabled" />
            </div>
          </div>
        </ActionForm>
      </div>

      <div className="space-y-3">
        {testimonials.map((t) => (
          <details key={t.id} className="rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{t.name}</p>
                <p className="truncate text-xs text-muted">{t.quote}</p>
              </div>
              <span className="shrink-0 text-xs text-faint">
                {t.isEnabled ? "enabled" : "hidden"}
              </span>
            </summary>
            <div className="border-t border-border p-5">
              <ActionForm action={saveTestimonialAction} submitLabel="Save">
                <input type="hidden" name="id" value={t.id} />
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <Label>Name</Label>
                    <Input name="name" defaultValue={t.name} required />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input name="role" defaultValue={t.role ?? ""} />
                  </div>
                  <div>
                    <Label>Location / company</Label>
                    <Input name="company" defaultValue={t.company ?? ""} />
                  </div>
                </div>
                <div>
                  <Label>Quote</Label>
                  <Textarea name="quote" rows={3} defaultValue={t.quote} required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Order</Label>
                    <Input name="order" type="number" defaultValue={t.order} />
                  </div>
                  <div className="flex items-end pb-2.5">
                    <Checkbox name="isEnabled" defaultChecked={t.isEnabled} label="Enabled" />
                  </div>
                </div>
              </ActionForm>
              <form action={deleteTestimonialAction} className="mt-3">
                <input type="hidden" name="id" value={t.id} />
                <DangerButton message={`Delete testimonial from “${t.name}”?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
