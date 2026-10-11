"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { revalidatePublic, revalidateBlog } from "@/lib/revalidate";
import {
  blogCategorySchema,
  blogPostSchema,
  calculatorSettingsSchema,
  statSchema,
  strategySchema,
} from "@/lib/validators";
import { csv, str, type ActionState } from "@/lib/form";
import { slugify } from "@/lib/utils";

async function guard() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

function num(value: FormDataEntryValue | null): number | undefined {
  const v = str(value);
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function bool(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true";
}

/* ------------------------------------------------------------------ stats */

export async function saveStatAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const parsed = statSchema.safeParse({
    label: formData.get("label"),
    value: formData.get("value"),
    suffix: formData.get("suffix") ?? "",
    note: formData.get("note") ?? "",
    order: formData.get("order") ?? 0,
    isEnabled: bool(formData.get("isEnabled")),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = {
    ...parsed.data,
    suffix: parsed.data.suffix || null,
    note: parsed.data.note || null,
  };

  if (id) {
    await prisma.stat.update({ where: { id }, data });
  } else {
    await prisma.stat.create({ data });
  }

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Stat",
    entityId: id || null,
    after: data,
  });
  revalidatePublic();
  revalidatePath("/admin/stats");
  return { ok: true, message: "Stat saved." };
}

export async function deleteStatAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  await prisma.stat.delete({ where: { id } }).catch(() => {});
  await recordAudit({ adminId: admin.id, action: "DELETE", entity: "Stat", entityId: id });
  revalidatePublic();
  revalidatePath("/admin/stats");
}

/* -------------------------------------------------------------- strategies */

export async function saveStrategyAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await guard();
  const id = str(formData.get("id"));

  const parsed = strategySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    minInvestment: formData.get("minInvestment") ?? 0,
    maxInvestment: num(formData.get("maxInvestment")),
    targetReturn: num(formData.get("targetReturn")),
    returnPeriod: formData.get("returnPeriod") ?? "",
    durationMonths: num(formData.get("durationMonths")),
    riskLevel: formData.get("riskLevel") ?? "MEDIUM",
    strategyType: formData.get("strategyType") ?? "Automated",
    profitFactor: num(formData.get("profitFactor")),
    maxDrawdown: num(formData.get("maxDrawdown")),
    status: formData.get("status") ?? "ACTIVE",
    isFeatured: bool(formData.get("isFeatured")),
    icon: formData.get("icon") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
    ctaLabel: formData.get("ctaLabel") ?? "Get started",
    ctaUrl: formData.get("ctaUrl") ?? "",
    terms: formData.get("terms") ?? "",
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const data = {
    name: d.name,
    slug: d.slug,
    shortDescription: d.shortDescription,
    description: d.description,
    minInvestment: d.minInvestment,
    maxInvestment: d.maxInvestment ?? null,
    targetReturn: d.targetReturn ?? null,
    returnPeriod: d.returnPeriod || null,
    durationMonths: d.durationMonths ?? null,
    riskLevel: d.riskLevel,
    strategyType: d.strategyType,
    profitFactor: d.profitFactor ?? null,
    maxDrawdown: d.maxDrawdown ?? null,
    status: d.status,
    isFeatured: d.isFeatured,
    icon: d.icon || null,
    imageUrl: d.imageUrl || null,
    ctaLabel: d.ctaLabel,
    ctaUrl: d.ctaUrl || null,
    terms: d.terms || null,
    order: d.order,
  };

  const clash = await prisma.strategy.findUnique({ where: { slug: data.slug } });
  if (clash && clash.id !== id) {
    return { ok: false, error: "Another strategy already uses that slug." };
  }

  if (id) {
    await prisma.strategy.update({ where: { id }, data });
  } else {
    await prisma.strategy.create({ data });
  }

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Strategy",
    entityId: id || null,
    after: { slug: data.slug, name: data.name },
  });
  revalidatePublic();
  revalidatePath("/admin/strategies");
  return { ok: true, message: "Strategy saved." };
}

export async function deleteStrategyAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  await prisma.strategy.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "Strategy",
    entityId: id,
  });
  revalidatePublic();
  revalidatePath("/admin/strategies");
}

/* -------------------------------------------------------------- calculator */

