import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { createPageAction } from "@/app/admin/actions/content";

export default async function NewPagePage() {
  await requirePermission("content");

  return (
    <>
      <AdminHeader
        title="New page"
        description="Content supports Markdown: # headings, **bold**, *italic*, `code`, and [links](url)."
      />
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <ActionForm action={createPageAction} submitLabel="Create page">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" placeholder="risk-disclosure" required />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea id="content" name="content" rows={16} className="font-mono text-xs" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input id="metaTitle" name="metaTitle" />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue="DRAFT">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea id="metaDescription" name="metaDescription" rows={2} />
          </div>
        </ActionForm>
      </div>
    </>
  );
}
