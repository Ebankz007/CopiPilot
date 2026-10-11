import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink } from "@/components/ui/button";
import { BlogCard, type BlogCardData } from "@/components/site/blog-card";

export function BlogSection({
  eyebrow,
  title,
  subtitle,
  posts,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  posts: BlogCardData[];
}) {
  if (posts.length === 0) return null;

  return (
    <section id="blog" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 70}>
              <BlogCard post={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-12 text-center">
            <ButtonLink href="/blog" variant="secondary" size="lg">
              Read the blog
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
