import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/site/blog-card";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found" };
  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt,
    openGraph: {
      title: post.seoTitle ?? post.title,
      description: post.seoDescription ?? post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.id, post.categoryId, 3);
  const html = renderMarkdown(post.content);

  return (
    <article className="pb-20">
      <header className="relative overflow-hidden border-b border-border pt-32 pb-12 sm:pt-40 sm:pb-14">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.14),transparent_65%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-faint">
            {post.category && <Badge tone="gold">{post.category.name}</Badge>}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {formatDate(post.publishedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {post.authorName}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{post.excerpt}</p>
        </div>
      </header>

      {post.coverImageUrl && (
        <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImageUrl}
            alt=""
            className="aspect-[16/9] w-full rounded-2xl border border-border object-cover"
          />
        </div>
      )}

      <div className="mx-auto mt-10 max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="prose-cp" dangerouslySetInnerHTML={{ __html: html }} />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2 border-t border-border pt-6">
            {post.tags.map(({ tag }) => (
              <Badge key={tag.id} tone="neutral">
                #{tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-gold/20 bg-gold/[0.06] p-6">
          <p className="text-xs leading-relaxed text-muted">
            <span className="font-semibold text-gold">Risk notice: </span>
            Capital is at risk. The value of investments can go down as well as up, and
            you may get back less than you invest. Nothing in this article is financial
            advice.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-xl font-bold text-foreground">Keep reading</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogCard
                key={p.id}
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
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
