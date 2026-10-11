"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { passwordField } from "@/lib/validators";
import { recordAudit } from "@/lib/audit";
import { adminUserSchema } from "@/lib/validators";
import { str, type ActionState } from "@/lib/form";

/* ------------------------------------------------------------------- team */

export async function createAdminAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requirePermission("team");

  const parsed = adminUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") ?? "CONTENT_ADMIN",
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const password = passwordField.safeParse(formData.get("password"));
  if (!password.success) {
    return { ok: false, error: password.error.issues[0]?.message ?? "Invalid password" };
  }

  const existing = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { ok: false, error: "An admin with that email already exists." };
  }

  const created = await prisma.admin.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
      passwordHash: await hashPassword(password.data),
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "CREATE",
    entity: "Admin",
    entityId: created.id,
    after: { email: created.email, role: created.role },
  });
  revalidatePath("/admin/team");
  return { ok: true, message: "Team member added." };
}

export async function updateAdminAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("team");
  const id = str(formData.get("id"));
  const role = str(formData.get("role"));
  const isActive = formData.get("isActive") === "on";
  if (!["SUPER_ADMIN", "CONTENT_ADMIN", "SUPPORT_ADMIN", "FINANCE_ADMIN"].includes(role)) {
    return;
  }
  if (id === admin.id && (!isActive || role !== "SUPER_ADMIN")) {
    // Never let an admin lock themselves out.
    return;
  }

  const before = await prisma.admin.findUnique({ where: { id } });
  if (!before) return;

  await prisma.admin.update({
    where: { id },
    data: { role: role as typeof before.role, isActive },
  });
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Admin",
    entityId: id,
    before: { role: before.role, isActive: before.isActive },
    after: { role, isActive },
  });
  revalidatePath("/admin/team");
}

export async function deleteAdminAction(formData: FormData): Promise<void> {
  const admin = await requirePermission("team");
  const id = str(formData.get("id"));
  if (id === admin.id) return; // cannot delete yourself

  const before = await prisma.admin.findUnique({ where: { id } });
  if (!before) return;

  await prisma.admin.delete({ where: { id } }).catch(() => {});
  await recordAudit({
    adminId: admin.id,
    action: "DELETE",
    entity: "Admin",
    entityId: id,
    before: { email: before.email, role: before.role },
  });
  revalidatePath("/admin/team");
}
