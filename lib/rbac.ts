/**
 * Role-based access control.
 *
 * Permissions are derived from the admin's role via a single, auditable matrix
 * rather than free-form per-user grants. This keeps the security model legible:
 * to change what a role can do, you change one row here — not scattered checks.
 */

export type AdminRole =
  | "SUPER_ADMIN"
  | "CONTENT_ADMIN"
  | "SUPPORT_ADMIN"
  | "FINANCE_ADMIN";

export type AdminPermission =
  | "dashboard"
  | "content" // homepage, pages, navigation, stats, testimonials
  | "strategies"
  | "calculator"
  | "blog"
  | "faq"
  | "media"
  | "users"
  | "messages"
  | "investments"
  | "deposits"
  | "withdrawals"
  | "settings"
  | "audit"
  | "team";

const ALL_PERMISSIONS: AdminPermission[] = [
  "dashboard",
  "content",
  "strategies",
  "calculator",
  "blog",
  "faq",
  "media",
  "users",
  "messages",
  "investments",
  "deposits",
  "withdrawals",
  "settings",
  "audit",
  "team",
];

const MATRIX: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: ALL_PERMISSIONS,
  CONTENT_ADMIN: [
    "dashboard",
    "content",
    "strategies",
    "blog",
    "faq",
    "media",
  ],
  SUPPORT_ADMIN: ["dashboard", "users", "messages", "media", "faq"],
  FINANCE_ADMIN: [
    "dashboard",
    "investments",
    "deposits",
    "withdrawals",
    "strategies",
    "calculator",
    "users",
  ],
};

export function hasPermission(
  role: AdminRole,
  permission: AdminPermission,
): boolean {
  return MATRIX[role]?.includes(permission) ?? false;
}

export function permissionsFor(role: AdminRole): AdminPermission[] {
  return MATRIX[role] ?? [];
}

export const ADMIN_ROLES: AdminRole[] = [
  "SUPER_ADMIN",
  "CONTENT_ADMIN",
  "SUPPORT_ADMIN",
  "FINANCE_ADMIN",
];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Super Admin",
  CONTENT_ADMIN: "Content Admin",
  SUPPORT_ADMIN: "Support Admin",
  FINANCE_ADMIN: "Finance Admin",
};

export const ADMIN_ROLE_DESCRIPTIONS: Record<AdminRole, string> = {
  SUPER_ADMIN: "Full access to every module, including team and settings.",
  CONTENT_ADMIN: "Manages pages, blog, FAQ, media, and strategies.",
  SUPPORT_ADMIN: "Manages users, contact messages, and support requests.",
  FINANCE_ADMIN: "Manages investments, deposits, withdrawals, and calculator.",
};
