import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  deleteMediaAction,
  uploadMediaAction,
} from "@/app/admin/actions/engagement";

export default async function AdminMediaPage() {
  await requirePermission("media");
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <>
      <AdminHeader
        title="Media"
        description="Upload images for logos, OG images, and testimonial avatars. PNG, JPEG, WEBP, GIF, or SVG."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Upload file
        </h2>
        <ActionForm action={uploadMediaAction} submitLabel="Upload">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                required
                className="pt-2"
              />
            </div>
            <div>
              <Label htmlFor="alt">Alt text</Label>
              <Input id="alt" name="alt" placeholder="Describe the image" />
            </div>
          </div>
        </ActionForm>
      </div>

      {media.length === 0 ? (
        <EmptyState title="No media yet" description="Uploaded files will appear here." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex h-36 items-center justify-center bg-[#0b0d11] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.alt ?? item.originalName}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-foreground">
                  {item.originalName}
                </p>
                <p className="mt-0.5 text-[11px] text-faint">
                  {(item.size / 1024).toFixed(0)} KB
                </p>
                <form action={deleteMediaAction} className="mt-2">
                  <input type="hidden" name="id" value={item.id} />
                  <DangerButton message={`Delete ${item.originalName}?`} />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
