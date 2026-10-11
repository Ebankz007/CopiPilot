import { prisma } from "./prisma";

export async function getNavigation(location: "HEADER" | "FOOTER") {
  return prisma.navigationItem.findMany({
    where: { location, isEnabled: true },
    orderBy: { order: "asc" },
  });
}

export async function getHomepageSections() {
  return prisma.homepageSection.findMany({
    where: { isEnabled: true },
    orderBy: { order: "asc" },
  });
}

export async function getHomepageSection(key: string) {
  return prisma.homepageSection.findUnique({ where: { key } });
}

export async function getStats() {
  return prisma.stat.findMany({
    where: { isEnabled: true },
    orderBy: { order: "asc" },
  });
}

export async function getTestimonials() {
  return prisma.testimonial.findMany({
    where: { isEnabled: true },
    orderBy: { order: "asc" },
  });
}

export async function getFaqs(category?: string) {
  return prisma.faq.findMany({
    where: { isEnabled: true, ...(category ? { category } : {}) },
    orderBy: { order: "asc" },
  });
}

/* -------------------------------------------------------------- strategies */

export async function getStrategies(includeComingSoon = true) {
  return prisma.strategy.findMany({
    where: includeComingSoon ? { status: { not: "INACTIVE" } } : { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
  });
}

export async function getActiveStrategies() {
  return prisma.strategy.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
  });
}

export async function getStrategyBySlug(slug: string) {
  return prisma.strategy.findUnique({ where: { slug } });
}

/* -------------------------------------------------------------------- blog */

export async function getPublishedPosts(options?: {
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
  take?: number;
  skip?: number;
}) {
  const { categorySlug, tagSlug, query, take, skip } = options ?? {};
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
    include: { category: true, tags: { include: { tag: true } } },
    take,
    skip,
  });
}

export async function countPublishedPosts(options?: {
  categorySlug?: string;
  tagSlug?: string;
  query?: string;
}) {
  const { categorySlug, tagSlug, query } = options ?? {};
  return prisma.blogPost.count({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {}),
      ...(tagSlug ? { tags: { some: { tag: { slug: tagSlug } } } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { excerpt: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
  });
}

export async function getFeaturedPost() {
  return prisma.blogPost.findFirst({
    where: { status: "PUBLISHED", isFeatured: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    include: { category: true },
  });
}

export async function getPostBySlug(slug: string) {
  return prisma.blogPost.findFirst({
    where: { slug, status: "PUBLISHED", publishedAt: { lte: new Date() } },
    include: { category: true, tags: { include: { tag: true } } },
  });
}

export async function getRelatedPosts(postId: string, categoryId?: string | null, take = 3) {
  return prisma.blogPost.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      id: { not: postId },
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { publishedAt: "desc" },
    take,
    include: { category: true },
  });
}

export async function getBlogCategories() {
  return prisma.blogCategory.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}

/* ------------------------------------------------------------------- pages */

export async function getPageBySlug(slug: string) {
  return prisma.page.findFirst({ where: { slug, status: "PUBLISHED" } });
}

export async function getPublishedPages() {
  return prisma.page.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { updatedAt: "desc" },
  });
}
