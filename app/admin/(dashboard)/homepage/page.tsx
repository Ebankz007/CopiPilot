import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Textarea, Checkbox } from "@/components/ui/field";
import { updateHomepageSectionAction } from "@/app/admin/actions/content";

export default async function AdminHomepagePage() {
  await requirePermission("content");
  const sections = await prisma.homepageSection.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <>
      <AdminHeader
        title="Homepage"
        description="Edit each section's copy and structured content. Content is stored as JSON — keep the shape intact."
      />

      <div className="space-y-4">
        {sections.map((section) => (
          <details
            key={section.id}
            className="group rounded-2xl border border-border bg-card"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div>
                <p className="font-medium text-foreground">{section.title}</p>
                <p className="mt-0.5 text-xs text-faint">
                  key: <code>{section.key}</code> · order {section.order}
                </p>
              </div>
              <span
                className={
                  section.isEnabled
                    ? "rounded-full border border-success/30 bg-success/10 px-2.5 py-0.5 text-xs text-success"
                    : "rounded-full border border-border-strong bg-elevated px-2.5 py-0.5 text-xs text-muted"
                }
              >
                {section.isEnabled ? "Enabled" : "Hidden"}
              </span>
            </summary>

            <div className="border-t border-border p-5">
              <ActionForm
                action={updateHomepageSectionAction}
                submitLabel="Save section"
              >
                <input type="hidden" name="id" value={section.id} />
                <input type="hidden" name="key" value={section.key} />

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor={`eyebrow-${section.id}`}>Eyebrow</Label>
                    <Input
                      id={`eyebrow-${section.id}`}
                      name="eyebrow"
                      defaultValue={section.eyebrow ?? ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`order-${section.id}`}>Order</Label>
                    <Input
                      id={`order-${section.id}`}
                      name="order"
                      type="number"
                      defaultValue={section.order}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`title-${section.id}`}>Title</Label>
                  <Input
                    id={`title-${section.id}`}
                    name="title"
                    defaultValue={section.title}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor={`subtitle-${section.id}`}>Subtitle</Label>
                  <Textarea
                    id={`subtitle-${section.id}`}
                    name="subtitle"
                    rows={3}
                    defaultValue={section.subtitle ?? ""}
                  />
                </div>

                <div>
                  <Label htmlFor={`content-${section.id}`}>
                    Content (JSON)
                  </Label>
                  <Textarea
                    id={`content-${section.id}`}
                    name="content"
                    rows={12}
                    className="font-mono text-xs"
                    defaultValue={JSON.stringify(section.content ?? {}, null, 2)}
                  />
                </div>

                <Checkbox
                  name="isEnabled"
                  defaultChecked={section.isEnabled}
                  label="Enabled on the public site"
                />
              </ActionForm>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
