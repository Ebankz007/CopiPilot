import Link from "next/link";
import { CalendarDays, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export type BlogCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | string | null;
  category?: { name: string } | null;
};

export function BlogCard({ post }: { post: BlogCardData }) {
  return (
    <article className="card card-hover group flex h-full flex-col overflow-hidden">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[16/9] overflow-hidden bg-elevated"
      >
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(ellipse_at_center,rgba(58,141,255,0.18),transparent_70%)]">
            <span className="font-display text-2xl font-bold text-brand/40">CopiPilot</span>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-xs text-faint">
          {post.category && <Badge tone="brand">{post.category.name}</Badge>}
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(post.publishedAt)}
          </span>
        </div>

        <h3 className="mt-3 font-display text-base font-semibold leading-snug text-foreground">
          <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-brand">
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">
          {post.excerpt}
        </p>

        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-bright"
        >
          Read more
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
