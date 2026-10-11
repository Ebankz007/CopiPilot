import { describe, it, expect, vi, beforeEach } from "vitest";

process.env.AUTH_SECRET = "test-secret-key-for-unit-tests-only";

const cookieStore = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT:${url}`);
  },
}));

const prismaMock = vi.hoisted(() => ({
  userSession: {
    findUnique: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  adminSession: {
    findUnique: vi.fn(),
    create: vi.fn(),
    deleteMany: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  getCurrentUser,
  requireUser,
  createUserSession,
  destroyUserSession,
  getCurrentAdmin,
  requireAdmin,
  USER_COOKIE,
  ADMIN_COOKIE,
} from "@/lib/auth";

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

describe("getCurrentUser", () => {
  it("returns null when there is no cookie", async () => {
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null for an unknown session token", async () => {
    cookieStore.set(USER_COOKIE, "deadbeef");
    prismaMock.userSession.findUnique.mockResolvedValue(null);
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns the user for a valid, unexpired session", async () => {
    cookieStore.set(USER_COOKIE, "raw-token");
    prismaMock.userSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "user_1", status: "ACTIVE" },
    });
    const user = await getCurrentUser();
    expect(user?.id).toBe("user_1");
  });

  it("returns null when the session has expired", async () => {
    cookieStore.set(USER_COOKIE, "raw-token");
    prismaMock.userSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 60_000),
      user: { id: "user_1", status: "ACTIVE" },
    });
    expect(await getCurrentUser()).toBeNull();
  });

  it("returns null when the user is not ACTIVE", async () => {
    cookieStore.set(USER_COOKIE, "raw-token");
    prismaMock.userSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "user_2", status: "SUSPENDED" },
    });
    expect(await getCurrentUser()).toBeNull();
  });
});

describe("createUserSession", () => {
  it("persists a session row and sets an opaque cookie", async () => {
    prismaMock.userSession.create.mockResolvedValue({});
    await createUserSession({ id: "user_9", email: "x@y.com", role: "CLIENT" });

    expect(prismaMock.userSession.create).toHaveBeenCalledOnce();
    expect(cookieStore.has(USER_COOKIE)).toBe(true);
    expect(cookieStore.get(USER_COOKIE)).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe("destroyUserSession", () => {
  it("clears the session row and the cookie", async () => {
    cookieStore.set(USER_COOKIE, "raw-token");
    prismaMock.userSession.deleteMany.mockResolvedValue({ count: 1 });
    await destroyUserSession();
    expect(prismaMock.userSession.deleteMany).toHaveBeenCalledOnce();
    expect(cookieStore.has(USER_COOKIE)).toBe(false);
  });
});

describe("requireUser", () => {
  it("redirects to /login when there is no session", async () => {
    await expect(requireUser()).rejects.toThrow("REDIRECT:/login");
  });

  it("returns the user when authenticated", async () => {
    cookieStore.set(USER_COOKIE, "raw-token");
    prismaMock.userSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: "user_4", status: "ACTIVE" },
    });
    const user = await requireUser();
    expect(user.id).toBe("user_4");
  });
});

describe("getCurrentAdmin", () => {
  it("returns null when there is no cookie", async () => {
    expect(await getCurrentAdmin()).toBeNull();
  });

  it("returns the admin for a valid, unexpired session", async () => {
    cookieStore.set(ADMIN_COOKIE, "raw-token");
    prismaMock.adminSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      admin: { id: "admin_1", isActive: true },
    });
    const admin = await getCurrentAdmin();
    expect(admin?.id).toBe("admin_1");
  });

  it("returns null when the session has expired", async () => {
    cookieStore.set(ADMIN_COOKIE, "raw-token");
    prismaMock.adminSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() - 60_000),
      admin: { id: "admin_1", isActive: true },
    });
    expect(await getCurrentAdmin()).toBeNull();
  });

  it("returns null when the admin is inactive", async () => {
    cookieStore.set(ADMIN_COOKIE, "raw-token");
    prismaMock.adminSession.findUnique.mockResolvedValue({
      expiresAt: new Date(Date.now() + 60_000),
      admin: { id: "admin_1", isActive: false },
    });
    expect(await getCurrentAdmin()).toBeNull();
  });
});

describe("requireAdmin", () => {
  it("redirects to /admin/login when there is no session", async () => {
    await expect(requireAdmin()).rejects.toThrow("REDIRECT:/admin/login");
  });
});
