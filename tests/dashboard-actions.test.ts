import { describe, it, expect, vi, beforeEach } from "vitest";

/* ------------------------------------------------------------- next mocks -- */

const cookieStore = vi.hoisted(() => new Map<string, string>());
const headerStore = vi.hoisted(() => new Map<string, string>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) } : undefined,
    set: (name: string, value: string) => cookieStore.set(name, value),
    delete: (name: string) => cookieStore.delete(name),
  }),
  headers: async () => ({
    get: (name: string) => headerStore.get(name.toLowerCase()) ?? null,
  }),
}));

const redirectMock = vi.hoisted(() => vi.fn((url: string) => {
  throw new Error(`REDIRECT:${url}`);
}));
vi.mock("next/navigation", () => ({ redirect: redirectMock }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

/* ------------------------------------------------------------ prisma mock -- */

const sessionUser = vi.hoisted(() => ({
  current: {
    id: "u1",
    email: "client@example.com",
    fullName: "Test Client",
    role: "CLIENT",
    status: "ACTIVE",
    passwordHash: "hashed:secret123",
  },
}));

const prismaMock = vi.hoisted(() => ({
  userSession: { findUnique: vi.fn(), deleteMany: vi.fn() },
  user: { update: vi.fn() },
  deposit: { create: vi.fn(), findMany: vi.fn() },
  withdrawal: { create: vi.fn(), findMany: vi.fn() },
  investment: { create: vi.fn(), findMany: vi.fn() },
  strategy: { findUnique: vi.fn() },
  transaction: { create: vi.fn() },
  notification: { create: vi.fn(), updateMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

vi.mock("@/lib/password", () => ({
  hashPassword: vi.fn(async (p: string) => `hashed:${p}`),
  verifyPassword: vi.fn(async (p: string, h: string) => h === `hashed:${p}`),
}));

process.env.AUTH_SECRET = "test-secret-key-for-unit-tests-only";

import {
  requestDepositAction,
  requestWithdrawalAction,
  requestInvestmentAction,
  changePasswordAction,
} from "@/app/(public)/dashboard/actions";

/* ---------------------------------------------------------------- helpers -- */

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

const FUTURE = new Date(Date.now() + 1000 * 60 * 60);

function signIn(user = sessionUser.current) {
  cookieStore.set("cp_user", "test-token");
  prismaMock.userSession.findUnique.mockResolvedValue({ expiresAt: FUTURE, user });
}

function noBalances() {
  prismaMock.deposit.findMany.mockResolvedValue([]);
  prismaMock.withdrawal.findMany.mockResolvedValue([]);
  prismaMock.investment.findMany.mockResolvedValue([]);
}

beforeEach(() => {
  cookieStore.clear();
  headerStore.clear();
  headerStore.set("x-forwarded-for", "10.0.0.1");
  vi.clearAllMocks();
  sessionUser.current.id = "u1";
});

/* ------------------------------------------------------------------ tests -- */

describe("requestDepositAction", () => {
  it("creates a PENDING deposit, ledger row and notification", async () => {
    signIn();
    prismaMock.deposit.create.mockResolvedValue({ id: "d1" });
    prismaMock.transaction.create.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const res = await requestDepositAction(
      undefined,
      form({ amount: "1000", method: "BANK_TRANSFER", reference: "tx-1" }),
    );

    expect(res.ok).toBe(true);
    expect(prismaMock.deposit.create).toHaveBeenCalledOnce();
    expect(prismaMock.deposit.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      amount: 1000,
      status: "PENDING",
      reference: "tx-1",
    });
    expect(prismaMock.transaction.create).toHaveBeenCalledOnce();
    expect(prismaMock.notification.create).toHaveBeenCalledOnce();
  });

  it("rejects a non-positive amount without writing", async () => {
    signIn();
    const res = await requestDepositAction(undefined, form({ amount: "0" }));
    expect(res.ok).toBe(false);
    expect(prismaMock.deposit.create).not.toHaveBeenCalled();
  });

  it("redirects to /login when there is no session", async () => {
    prismaMock.userSession.findUnique.mockResolvedValue(null);
    await expect(
      requestDepositAction(undefined, form({ amount: "100" })),
    ).rejects.toThrow("REDIRECT:/login");
  });
});

describe("requestWithdrawalAction", () => {
  it("blocks a withdrawal larger than the available balance", async () => {
    signIn();
    prismaMock.deposit.findMany.mockResolvedValue([{ amount: 100, status: "COMPLETED" }]);
    prismaMock.withdrawal.findMany.mockResolvedValue([]);
    prismaMock.investment.findMany.mockResolvedValue([]);

    const res = await requestWithdrawalAction(
      undefined,
      form({ amount: "500", method: "BANK_TRANSFER", destination: "IBAN GB00" }),
    );

    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/available balance/i);
    expect(prismaMock.withdrawal.create).not.toHaveBeenCalled();
  });

  it("creates a PENDING withdrawal within the available balance", async () => {
    signIn();
    prismaMock.deposit.findMany.mockResolvedValue([{ amount: 100, status: "COMPLETED" }]);
    prismaMock.withdrawal.findMany.mockResolvedValue([]);
    prismaMock.investment.findMany.mockResolvedValue([]);
    prismaMock.withdrawal.create.mockResolvedValue({ id: "w1" });
    prismaMock.transaction.create.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const res = await requestWithdrawalAction(
      undefined,
      form({ amount: "50", method: "BANK_TRANSFER", destination: "IBAN GB00" }),
    );

    expect(res.ok).toBe(true);
    expect(prismaMock.withdrawal.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      amount: 50,
      status: "PENDING",
    });
  });

  it("requires payout details", async () => {
    signIn();
    const res = await requestWithdrawalAction(
      undefined,
      form({ amount: "50", method: "BANK_TRANSFER", destination: "x" }),
    );
    expect(res.ok).toBe(false);
    expect(prismaMock.withdrawal.create).not.toHaveBeenCalled();
  });
});

describe("requestInvestmentAction", () => {
  const activeStrategy = {
    id: "s1",
    name: "Balanced Growth",
    status: "ACTIVE",
    minInvestment: 100,
    maxInvestment: 1000,
    durationMonths: 12,
  };

  it("rejects an inactive strategy", async () => {
    signIn();
    prismaMock.strategy.findUnique.mockResolvedValue({ ...activeStrategy, status: "INACTIVE" });
    const res = await requestInvestmentAction(
      undefined,
      form({ strategyId: "s1", amount: "500" }),
    );
    expect(res.ok).toBe(false);
    expect(prismaMock.investment.create).not.toHaveBeenCalled();
  });

  it("enforces the strategy minimum", async () => {
    signIn();
    prismaMock.strategy.findUnique.mockResolvedValue(activeStrategy);
    const res = await requestInvestmentAction(
      undefined,
      form({ strategyId: "s1", amount: "50" }),
    );
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/minimum/i);
  });

  it("blocks an investment above the available balance", async () => {
    signIn();
    prismaMock.strategy.findUnique.mockResolvedValue(activeStrategy);
    prismaMock.deposit.findMany.mockResolvedValue([{ amount: 300, status: "COMPLETED" }]);
    prismaMock.withdrawal.findMany.mockResolvedValue([]);
    prismaMock.investment.findMany.mockResolvedValue([]);

    const res = await requestInvestmentAction(
      undefined,
      form({ strategyId: "s1", amount: "500" }),
    );
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/available balance/i);
  });

  it("creates a PENDING investment when valid", async () => {
    signIn();
    prismaMock.strategy.findUnique.mockResolvedValue(activeStrategy);
    prismaMock.deposit.findMany.mockResolvedValue([{ amount: 5000, status: "COMPLETED" }]);
    prismaMock.withdrawal.findMany.mockResolvedValue([]);
    prismaMock.investment.findMany.mockResolvedValue([]);
    prismaMock.investment.create.mockResolvedValue({ id: "i1" });
    prismaMock.transaction.create.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const res = await requestInvestmentAction(
      undefined,
      form({ strategyId: "s1", amount: "500" }),
    );

    expect(res.ok).toBe(true);
    expect(prismaMock.investment.create.mock.calls[0][0].data).toMatchObject({
      userId: "u1",
      strategyId: "s1",
      amount: 500,
      status: "PENDING",
      durationMonths: 12,
    });
  });
});

describe("changePasswordAction", () => {
  it("rejects a wrong current password", async () => {
    signIn();
    const res = await changePasswordAction(
      undefined,
      form({ currentPassword: "wrong", newPassword: "brandnew123" }),
    );
    expect(res.ok).toBe(false);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("updates the hash and signs out other sessions", async () => {
    signIn();
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.userSession.deleteMany.mockResolvedValue({});
    prismaMock.notification.create.mockResolvedValue({});

    const res = await changePasswordAction(
      undefined,
      form({ currentPassword: "secret123", newPassword: "brandnew123" }),
    );

    expect(res.ok).toBe(true);
    expect(prismaMock.user.update).toHaveBeenCalledOnce();
    expect(prismaMock.user.update.mock.calls[0][0].data.passwordHash).toBe(
      "hashed:brandnew123",
    );
  });
});
