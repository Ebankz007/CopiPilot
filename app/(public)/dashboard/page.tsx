import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Wallet,
  TrendingUp,
  PiggyBank,
  LineChart,
  ArrowRight,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolioBalances } from "@/lib/finance";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function DashboardOverviewPage() {
  const user = await requireUser();
  const [balances, investments, transactions, unread] = await Promise.all([
    getPortfolioBalances(user.id),
    prisma.investment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { strategy: { select: { name: true } } },
    }),
    prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const cards = [
    {
      label: "Available balance",
      value: formatCurrency(balances.availableBalance),
      icon: Wallet,
      accent: true,
    },
    {
      label: "Portfolio value",
      value: formatCurrency(balances.portfolioValue),
      icon: LineChart,
    },
    {
      label: "Total deposited",
      value: formatCurrency(balances.totalDeposited),
      icon: PiggyBank,
    },
    {
      label: "Total profit",
      value: formatCurrency(balances.totalProfit),
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Balances */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className={
                c.accent
                  ? "rounded-2xl border border-brand/30 bg-brand/[0.06] p-5"
                  : "rounded-2xl border border-border bg-card p-5"
              }
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-faint">
                  {c.label}
                </span>
                <Icon className="h-4 w-4 text-brand/70" />
              </div>
              <p className="mt-3 font-display text-2xl font-bold text-foreground">
                {c.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/dashboard/deposits">
          <ArrowDownToLine className="h-4 w-4" />
          Deposit
        </ButtonLink>
        <ButtonLink href="/dashboard/investments" variant="secondary">
          <TrendingUp className="h-4 w-4" />
          Invest
        </ButtonLink>
        <ButtonLink href="/dashboard/withdrawals" variant="secondary">
          <ArrowUpFromLine className="h-4 w-4" />
          Withdraw
        </ButtonLink>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Investments */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Recent investments
            </h2>
            <Link href="/dashboard/investments" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </div>
          {investments.length === 0 ? (
            <p className="text-sm text-faint">
              No investments yet.{" "}
              <Link href="/dashboard/investments" className="text-brand hover:underline">
                Make your first investment
              </Link>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {investments.map((inv) => (
                <li
                  key={inv.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {inv.strategy.name}
                    </p>
                    <p className="text-xs text-faint">
                      {formatDate(inv.createdAt)} · {inv.referenceId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(inv.amount)}
                    </span>
                    <StatusBadge status={inv.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Transactions */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-foreground">
              Recent activity
            </h2>
            <Link href="/dashboard/transactions" className="text-xs text-brand hover:underline">
              View all
            </Link>
          </div>
          {transactions.length === 0 ? (
            <p className="text-sm text-faint">No activity yet.</p>
          ) : (
            <ul className="space-y-3">
              {transactions.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {t.description ?? t.type}
                    </p>
                    <p className="text-xs text-faint">
                      {formatDate(t.createdAt)} · {t.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(t.amount)}
                    </span>
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {unread > 0 && (
        <Link
          href="/dashboard/notifications"
          className="flex items-center justify-between rounded-2xl border border-brand/25 bg-brand/[0.06] p-5"
        >
          <span className="text-sm text-foreground">
            You have <span className="font-semibold text-brand">{unread}</span> unread
            notification{unread > 1 ? "s" : ""}.
          </span>
          <ArrowRight className="h-4 w-4 text-brand" />
        </Link>
      )}

      <div className="rounded-2xl border border-warning/25 bg-warning/5 p-5">
        <p className="text-xs leading-relaxed text-muted">
          <span className="font-semibold text-warning">Risk notice: </span>
          Capital is at risk. The value of investments can go down as well as up, and you
          may get back less than you invest. Projections are estimates, not guarantees.
          Nothing on this platform is financial advice.
        </p>
      </div>
    </div>
  );
}
