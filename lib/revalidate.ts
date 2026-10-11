import { revalidatePath } from "next/cache";

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/strategies",
  "/calculator",
  "/faq",
  "/blog",
  "/contact",
];

/**
 * Bust the static cache for public pages after a CMS mutation so published
 * changes appear immediately (ISR fallback still applies).
 */
export function revalidatePublic(slug?: string | null) {
  for (const path of PUBLIC_PATHS) revalidatePath(path);
  if (slug) revalidatePath(`/${slug}`);
  revalidatePath("/sitemap.xml");
}

export function revalidateBlog(slug?: string | null) {
  revalidatePath("/blog");
  if (slug) revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}
