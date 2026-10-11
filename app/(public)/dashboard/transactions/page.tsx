import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function TransactionsPage() {
  const user = await requireUser();
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-base font-semibold text-foreground">
          Transaction ledger
        </h2>
        <p className="mt-1 text-sm text-muted">
          Every financial event on your account, in one place.
        </p>
      </div>

      {transactions.length === 0 ? (
        <EmptyState
          title="No transactions yet"
          description="Deposits, withdrawals, investments, and profits will appear here."
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
                  Type
                </th>
                <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                  Description
                </th>
                <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                  Amount
                </th>
                <th className="border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td className="border-b border-border px-4 py-3 text-muted">
                    {formatDateTime(t.createdAt)}
                  </td>
                  <td className="border-b border-border px-4 py-3 text-muted">{t.type}</td>
                  <td className="border-b border-border px-4 py-3 text-muted">
                    {t.description ?? "—"}
                  </td>
                  <td className="border-b border-border px-4 py-3 font-medium text-foreground">
                    {formatCurrency(t.amount)}
                  </td>
                  <td className="border-b border-border px-4 py-3">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
