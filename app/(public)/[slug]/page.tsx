import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageBySlug, getPublishedPages } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { PageHeader } from "@/components/site/page-header";

export const revalidate = 300;

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return { title: "Not found" };
  return {
    title: page.metaTitle ?? page.title,
    description: page.metaDescription ?? undefined,
  };
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  const html = renderMarkdown(page.content);

  return (
    <>
      <PageHeader eyebrow="Information" title={page.title} />
      <section className="py-14 sm:py-16">
        <article
          className="prose-cp mx-auto max-w-3xl px-4 sm:px-6 lg:px-8"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </section>
    </>
  );
}
