"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { adminLoginSchema } from "@/lib/validators";
import {
  createAdminSession,
  destroyAdminSession,
  getCurrentAdmin,
} from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import type { ActionState } from "@/lib/form";

export async function adminLoginAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const h = await headers();
  const ip = getClientIp(h);

  const limit = rateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Too many attempts. Try again in ${limit.retryAfter}s.` };
  }

  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;
  const admin = await prisma.admin.findUnique({ where: { email } });

  if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
    return { ok: false, error: "Invalid email or password." };
  }
  if (!admin.isActive) {
    return { ok: false, error: "This account is disabled." };
  }

  await createAdminSession(admin.id, {
    ip,
    userAgent: h.get("user-agent"),
  });
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });
  await recordAudit({
    adminId: admin.id,
    action: "LOGIN",
    entity: "Admin",
    entityId: admin.id,
    ip,
  });

  const next = String(formData.get("next") ?? "/admin");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function adminLogoutAction(): Promise<void> {
  const admin = await getCurrentAdmin();
  if (admin) {
    await recordAudit({
      adminId: admin.id,
      action: "LOGOUT",
      entity: "Admin",
      entityId: admin.id,
    });
  }
  await destroyAdminSession();
  redirect("/admin/login");
}
