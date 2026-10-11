import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Admin, User } from "@/lib/generated/prisma/client";
import { prisma } from "./prisma";
import { generateToken, hashToken } from "./tokens";
import { hasPermission, type AdminPermission } from "./rbac";

export const ADMIN_COOKIE = "cp_admin";
export const USER_COOKIE = "cp_user";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const isProd = process.env.NODE_ENV === "production";

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProd,
  path: "/",
};

/* --------------------------------------------------------------- admin --- */

export async function createAdminSession(
  adminId: string,
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash: hashToken(token),
      expiresAt,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, { ...cookieBase, expires: expiresAt });
  return token;
}

export async function getCurrentAdmin(): Promise<Admin | null> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });

  if (!session || session.expiresAt < new Date() || !session.admin.isActive) {
    return null;
  }
  return session.admin;
}

export async function requireAdmin(): Promise<Admin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Gate a page/action on a permission; non-authorised admins bounce to /admin. */
export async function requirePermission(
  permission: AdminPermission,
): Promise<Admin> {
  const admin = await requireAdmin();
  if (!hasPermission(admin.role, permission)) {
    redirect("/admin?error=forbidden");
  }
  return admin;
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (token) {
    await prisma.adminSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  jar.delete(ADMIN_COOKIE);
}

/* ---------------------------------------------------------------- users -- */

export async function createUserSession(
  user: { id: string; email?: string; role?: string },
  meta: { ip?: string | null; userAgent?: string | null } = {},
): Promise<string> {
  const token = generateToken(32);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt,
      ip: meta.ip ?? null,
      userAgent: meta.userAgent ?? null,
    },
  });

  const jar = await cookies();
  jar.set(USER_COOKIE, token, { ...cookieBase, expires: expiresAt });
  return token;
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.status !== "ACTIVE") {
    return null;
  }
  return session.user;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function destroyUserSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  if (token) {
    await prisma.userSession.deleteMany({
      where: { tokenHash: hashToken(token) },
    });
  }
  jar.delete(USER_COOKIE);
}

/** Revoke every session for a user (e.g. password change, "log out everywhere"). */
export async function destroyAllUserSessions(userId: string): Promise<void> {
  await prisma.userSession.deleteMany({ where: { userId } });
}
