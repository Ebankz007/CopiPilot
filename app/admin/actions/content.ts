"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { revalidatePublic } from "@/lib/revalidate";
import { getClientIp } from "@/lib/rate-limit";
import {
  homepageSectionSchema,
  navItemSchema,
  pageSchema,
  settingsSchema,
} from "@/lib/validators";
import type { ActionState } from "@/lib/form";

/* ------------------------------------------------------------------ pages */

export async function createPageAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const parsed = pageSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    content: formData.get("content") ?? "",
    metaTitle: formData.get("metaTitle") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { ok: false, error: "A page with that slug already exists." };
  }

  const page = await prisma.page.create({
    data: {
      ...parsed.data,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      publishedAt: parsed.data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "CREATE",
    entity: "Page",
    entityId: page.id,
    after: { slug: page.slug, title: page.title, status: page.status },
  });
  revalidatePublic(page.slug);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function updatePageAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing page id." };

  const parsed = pageSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    content: formData.get("content") ?? "",
    metaTitle: formData.get("metaTitle") ?? "",
    metaDescription: formData.get("metaDescription") ?? "",
    status: formData.get("status") ?? "DRAFT",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const before = await prisma.page.findUnique({ where: { id } });
  if (!before) return { ok: false, error: "Page not found." };

  const clash = await prisma.page.findUnique({ where: { slug: parsed.data.slug } });
  if (clash && clash.id !== id) {
    return { ok: false, error: "Another page already uses that slug." };
  }

  const page = await prisma.page.update({
    where: { id },
    data: {
      ...parsed.data,
      metaTitle: parsed.data.metaTitle || null,
      metaDescription: parsed.data.metaDescription || null,
      publishedAt:
        parsed.data.status === "PUBLISHED"
          ? (before.publishedAt ?? new Date())
          : null,
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Page",
    entityId: page.id,
    before: { slug: before.slug, title: before.title, status: before.status },
    after: { slug: page.slug, title: page.title, status: page.status },
  });
  revalidatePublic(page.slug);
  revalidatePublic(before.slug);
  revalidatePath("/admin/pages");
  redirect("/admin/pages");
}

export async function deletePageAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("content");
  const id = String(formData.get("id") ?? "");
  const page = await prisma.page.findUnique({ where: { id } });
  if (!page) return;

  await prisma.page.delete({ where: { id } });
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "Page",
    entityId: id,
    before: { slug: page.slug, title: page.title },
  });
  revalidatePublic(page.slug);
  revalidatePath("/admin/pages");
}

/* -------------------------------------------------------------- homepage */

export async function updateHomepageSectionAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const id = String(formData.get("id") ?? "");
  const key = String(formData.get("key") ?? "");

  const parsed = homepageSectionSchema.safeParse({
    key,
    eyebrow: formData.get("eyebrow") ?? "",
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    order: formData.get("order") ?? 0,
    isEnabled: formData.get("isEnabled") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let content: unknown = undefined;
  const rawContent = formData.get("content");
  if (typeof rawContent === "string" && rawContent.trim()) {
    try {
      content = JSON.parse(rawContent);
    } catch {
      return { ok: false, error: "Content must be valid JSON." };
    }
  }

  const before = await prisma.homepageSection.findUnique({ where: { id } });
  if (!before) return { ok: false, error: "Section not found." };

  await prisma.homepageSection.update({
    where: { id },
    data: {
      eyebrow: parsed.data.eyebrow || null,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle || null,
      order: parsed.data.order,
      isEnabled: parsed.data.isEnabled,
      ...(content !== undefined ? { content: content as object } : {}),
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "HomepageSection",
    entityId: id,
    before: { key: before.key, title: before.title },
    after: { key: parsed.data.key, title: parsed.data.title },
  });
  revalidatePublic();
  revalidatePath("/admin/homepage");
  return { ok: true, message: "Section saved." };
}

/* ------------------------------------------------------------ navigation */

export async function createNavAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const parsed = navItemSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    location: formData.get("location") ?? "HEADER",
    order: formData.get("order") ?? 0,
    isEnabled: formData.get("isEnabled") === "on",
    isExternal: formData.get("isExternal") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const item = await prisma.navigationItem.create({ data: parsed.data });
  await recordAudit({
    adminId: admin.id,
    action: "CREATE",
    entity: "NavigationItem",
    entityId: item.id,
    after: { label: item.label, url: item.url },
  });
  revalidatePublic();
  revalidatePath("/admin/navigation");
  return { ok: true, message: "Navigation item added." };
}

export async function updateNavAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const id = String(formData.get("id") ?? "");
  const parsed = navItemSchema.safeParse({
    label: formData.get("label"),
    url: formData.get("url"),
    location: formData.get("location") ?? "HEADER",
    order: formData.get("order") ?? 0,
    isEnabled: formData.get("isEnabled") === "on",
    isExternal: formData.get("isExternal") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.navigationItem.update({ where: { id }, data: parsed.data });
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "NavigationItem",
    entityId: id,
    after: parsed.data,
  });
  revalidatePublic();
  revalidatePath("/admin/navigation");
  return { ok: true, message: "Navigation item saved." };
}

export async function deleteNavAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("content");
  const id = String(formData.get("id") ?? "");
  await prisma.navigationItem.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "NavigationItem",
    entityId: id,
  });
  revalidatePublic();
  revalidatePath("/admin/navigation");
}

/* -------------------------------------------------------------- settings */

export async function updateSettingsAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("settings");
  const parsed = settingsSchema.safeParse({
    siteName: formData.get("siteName"),
    tagline: formData.get("tagline") ?? "",
    logoUrl: formData.get("logoUrl") ?? "",
    faviconUrl: formData.get("faviconUrl") ?? "",
    contactEmail: formData.get("contactEmail") ?? "",
    contactPhone: formData.get("contactPhone") ?? "",
    whatsapp: formData.get("whatsapp") ?? "",
    telegram: formData.get("telegram") ?? "",
    footerText: formData.get("footerText") ?? "",
    copyright: formData.get("copyright") ?? "",
    defaultSeoTitle: formData.get("defaultSeoTitle") ?? "",
    defaultSeoDescription: formData.get("defaultSeoDescription") ?? "",
    gaId: formData.get("gaId") ?? "",
    riskNotice: formData.get("riskNotice") ?? "",
    primaryColor: formData.get("primaryColor") ?? "#3a8dff",
    socials: {
      x: formData.get("socials_x") ?? "",
      linkedin: formData.get("socials_linkedin") ?? "",
      youtube: formData.get("socials_youtube") ?? "",
      instagram: formData.get("socials_instagram") ?? "",
    },
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const entries = Object.entries(parsed.data);
  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as object },
      create: { key, value: value as object },
    });
  }

  const h = await headers();
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "SiteSetting",
    after: { keys: entries.map(([k]) => k) },
    ip: getClientIp(h),
  });
  revalidatePublic();
  revalidatePath("/admin/settings");
  return { ok: true, message: "Settings saved." };
}
