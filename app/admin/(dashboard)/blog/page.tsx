import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import {
  deleteBlogCategoryAction,
  deleteBlogPostAction,
  saveBlogCategoryAction,
  saveBlogPostAction,
} from "@/app/admin/actions/catalog";

const STATUS = ["DRAFT", "SCHEDULED", "PUBLISHED"] as const;

function toLocalInput(date: Date | null): string {
  if (!date) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export default async function AdminBlogPage() {
  await requirePermission("blog");

  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: { select: { name: true } }, tags: { include: { tag: true } } },
    }),
    prisma.blogCategory.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <>
      <AdminHeader
        title="Blog"
        description="Write and publish articles. Markdown is supported in the body."
      />

      {/* Categories */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Categories
        </h2>
        <ActionForm action={saveBlogCategoryAction} submitLabel="Add category">
          <div className="grid gap-5 sm:grid-cols-4">
            <div>
              <Label>Name</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input name="slug" placeholder="market-insights" required />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="description" />
            </div>
            <div>
              <Label>Order</Label>
              <Input name="order" type="number" defaultValue={categories.length} />
            </div>
          </div>
        </ActionForm>

        {categories.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {categories.map((c) => (
              <form
                key={c.id}
                action={deleteBlogCategoryAction}
                className="flex items-center gap-2 rounded-full border border-border bg-elevated px-3 py-1"
              >
                <input type="hidden" name="id" value={c.id} />
                <span className="text-xs text-muted">{c.name}</span>
                <DangerButton message={`Delete category “${c.name}”?`}>×</DangerButton>
              </form>
            ))}
          </div>
        )}
      </div>

      {/* New post */}
      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          New post
        </h2>
        <ActionForm action={saveBlogPostAction} submitLabel="Create post">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Title</Label>
              <Input name="title" required />
            </div>
            <div>
              <Label>Slug</Label>
              <Input name="slug" placeholder="how-to-think-about-risk" required />
            </div>
          </div>
          <div>
            <Label>Excerpt</Label>
            <Input name="excerpt" required />
          </div>
          <div>
            <Label>Content (Markdown)</Label>
            <Textarea name="content" rows={8} required />
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Category</Label>
              <Select name="categoryId" defaultValue="">
                <option value="">Uncategorised</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Author</Label>
              <Input name="authorName" defaultValue="CopiPilot Desk" />
            </div>
            <div>
              <Label>Status</Label>
              <Select name="status" defaultValue="DRAFT">
                {STATUS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input name="tags" placeholder="risk, strategy, education" />
            </div>
            <div>
              <Label>Cover image URL</Label>
              <Input name="coverImageUrl" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>SEO title</Label>
              <Input name="seoTitle" />
            </div>
            <div>
              <Label>SEO description</Label>
              <Input name="seoDescription" />
            </div>
            <div>
              <Label>Publish date</Label>
              <Input name="publishedAt" type="datetime-local" />
            </div>
          </div>
          <Checkbox name="isFeatured" label="Featured" />
        </ActionForm>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.map((post) => (
          <details key={post.id} className="rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{post.title}</p>
                <p className="truncate text-xs text-faint">
                  /{post.slug} · {post.category?.name ?? "Uncategorised"} ·{" "}
                  {post.publishedAt ? formatDate(post.publishedAt) : "unpublished"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {post.isFeatured && <Badge tone="brand">Featured</Badge>}
                <Badge tone={post.status === "PUBLISHED" ? "success" : "neutral"}>
                  {post.status}
                </Badge>
              </div>
            </summary>
            <div className="border-t border-border p-5">
              <ActionForm action={saveBlogPostAction} submitLabel="Save post">
                <input type="hidden" name="id" value={post.id} />
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Title</Label>
                    <Input name="title" defaultValue={post.title} required />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input name="slug" defaultValue={post.slug} required />
                  </div>
                </div>
                <div>
                  <Label>Excerpt</Label>
                  <Input name="excerpt" defaultValue={post.excerpt} required />
                </div>
                <div>
                  <Label>Content (Markdown)</Label>
                  <Textarea name="content" rows={10} defaultValue={post.content} required />
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <Label>Category</Label>
                    <Select name="categoryId" defaultValue={post.categoryId ?? ""}>
                      <option value="">Uncategorised</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Author</Label>
                    <Input name="authorName" defaultValue={post.authorName} />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select name="status" defaultValue={post.status}>
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label>Tags (comma-separated)</Label>
                    <Input
                      name="tags"
                      defaultValue={post.tags.map((t) => t.tag.name).join(", ")}
                    />
                  </div>
                  <div>
                    <Label>Cover image URL</Label>
                    <Input name="coverImageUrl" defaultValue={post.coverImageUrl ?? ""} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <Label>SEO title</Label>
                    <Input name="seoTitle" defaultValue={post.seoTitle ?? ""} />
                  </div>
                  <div>
                    <Label>SEO description</Label>
                    <Input name="seoDescription" defaultValue={post.seoDescription ?? ""} />
                  </div>
                  <div>
                    <Label>Publish date</Label>
                    <Input
                      name="publishedAt"
                      type="datetime-local"
                      defaultValue={toLocalInput(post.publishedAt)}
                    />
                  </div>
                </div>
                <Checkbox name="isFeatured" defaultChecked={post.isFeatured} label="Featured" />
              </ActionForm>
              <form action={deleteBlogPostAction} className="mt-3">
                <input type="hidden" name="id" value={post.id} />
                <DangerButton message={`Delete post “${post.title}”?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
