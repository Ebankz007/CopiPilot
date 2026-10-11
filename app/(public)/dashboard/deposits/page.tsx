import { ArrowDownToLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPortfolioBalances } from "@/lib/finance";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { DepositRequestForm } from "@/components/dashboard/forms";
import { EmptyState } from "@/components/ui/empty-state";

export default async function DepositsPage() {
  const user = await requireUser();
  const [deposits, balances] = await Promise.all([
    prisma.deposit.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    getPortfolioBalances(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-brand">
          <ArrowDownToLine className="h-4 w-4" />
          <h2 className="font-display text-base font-semibold text-foreground">
            Request a deposit
          </h2>
        </div>
        <p className="mt-1 text-sm text-muted">
          Tell us how much you intend to deposit. Our team reviews every request.
        </p>
        <div className="mt-5">
          <DepositRequestForm available={balances.availableBalance} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-base font-semibold text-foreground">
          Deposit history
        </h2>
        <div className="mt-4">
          {deposits.length === 0 ? (
            <EmptyState
              title="No deposits yet"
              description="Your deposit requests and their status will appear here."
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
                      Method
                    </th>
                    <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((d) => (
                    <tr key={d.id}>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-foreground">
                        {formatCurrency(d.amount)}
                      </td>
                      <td className="border-b border-border px-4 py-3 text-muted">
                        {d.method.replace("_", " ")}
                      </td>
                      <td className="border-b border-border px-4 py-3">
                        <StatusBadge status={d.status} />
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
