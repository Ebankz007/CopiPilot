import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { DangerButton } from "@/components/admin/danger-button";
import { EmptyState } from "@/components/ui/empty-state";
import { deletePageAction } from "@/app/admin/actions/content";

export default async function AdminPagesPage() {
  await requirePermission("content");
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <>
      <AdminHeader
        title="Pages"
        description="Legal and informational pages rendered from Markdown. Draft pages stay hidden from the public site."
        action={
          <ButtonLink href="/admin/pages/new" size="sm">
            <Plus className="h-4 w-4" />
            New page
          </ButtonLink>
        }
      />

      {pages.length === 0 ? (
        <EmptyState
          title="No pages yet"
          description="Create your first page to get started."
          action={
            <ButtonLink href="/admin/pages/new" size="sm">
              New page
            </ButtonLink>
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>Title</th>
                <th className={thClass}>Slug</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Updated</th>
                <th className={thClass} />
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className={tdClass}>
                    <span className="font-medium text-foreground">{page.title}</span>
                  </td>
                  <td className={tdClass}>
                    <code className="text-xs text-faint">/{page.slug}</code>
                  </td>
                  <td className={tdClass}>
                    <Badge tone={page.status === "PUBLISHED" ? "success" : "warning"}>
                      {page.status}
                    </Badge>
                  </td>
                  <td className={tdClass}>
                    {page.updatedAt.toLocaleDateString()}
                  </td>
                  <td className={tdClass}>
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Link>
                      <form action={deletePageAction}>
                        <input type="hidden" name="id" value={page.id} />
                        <DangerButton
                          message={`Delete “${page.title}”? This cannot be undone.`}
                        />
                      </form>
                    </div>
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
