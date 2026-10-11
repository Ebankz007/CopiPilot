import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { deleteFaqAction, saveFaqAction } from "@/app/admin/actions/engagement";

export default async function AdminFaqsPage() {
  await requirePermission("faq");
  const faqs = await prisma.faq.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminHeader
        title="FAQs"
        description="Questions shown on the homepage, FAQ page, and pricing page."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add FAQ
        </h2>
        <ActionForm action={saveFaqAction} submitLabel="Create FAQ">
          <div>
            <Label>Question</Label>
            <Input name="question" required />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea name="answer" rows={4} required />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Order</Label>
              <Input name="order" type="number" defaultValue={faqs.length} />
            </div>
            <div className="flex items-end pb-2.5">
              <Checkbox name="isEnabled" defaultChecked label="Enabled" />
            </div>
          </div>
        </ActionForm>
      </div>

      <div className="space-y-3">
        {faqs.map((faq) => (
          <details key={faq.id} className="rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <p className="text-sm font-medium text-foreground">{faq.question}</p>
              <span className="shrink-0 text-xs text-faint">
                {faq.isEnabled ? "enabled" : "hidden"}
              </span>
            </summary>
            <div className="border-t border-border p-5">
              <ActionForm action={saveFaqAction} submitLabel="Save">
                <input type="hidden" name="id" value={faq.id} />
                <div>
                  <Label>Question</Label>
                  <Input name="question" defaultValue={faq.question} required />
                </div>
                <div>
                  <Label>Answer</Label>
                  <Textarea name="answer" rows={4} defaultValue={faq.answer} required />
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Order</Label>
                    <Input name="order" type="number" defaultValue={faq.order} />
                  </div>
                  <div className="flex items-end pb-2.5">
                    <Checkbox name="isEnabled" defaultChecked={faq.isEnabled} label="Enabled" />
                  </div>
                </div>
              </ActionForm>
              <form action={deleteFaqAction} className="mt-3">
                <input type="hidden" name="id" value={faq.id} />
                <DangerButton message="Delete this FAQ?" />
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
