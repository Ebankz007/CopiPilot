"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { formatCurrency } from "@/lib/money";
import { str } from "@/lib/form";

async function guard() {
  const admin = await getCurrentAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

function revalidateFinance() {
  revalidatePath("/admin");
  revalidatePath("/admin/investments");
  revalidatePath("/admin/deposits");
  revalidatePath("/admin/withdrawals");
}

/* ------------------------------------------------------------ investments */

const INVESTMENT_STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;
type InvestmentStatus = (typeof INVESTMENT_STATUSES)[number];

export async function updateInvestmentAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const status = str(formData.get("status")) as InvestmentStatus;
  const note = str(formData.get("note"));
  if (!INVESTMENT_STATUSES.includes(status)) return;

  const before = await prisma.investment.findUnique({
    where: { id },
    include: { strategy: { select: { name: true } } },
  });
  if (!before) return;

  const startedAt =
    status === "ACTIVE" && !before.startedAt ? new Date() : before.startedAt;
  const maturesAt =
    status === "ACTIVE" && before.durationMonths && startedAt
      ? new Date(new Date(startedAt).setMonth(new Date(startedAt).getMonth() + before.durationMonths))
      : before.maturesAt;

  await prisma.investment.update({
    where: { id },
    data: {
      status,
      startedAt,
      maturesAt,
      notes: note || before.notes,
    },
  });

  // Keep the client ledger consistent with the review decision.
  const txStatus =
    status === "CANCELLED" ? "REJECTED" : status === "PENDING" ? "PENDING" : "COMPLETED";
  await prisma.transaction.updateMany({
    where: { relatedId: id, type: "INVESTMENT" },
    data: { status: txStatus },
  });

  await prisma.notification.create({
    data: {
      userId: before.userId,
      type: "INVESTMENT",
      title: `Investment ${status.toLowerCase()}`,
      body: `Your ${formatCurrency(before.amount)} investment in ${before.strategy.name} is now ${status.toLowerCase()}.`,
      link: "/dashboard/investments",
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Investment",
    entityId: id,
    before: { status: before.status },
    after: { status },
  });
  revalidateFinance();
}

export async function updateInvestmentProfitAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const raw = str(formData.get("profitLoss"));
  const profitLoss = Number(raw);
  if (!Number.isFinite(profitLoss)) return;

  const before = await prisma.investment.findUnique({ where: { id } });
  if (!before) return;

  await prisma.investment.update({ where: { id }, data: { profitLoss } });
  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Investment",
    entityId: id,
    before: { profitLoss: before.profitLoss },
    after: { profitLoss },
  });
  revalidateFinance();
}

/* ---------------------------------------------------------------- deposits */

const TX_STATUSES = ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "FAILED"] as const;
type TxStatus = (typeof TX_STATUSES)[number];

export async function updateDepositAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const status = str(formData.get("status")) as TxStatus;
  const note = str(formData.get("note"));
  if (!TX_STATUSES.includes(status)) return;

  const before = await prisma.deposit.findUnique({ where: { id } });
  if (!before) return;

  await prisma.deposit.update({
    where: { id },
    data: {
      status,
      adminNote: note || before.adminNote,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.transaction.updateMany({
    where: { relatedId: id, type: "DEPOSIT" },
    data: { status },
  });

  const settled = status === "COMPLETED" || status === "APPROVED";
  await prisma.notification.create({
    data: {
      userId: before.userId,
      type: "DEPOSIT",
      title: settled ? "Deposit approved" : `Deposit ${status.toLowerCase()}`,
      body: settled
        ? `Your deposit of ${formatCurrency(before.amount)} has been credited.`
        : `Your deposit of ${formatCurrency(before.amount)} was ${status.toLowerCase()}.`,
      link: "/dashboard/deposits",
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Deposit",
    entityId: id,
    before: { status: before.status },
    after: { status },
  });
  revalidateFinance();
}

/* ------------------------------------------------------------- withdrawals */

export async function updateWithdrawalAction(formData: FormData): Promise<void> {
  const admin = await guard();
  const id = str(formData.get("id"));
  const status = str(formData.get("status")) as TxStatus;
  const note = str(formData.get("note"));
  if (!TX_STATUSES.includes(status)) return;

  const before = await prisma.withdrawal.findUnique({ where: { id } });
  if (!before) return;

  await prisma.withdrawal.update({
    where: { id },
    data: {
      status,
      adminNote: note || before.adminNote,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  await prisma.transaction.updateMany({
    where: { relatedId: id, type: "WITHDRAWAL" },
    data: { status },
  });

  const settled = status === "COMPLETED" || status === "APPROVED";
  await prisma.notification.create({
    data: {
      userId: before.userId,
      type: "WITHDRAWAL",
      title: settled ? "Withdrawal approved" : `Withdrawal ${status.toLowerCase()}`,
      body: settled
        ? `Your withdrawal of ${formatCurrency(before.amount)} has been processed.`
        : `Your withdrawal of ${formatCurrency(before.amount)} was ${status.toLowerCase()}.`,
      link: "/dashboard/withdrawals",
    },
  });

  await recordAudit({
    adminId: admin.id,
    action: "UPDATE",
    entity: "Withdrawal",
    entityId: id,
    before: { status: before.status },
    after: { status },
  });
  revalidateFinance();
}
