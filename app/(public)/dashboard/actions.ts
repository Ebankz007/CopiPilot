"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { requireUser, USER_COOKIE } from "@/lib/auth";
import { hashToken } from "@/lib/tokens";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPortfolioBalances, recordTransaction } from "@/lib/finance";
import { formatCurrency } from "@/lib/money";
import {
  changePasswordSchema,
  depositRequestSchema,
  investmentRequestSchema,
  profileSchema,
  withdrawalRequestSchema,
} from "@/lib/validators";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { str, type ActionState } from "@/lib/form";

function revalidateClient() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/deposits");
  revalidatePath("/dashboard/withdrawals");
  revalidatePath("/dashboard/transactions");
  revalidatePath("/dashboard/notifications");
}

/* -------------------------------------------------------------- deposits -- */

export async function requestDepositAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const h = await headers();
  const ip = getClientIp(h);
  const limit = rateLimit(`deposit:${user.id}:${ip}`, 10, 60 * 60 * 1000);
  if (!limit.ok) {
    return { ok: false, error: `Too many requests. Try again in ${limit.retryAfter}s.` };
  }

  const parsed = depositRequestSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method") ?? "BANK_TRANSFER",
    reference: formData.get("reference") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { amount, method, reference } = parsed.data;
  const deposit = await prisma.deposit.create({
    data: {
      userId: user.id,
      amount,
      method,
      reference: reference || null,
      status: "PENDING",
    },
  });

  await recordTransaction({
    userId: user.id,
    type: "DEPOSIT",
    amount,
    status: "PENDING",
    description: `Deposit request · ${method.replace("_", " ").toLowerCase()}`,
    relatedId: deposit.id,
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "DEPOSIT",
      title: "Deposit request received",
      body: `Your deposit of ${formatCurrency(amount)} is pending review.`,
      link: "/dashboard/deposits",
    },
  });

  revalidateClient();
  return { ok: true, message: "Deposit request submitted for review." };
}

/* ------------------------------------------------------------ withdrawals -- */

export async function requestWithdrawalAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = withdrawalRequestSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method") ?? "BANK_TRANSFER",
    destination: formData.get("destination"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { amount, method, destination } = parsed.data;
  const balances = await getPortfolioBalances(user.id);
  if (amount > balances.availableBalance) {
    return {
      ok: false,
      error: `Amount exceeds your available balance of ${formatCurrency(balances.availableBalance)}.`,
    };
  }

  const withdrawal = await prisma.withdrawal.create({
    data: {
      userId: user.id,
      amount,
      method,
      destination,
      status: "PENDING",
    },
  });

  await recordTransaction({
    userId: user.id,
    type: "WITHDRAWAL",
    amount,
    status: "PENDING",
    description: `Withdrawal request · ${method.replace("_", " ").toLowerCase()}`,
    relatedId: withdrawal.id,
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "WITHDRAWAL",
      title: "Withdrawal request received",
      body: `Your withdrawal of ${formatCurrency(amount)} is pending review.`,
      link: "/dashboard/withdrawals",
    },
  });

  revalidateClient();
  return { ok: true, message: "Withdrawal request submitted for review." };
}

/* ------------------------------------------------------------ investments -- */

export async function requestInvestmentAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = investmentRequestSchema.safeParse({
    strategyId: formData.get("strategyId"),
    amount: formData.get("amount"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { strategyId, amount } = parsed.data;
  const strategy = await prisma.strategy.findUnique({ where: { id: strategyId } });
  if (!strategy || strategy.status !== "ACTIVE") {
    return { ok: false, error: "That strategy is not available." };
  }
  if (amount < strategy.minInvestment) {
    return {
      ok: false,
      error: `The minimum for ${strategy.name} is ${formatCurrency(strategy.minInvestment)}.`,
    };
  }
  if (strategy.maxInvestment && amount > strategy.maxInvestment) {
    return {
      ok: false,
      error: `The maximum for ${strategy.name} is ${formatCurrency(strategy.maxInvestment)}.`,
    };
  }

  const balances = await getPortfolioBalances(user.id);
  if (amount > balances.availableBalance) {
    return {
      ok: false,
      error: `You need to deposit funds first. Available balance: ${formatCurrency(balances.availableBalance)}.`,
    };
  }

  const referenceId = `INV-${randomUUID().slice(0, 8).toUpperCase()}`;
  const investment = await prisma.investment.create({
    data: {
      userId: user.id,
      strategyId: strategy.id,
      amount,
      status: "PENDING",
      durationMonths: strategy.durationMonths,
      referenceId,
    },
  });

  await recordTransaction({
    userId: user.id,
    type: "INVESTMENT",
    amount,
    status: "PENDING",
    description: `Investment in ${strategy.name}`,
    relatedId: investment.id,
  });
  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "INVESTMENT",
      title: "Investment request received",
      body: `Your ${formatCurrency(amount)} investment in ${strategy.name} is pending approval.`,
      link: "/dashboard/investments",
    },
  });

  revalidateClient();
  return { ok: true, message: "Investment request submitted for approval." };
}

/* ----------------------------------------------------------------- profile */

export async function updateProfileAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") ?? "",
    country: formData.get("country") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.data.fullName,
      phone: parsed.data.phone || null,
      country: parsed.data.country || null,
    },
  });

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(
  _prev: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "Your current password is incorrect." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  // Sign out every other session; keep the one making this change.
  const jar = await cookies();
  const token = jar.get(USER_COOKIE)?.value;
  await prisma.userSession.deleteMany({
    where: {
      userId: user.id,
      ...(token ? { tokenHash: { not: hashToken(token) } } : {}),
    },
  });

  await prisma.notification.create({
    data: {
      userId: user.id,
      type: "SECURITY",
      title: "Password changed",
      body: "Your password was changed and other sessions were signed out.",
      link: "/dashboard/settings",
    },
  });

  revalidatePath("/dashboard/notifications");
  return { ok: true, message: "Password updated. Other sessions were signed out." };
}

/* ----------------------------------------------------------- notifications */

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = str(formData.get("id"));
  if (!id) return;
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  revalidatePath("/dashboard");
}
