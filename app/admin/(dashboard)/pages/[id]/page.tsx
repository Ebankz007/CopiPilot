import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { updatePageAction } from "@/app/admin/actions/content";

export default async function EditPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("content");
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <>
      <AdminHeader
        title="Edit page"
        description={`Editing “${page.title}”. Changes publish immediately when status is Published.`}
      />
      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <ActionForm action={updatePageAction} submitLabel="Save changes">
          <input type="hidden" name="id" value={page.id} />
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={page.title} required />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" defaultValue={page.slug} required />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content (Markdown)</Label>
            <Textarea
              id="content"
              name="content"
              rows={18}
              defaultValue={page.content}
              className="font-mono text-xs"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="metaTitle">Meta title</Label>
              <Input id="metaTitle" name="metaTitle" defaultValue={page.metaTitle ?? ""} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select id="status" name="status" defaultValue={page.status}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              rows={2}
              defaultValue={page.metaDescription ?? ""}
            />
          </div>
        </ActionForm>
      </div>
    </>
  );
}
