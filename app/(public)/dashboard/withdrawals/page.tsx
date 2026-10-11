import { ArrowUpFromLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolioBalances } from "@/lib/finance";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { WithdrawalRequestForm } from "@/components/dashboard/forms";
import { EmptyState } from "@/components/ui/empty-state";

export default async function WithdrawalsPage() {
  const user = await requireUser();
  const [withdrawals, balances] = await Promise.all([
    prisma.withdrawal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getPortfolioBalances(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-brand">
          <ArrowUpFromLine className="h-4 w-4" />
          <h2 className="font-display text-base font-semibold text-foreground">
            Request a withdrawal
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Withdraw from your available balance. Requests are reviewed before payout.
        </p>
        <div className="mt-5">
          <WithdrawalRequestForm available={balances.availableBalance} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-semibold text-foreground">
          Withdrawal history
        </h2>
        <div className="mt-4">
          {withdrawals.length === 0 ? (
            <EmptyState
              title="No withdrawals yet"
              description="Your withdrawal requests and their status will appear here."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Date
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Amount
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Destination
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id}>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {formatDate(w.createdAt)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-foreground">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {w.destination ?? w.method.replace("_", " ")}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <StatusBadge status={w.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
