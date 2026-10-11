import type { MetadataRoute } from "next";
import { getPublishedPages } from "@/lib/content";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3400";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/about",
    "/strategies",
    "/calculator",
    "/blog",
    "/faq",
    "/contact",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  let pages: MetadataRoute.Sitemap = [];
  try {
    const cmsPages = await getPublishedPages();
    pages = cmsPages.map((p) => ({
      url: `${baseUrl}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    }));
  } catch {
    pages = [];
  }

  return [...staticRoutes, ...pages];
}
