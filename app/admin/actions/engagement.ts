"use server";

import { revalidatePath } from "next/cache";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { revalidatePublic } from "@/lib/revalidate";
import { faqSchema, testimonialSchema } from "@/lib/validators";
import { str, type ActionState } from "@/lib/form";
import { getUploadDir, getUploadPath, getMaxUploadBytes } from "@/lib/uploads";

/* ----------------------------------------------------------- testimonials */

export async function saveTestimonialAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("content");
  const id = str(formData.get("id"));
  const parsed = testimonialSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role") ?? "",
    company: formData.get("company") ?? "",
    quote: formData.get("quote"),
    order: formData.get("order") ?? 0,
    isEnabled: formData.get("isEnabled") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = {
    name: parsed.data.name,
    role: parsed.data.role || null,
    company: parsed.data.company || null,
    quote: parsed.data.quote,
    order: parsed.data.order,
    isEnabled: parsed.data.isEnabled,
  };

  if (id) {
    await prisma.testimonial.update({ where: { id }, data });
  } else {
    await prisma.testimonial.create({ data });
  }

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Testimonial",
    entityId: id || null,
    after: { name: data.name },
  });
  revalidatePublic();
  revalidatePath("/admin/testimonials");
  return { ok: true, message: "Testimonial saved." };
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("content");
  const id = str(formData.get("id"));
  await prisma.testimonial.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "Testimonial",
    entityId: id,
  });
  revalidatePublic();
  revalidatePath("/admin/testimonials");
}

/* -------------------------------------------------------------------- faqs */

export async function saveFaqAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("faq");
  const id = str(formData.get("id"));
  const parsed = faqSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    order: formData.get("order") ?? 0,
    isEnabled: formData.get("isEnabled") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  if (id) {
    await prisma.faq.update({ where: { id }, data: parsed.data });
  } else {
    await prisma.faq.create({ data: parsed.data });
  }

  await recordAudit({
    adminId: admin.id,
    action: id ? "UPDATE" : "CREATE",
    entity: "Faq",
    entityId: id || null,
    after: { question: parsed.data.question },
  });
  revalidatePublic();
  revalidatePath("/admin/faqs");
  return { ok: true, message: "FAQ saved." };
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("faq");
  const id = str(formData.get("id"));
  await prisma.faq.delete({ where: { id } }).catch(() => {});
  await recordAudit({ adminId: admin.id, action: "DELETE", entity: "Faq", entityId: id });
  revalidatePublic();
  revalidatePath("/admin/faqs");
}

/* ---------------------------------------------------------------- messages */

export async function updateMessageStatusAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("messages");
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!["NEW", "READ", "ARCHIVED"].includes(status)) return;

  await prisma.contactMessage.update({
    where: { id },
    data: { status: status as "NEW" | "READ" | "ARCHIVED" },
  });
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "ContactMessage",
    entityId: id,
    after: { status },
  });
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("messages");
  const id = str(formData.get("id"));
  await prisma.contactMessage.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "ContactMessage",
    entityId: id,
  });
  revalidatePath("/admin/messages");
}

/* ------------------------------------------------------------------- users */

export async function updateUserStatusAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("users");
  const id = str(formData.get("id"));
  const status = str(formData.get("status"));
  if (!["ACTIVE", "SUSPENDED"].includes(status)) return;

  await prisma.user.update({
    where: { id },
    data: { status: status as "ACTIVE" | "SUSPENDED" },
  });
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "User",
    entityId: id,
    after: { status },
  });
  revalidatePath("/admin/users");
}

/* ------------------------------------------------------------------- media */

const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function uploadMediaAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("media");
  const file = formData.get("file");
  const alt = str(formData.get("alt"));

  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, error: "Only PNG, JPEG, WEBP, GIF, or SVG are allowed." };
  }
  const maxBytes = getMaxUploadBytes();
  if (file.size > maxBytes) {
    return { ok: false, error: `File exceeds the ${Math.round(maxBytes / (1024 * 1024))}MB limit.` };
  }

  const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = getUploadDir();

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(getUploadPath(filename), buffer);
  } catch (error) {
    console.error("[media] write failed", error);
    return { ok: false, error: "Could not save the file." };
  }

  const media = await prisma.media.create({
    data: {
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url: `/uploads/${filename}`,
      alt: alt || null,
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "CREATE",
    entity: "Media",
    entityId: media.id,
    after: { filename, originalName: file.name },
  });
  revalidatePath("/admin/media");
  return { ok: true, message: "File uploaded." };
}

export async function deleteMediaAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("media");
  const id = str(formData.get("id"));
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) return;

  await prisma.media.delete({ where: { id } }).catch(() => {});
  // Best-effort disk cleanup; a missing file must not block the DB delete.
  await unlink(getUploadPath(media.filename)).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "Media",
    entityId: id,
    before: { filename: media.filename },
  });
  revalidatePath("/admin/media");
}
