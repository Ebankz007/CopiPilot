import { prisma } from "./prisma";
import type { TransactionType, TransactionStatus } from "@/lib/generated/prisma/enums";

/**
 * The client ledger.
 *
 * Every financial event writes an immutable `Transaction` row. Balances are
 * *derived* from these rows plus the investment book — never stored as a
 * mutable number that can silently drift. No real payment rail is connected;
 * deposits/withdrawals are admin-reviewed records, and this module is the
 * single place that interprets them.
 */

export type PortfolioBalances = {
  totalDeposited: number;
  totalWithdrawn: number;
  totalInvested: number;
  totalProfit: number;
  portfolioValue: number;
  availableBalance: number;
};

export async function recordTransaction(input: {
  userId: string;
  type: TransactionType;
  amount: number;
  status?: TransactionStatus;
  currency?: string;
  reference?: string | null;
  description?: string | null;
  relatedId?: string | null;
}): Promise<void> {
  await prisma.transaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      status: input.status ?? "PENDING",
      currency: input.currency ?? "USD",
      reference: input.reference ?? null,
      description: input.description ?? null,
      relatedId: input.relatedId ?? null,
    },
  });
}

const SETTLED = new Set(["COMPLETED", "APPROVED"]);

export async function getPortfolioBalances(
  userId: string,
): Promise<PortfolioBalances> {
  const [deposits, withdrawals, investments] = await Promise.all([
    prisma.deposit.findMany({ where: { userId }, select: { amount: true, status: true } }),
    prisma.withdrawal.findMany({ where: { userId }, select: { amount: true, status: true } }),
    prisma.investment.findMany({
      where: { userId },
      select: { amount: true, status: true, profitLoss: true },
    }),
  ]);

  const totalDeposited = deposits
    .filter((d) => SETTLED.has(d.status))
    .reduce((sum, d) => sum + d.amount, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => SETTLED.has(w.status))
    .reduce((sum, w) => sum + w.amount, 0);

  const activeOrDone = investments.filter(
    (i) => i.status === "ACTIVE" || i.status === "COMPLETED",
  );
  const totalInvested = activeOrDone.reduce((sum, i) => sum + i.amount, 0);
  const totalProfit = activeOrDone.reduce((sum, i) => sum + i.profitLoss, 0);

  // Pending investment requests have not yet been approved, but the capital is
  // committed the moment the client asks — count it against the balance so a
  // client cannot request more than they hold while a request is in review.
  const committed = investments
    .filter((i) => i.status !== "CANCELLED")
    .reduce((sum, i) => sum + i.amount, 0);

  return {
    totalDeposited,
    totalWithdrawn,
    totalInvested,
    totalProfit,
    portfolioValue: totalInvested + totalProfit,
    availableBalance: totalDeposited - totalWithdrawn - committed,
  };
}
