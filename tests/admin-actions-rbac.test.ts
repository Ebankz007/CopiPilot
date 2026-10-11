import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Regression guard: admin server actions must enforce the SAME permission
 * matrix as the admin pages. Before this was fixed, catalog/content/finance/
 * engagement actions only checked `getCurrentAdmin()` — so any authenticated
 * admin could invoke another module's action (e.g. a SUPPORT_ADMIN editing
 * testimonials, or a CONTENT_ADMIN approving deposits).
 */

const cookieStore = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    set: (name: string, value: string) => cookieStore.set(name, value),
    delete: (name: string) => cookieStore.delete(name),
  }),
  headers: async () => ({ get: () => null }),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const adminSession = vi.hoisted(() => ({ current: null as null | { role: string } }));

const prismaMock = vi.hoisted(() => ({
  adminSession: { findUnique: vi.fn() },
  auditLog: { create: vi.fn() },
  contactMessage: { update: vi.fn() },
  testimonial: { create: vi.fn(), update: vi.fn() },
  deposit: { findUnique: vi.fn(), update: vi.fn() },
  transaction: { updateMany: vi.fn() },
  notification: { create: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { updateMessageStatusAction, saveTestimonialAction } from "@/app/admin/actions/engagement";
import { updateDepositAction } from "@/app/admin/actions/finance";

const FUTURE = new Date(Date.now() + 1000 * 60 * 60);

function signInAs(role: string) {
  cookieStore.set("cp_admin", "admin-token");
  prismaMock.adminSession.findUnique.mockResolvedValue({
    expiresAt: FUTURE,
    admin: { id: "a1", role, isActive: true },
  });
}

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

describe("admin action RBAC", () => {
  it("redirects to login when there is no admin session", async () => {
    prismaMock.adminSession.findUnique.mockResolvedValue(null);
    await expect(
      updateMessageStatusAction(form({ id: "m1", status: "READ" })),
    ).rejects.toThrow("REDIRECT:/admin/login");
  });

  it("allows a SUPPORT_ADMIN to update a message (has `messages`)", async () => {
    signInAs("SUPPORT_ADMIN");
    prismaMock.contactMessage.update.mockResolvedValue({});
    await updateMessageStatusAction(form({ id: "m1", status: "READ" }));
    expect(prismaMock.contactMessage.update).toHaveBeenCalledOnce();
  });

  it("denies a SUPPORT_ADMIN editing testimonials (lacks `content`)", async () => {
    signInAs("SUPPORT_ADMIN");
    await expect(
      saveTestimonialAction(
        undefined,
        form({ name: "Jane", quote: "Great platform, honestly." }),
      ),
    ).rejects.toThrow("REDIRECT:/admin?error=forbidden");
    expect(prismaMock.testimonial.create).not.toHaveBeenCalled();
  });

  it("allows a FINANCE_ADMIN to approve a deposit (has `deposits`)", async () => {
    signInAs("FINANCE_ADMIN");
    prismaMock.deposit.findUnique.mockResolvedValue({
      id: "d1",
      userId: "u1",
      amount: 500,
      status: "PENDING",
      adminNote: null,
    });
    prismaMock.deposit.update.mockResolvedValue({});
    prismaMock.transaction.updateMany.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    await updateDepositAction(form({ id: "d1", status: "APPROVED" }));

    expect(prismaMock.deposit.update).toHaveBeenCalledOnce();
    expect(prismaMock.deposit.update.mock.calls[0][0].data.status).toBe("APPROVED");
  });

  it("denies a CONTENT_ADMIN approving a deposit (lacks `deposits`)", async () => {
    signInAs("CONTENT_ADMIN");
    await expect(
      updateDepositAction(form({ id: "d1", status: "APPROVED" })),
    ).rejects.toThrow("REDIRECT:/admin?error=forbidden");
    expect(prismaMock.deposit.update).not.toHaveBeenCalled();
  });
});
