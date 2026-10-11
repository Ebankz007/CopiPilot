import { TrendingUp } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolioBalances } from "@/lib/finance";
import { formatCurrency, formatPercent } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { InvestForm } from "@/components/dashboard/forms";
import { EmptyState } from "@/components/ui/empty-state";

export default async function InvestmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ strategy?: string }>;
}) {
  const user = await requireUser();
  const { strategy: preselectSlug } = await searchParams;

  const [strategies, investments, balances] = await Promise.all([
    prisma.strategy.findMany({
      where: { status: "ACTIVE" },
      orderBy: [{ isFeatured: "desc" }, { order: "asc" }],
    }),
    prisma.investment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { strategy: { select: { name: true, slug: true } } },
    }),
    getPortfolioBalances(user.id),
  ]);

  const preselectId = preselectSlug
    ? strategies.find((s) => s.slug === preselectSlug)?.id
    : undefined;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-brand">
          <TrendingUp className="h-4 w-4" />
          <h2 className="font-display text-base font-semibold text-foreground">
            Make an investment
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Choose a strategy and an amount. Requests are reviewed before they go live.
        </p>
        <div className="mt-5">
          {strategies.length > 0 ? (
            <InvestForm
              strategies={strategies.map((s) => ({
                id: s.id,
                name: s.name,
                minInvestment: s.minInvestment,
                maxInvestment: s.maxInvestment,
                targetReturn: s.targetReturn,
                returnPeriod: s.returnPeriod,
                riskLevel: s.riskLevel,
              }))}
              available={balances.availableBalance}
              preselectId={preselectId}
            />
          ) : (
            <p className="text-sm text-faint">
              No active strategies are available right now.
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-semibold text-foreground">
          Your investments
        </h2>
        <div className="mt-4">
          {investments.length === 0 ? (
            <EmptyState
              title="No investments yet"
              description="Your investments will appear here once you make one."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Strategy
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Amount
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Profit / loss
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Status
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {investments.map((inv) => (
                    <tr key={inv.id}>
                      <td className="border-b border-border px-4 py-3 text-foreground">
                        {inv.strategy.name}
                        <span className="block text-xs text-faint">{inv.referenceId}</span>
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {formatCurrency(inv.amount)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {formatCurrency(inv.profitLoss)}
                        {inv.durationMonths ? (
                          <span className="block text-xs text-faint">
                            {inv.durationMonths} mo term
                          </span>
                        ) : null}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {inv.startedAt ? formatDate(inv.startedAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs leading-relaxed text-faint">
        Target returns are illustrative and not guaranteed. Capital is at risk. The
        maximum of your strategy&apos;s range, if any, is shown on the strategy page.
      </p>
    </div>
  );
}
