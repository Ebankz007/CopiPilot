import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  countPublishedPosts,
  getBlogCategories,
  getFeaturedPost,
  getPublishedPosts,
} from "@/lib/content";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { BlogCard } from "@/components/site/blog-card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on investing, strategy, risk management, and market structure from the CopiPilot desk.",
};

export const revalidate = 120;

const PER_PAGE = 9;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [posts, total, categories, featured] = await Promise.all([
    getPublishedPosts({
      query: q,
      categorySlug: category,
      take: PER_PAGE,
      skip: (currentPage - 1) * PER_PAGE,
    }),
    countPublishedPosts({ query: q, categorySlug: category }),
    getBlogCategories(),
    currentPage === 1 && !q && !category ? getFeaturedPost() : Promise.resolve(null),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const gridPosts = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  function buildHref(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const merged = { q, category, page: undefined, ...overrides };
    for (const [key, value] of Object.entries(merged)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    return `/blog${qs ? `?${qs}` : ""}`;
  }

  return (
    <>
      <PageHeader
        eyebrow="Blog"
        title="Notes from the CopiPilot desk"
        subtitle="Practical thinking on investing, strategy, risk, and market structure."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Controls */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <form action="/blog" method="get" className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
              <input
                type="search"
                name="q"
                defaultValue={q ?? ""}
                placeholder="Search articles…"
                className="h-11 w-full rounded-xl border border-border-strong bg-[#0a1a2e] pl-9 pr-3 text-sm text-foreground focus:border-brand/60 focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              {category && <input type="hidden" name="category" value={category} />}
            </form>

            <div className="flex flex-wrap gap-2">
              <Link
                href={buildHref({ category: undefined, page: undefined })}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  !category
                    ? "border-brand/50 bg-brand/10 text-brand"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={buildHref({ category: c.slug, page: undefined })}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                    category === c.slug
                      ? "border-brand/50 bg-brand/10 text-brand"
                      : "border-border text-muted hover:text-foreground",
                  )}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Featured */}
          {featured && (
            <Reveal className="mt-8">
              <Link
                href={`/blog/${featured.slug}`}
                className="card card-hover group grid overflow-hidden sm:grid-cols-2"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-elevated sm:aspect-auto">
                  {featured.coverImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.coverImageUrl}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(58,141,255,0.18),transparent_70%)]">
                      <span className="font-display text-3xl font-bold text-brand/40">
                        CopiPilot
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center p-7 sm:p-9">
                  <div className="flex items-center gap-3 text-xs text-faint">
                    <Badge tone="brand">Featured</Badge>
                    {featured.category && <span>{featured.category.name}</span>}
                    <span>{formatDate(featured.publishedAt)}</span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-bold leading-snug text-foreground">
                    {featured.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {featured.excerpt}
                  </p>
                  <span className="mt-5 text-sm font-medium text-brand">Read article →</span>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Grid */}
          <div className="mt-10">
            {gridPosts.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {gridPosts.map((p, i) => (
                  <Reveal key={p.id} delay={i * 60}>
                    <BlogCard
                      post={{
                        id: p.id,
                        title: p.title,
                        slug: p.slug,
                        excerpt: p.excerpt,
                        coverImageUrl: p.coverImageUrl,
                        publishedAt: p.publishedAt,
                        category: p.category ? { name: p.category.name } : null,
                      }}
                    />
                  </Reveal>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No articles found"
                description={
                  q || category
                    ? "Try a different search or category."
                    : "Articles will appear here once they're published."
                }
              />
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {currentPage > 1 && (
                <Link
                  href={buildHref({ page: String(currentPage - 1) })}
                  className="rounded-lg border border-border px-3.5 py-2 text-sm text-muted hover:text-foreground"
                >
                  Previous
                </Link>
              )}
              <span className="px-3 text-sm text-faint">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages && (
                <Link
                  href={buildHref({ page: String(currentPage + 1) })}
                  className="rounded-lg border border-border px-3.5 py-2 text-sm text-muted hover:text-foreground"
                >
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