export async function saveCalculatorSettingsAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await guard();

  const parsed = calculatorSettingsSchema.safeParse({
    defaultAmount: formData.get("defaultAmount") ?? 0,
    minAmount: formData.get("minAmount") ?? 0,
    maxAmount: formData.get("maxAmount") ?? 0,
    defaultMonths: formData.get("defaultMonths") ?? 12,
    availableMonths: csv(formData.get("availableMonths")),
    defaultRate: formData.get("defaultRate") ?? 0,
    minRate: formData.get("minRate") ?? 0,
    maxRate: formData.get("maxRate") ?? 0,
    allowCompound: bool(formData.get("allowCompound")),
    allowSimple: bool(formData.get("allowSimple")),
    disclaimer: formData.get("disclaimer") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.siteSetting.upsert({
    where: { key: "calculator" },
    update: { value: parsed.data },
    create: { key: "calculator", value: parsed.data },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "SiteSetting",
    entityId: "calculator",
    after: parsed.data,
  });
  revalidatePublic();
  revalidatePath("/admin/calculator");
  return { ok: true, message: "Calculator settings saved." };
}

/* -------------------------------------------------------------------- blog */

async function syncTags(postId: string, tagNames: string[]): Promise<void> {
  await prisma.blogPostTag.deleteMany({ where: { postId } });
  for (const name of tagNames) {
    const slug = slugify(name);
    if (!slug) continue;
    const tag = await prisma.blogTag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    await prisma.blogPostTag.create({ data: { postId, tagId: tag.id } });
  }
}

export async function saveBlogPostAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await guard();
  const id = str(formData.get("id"));

  const parsed = blogPostSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categoryId: formData.get("categoryId") ?? "",
    authorName: formData.get("authorName") ?? "CopiPilot Desk",
    status: formData.get("status") ?? "DRAFT",
    isFeatured: bool(formData.get("isFeatured")),
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
    publishedAt: formData.get("publishedAt") ?? "",
    tags: csv(formData.get("tags")),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const d = parsed.data;
  const clash = await prisma.blogPost.findUnique({ where: { slug: d.slug } });
  if (clash && clash.id !== id) {
    return { ok: false, error: "Another post already uses that slug." };
  }

  const publishedAt =
    d.publishedAt && !Number.isNaN(Date.parse(d.publishedAt))
      ? new Date(d.publishedAt)
      : d.status === "PUBLISHED"
        ? new Date()
        : null;

  const data = {
    title: d.title,
    slug: d.slug,
    excerpt: d.excerpt,
    content: d.content,
    categoryId: d.categoryId || null,
    authorName: d.authorName,
    status: d.status,
    isFeatured: d.isFeatured,
    coverImageUrl: d.coverImageUrl || null,
    seoTitle: d.seoTitle || null,
    seoDescription: d.seoDescription || null,
    publishedAt,
  };

  let postId = id;
  if (id) {
    await prisma.blogPost.update({ where: { id }, data });
  } else {
    const created = await prisma.blogPost.create({ data });
    postId = created.id;
  }

  await syncTags(postId, d.tags);

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "BlogPost",
    entityId: postId,
    after: { slug: data.slug, title: data.title, status: data.status },
  });
  revalidateBlog(data.slug);
  revalidatePath("/admin/blog");
  return { ok: true, message: "Post saved." };
}

export async function deleteBlogPostAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) return;
  await prisma.blogPost.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "BlogPost",
    entityId: id,
    before: { slug: post.slug, title: post.title },
  });
  revalidateBlog(post.slug);
  revalidatePath("/admin/blog");
}

export async function saveBlogCategoryAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const parsed = blogCategorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    order: formData.get("order") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description || null,
    order: parsed.data.order,
  };

  const clash = await prisma.blogCategory.findUnique({ where: { slug: data.slug } });
  if (clash && clash.id !== id) {
    return { ok: false, error: "Another category already uses that slug." };
  }

  if (id) {
    await prisma.blogCategory.update({ where: { id }, data });
  } else {
    await prisma.blogCategory.create({ data });
  }

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "BlogCategory",
    entityId: id || null,
    after: { slug: data.slug, name: data.name },
  });
  revalidateBlog();
  revalidatePath("/admin/blog");
  return { ok: true, message: "Category saved." };
}

export async function deleteBlogCategoryAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  await prisma.blogCategory.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "BlogCategory",
    entityId: id,
  });
  revalidateBlog();
  revalidatePath("/admin/blog");
}
