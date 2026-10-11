import { describe, it, expect, vi, beforeEach } from "vitest";

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

const prismaMock = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), create: vi.fn() },
  userSession: { create: vi.fn(), deleteMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

const passwordMock = vi.hoisted(() => ({
  hashPassword: vi.fn(async (p: string) => `hashed:${p}`),
  verifyPassword: vi.fn(async (p: string, h: string) => h === `hashed:${p}`),
}));
vi.mock("@/lib/password", () => passwordMock);

process.env.AUTH_SECRET = "test-secret-key-for-unit-tests-only";

import { POST as register } from "@/app/api/auth/register/route";
import { POST as login } from "@/app/api/auth/login/route";

function req(path: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

beforeEach(() => {
  cookieStore.clear();
  vi.clearAllMocks();
});

describe("POST /api/auth/register", () => {
  it("creates a user and starts a session", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({
      id: "u1",
      email: "jane@example.com",
      role: "CLIENT",
    });
    prismaMock.userSession.create.mockResolvedValue({});

    const res = await register(
      req(
        "/api/auth/register",
        { fullName: "Jane Doe", email: "jane@example.com", password: "abcd1234" },
        { "x-forwarded-for": "11.0.0.1" },
      ),
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(prismaMock.user.create).toHaveBeenCalledOnce();
    expect(cookieStore.has("cp_user")).toBe(true);
  });

  it("rejects a duplicate email with 409", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: "u1" });
    const res = await register(
      req(
        "/api/auth/register",
        { fullName: "Jane Doe", email: "jane@example.com", password: "abcd1234" },
        { "x-forwarded-for": "11.0.0.2" },
      ),
    );
    expect(res.status).toBe(409);
    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("rejects invalid input with 400", async () => {
    const res = await register(
      req(
        "/api/auth/register",
        { fullName: "J", email: "bad", password: "x" },
        { "x-forwarded-for": "11.0.0.3" },
      ),
    );
    expect(res.status).toBe(400);
  });

  it("rejects a cross-origin request with 403", async () => {
    const res = await register(
      req(
        "/api/auth/register",
        { fullName: "Jane Doe", email: "jane@example.com", password: "abcd1234" },
        { origin: "https://evil.com", "x-forwarded-for": "11.0.0.4" },
      ),
    );
    expect(res.status).toBe(403);
  });
});

describe("POST /api/auth/login", () => {
  const activeUser = {
    id: "u1",
    email: "jane@example.com",
    role: "CLIENT",
    status: "ACTIVE",
    passwordHash: "hashed:abcd1234",
  };

  it("logs in with correct credentials", async () => {
    prismaMock.user.findUnique.mockResolvedValue(activeUser);
    prismaMock.userSession.create.mockResolvedValue({});
    const res = await login(
      req(
        "/api/auth/login",
        { email: "jane@example.com", password: "abcd1234" },
        { "x-forwarded-for": "12.0.0.1" },
      ),
    );
    expect(res.status).toBe(200);
    expect(cookieStore.has("cp_user")).toBe(true);
  });

  it("rejects a wrong password with 401", async () => {
    prismaMock.user.findUnique.mockResolvedValue(activeUser);
    const res = await login(
      req(
        "/api/auth/login",
        { email: "jane@example.com", password: "wrong" },
        { "x-forwarded-for": "12.0.0.2" },
      ),
    );
    expect(res.status).toBe(401);
  });

  it("rejects an unknown email with 401", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    const res = await login(
      req(
        "/api/auth/login",
        { email: "nobody@example.com", password: "abcd1234" },
        { "x-forwarded-for": "12.0.0.3" },
      ),
    );
    expect(res.status).toBe(401);
  });

  it("rejects a suspended account with 403", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ ...activeUser, status: "SUSPENDED" });
    const res = await login(
      req(
        "/api/auth/login",
        { email: "jane@example.com", password: "abcd1234" },
        { "x-forwarded-for": "12.0.0.4" },
      ),
    );
    expect(res.status).toBe(403);
  });
});
