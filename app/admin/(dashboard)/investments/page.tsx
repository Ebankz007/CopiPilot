import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { formatCurrency } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import {
  updateInvestmentAction,
  updateInvestmentProfitAction,
} from "@/app/admin/actions/finance";

const STATUS = ["PENDING", "ACTIVE", "COMPLETED", "CANCELLED"] as const;

export default async function AdminInvestmentsPage() {
  await requirePermission("investments");

  const investments = await prisma.investment.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { email: true, fullName: true } },
      strategy: { select: { name: true } },
    },
  });

  return (
    <>
      <AdminHeader
        title="Investments"
        description="Review client investment requests. Approving moves capital from committed to active; cancelling releases it."
      />

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Client</th>
              <th className={thClass}>Strategy</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
            </tr>
          </thead>
          <tbody>
            {investments.length === 0 ? (
              <tr>
                <td className={tdClass} colSpan={5}>
                  No investments yet.
                </td>
              </tr>
            ) : (
              investments.map((inv) => (
                <tr key={inv.id}>
                  <td className={tdClass}>
                    <span className="block text-foreground">{inv.user.fullName}</span>
                    <span className="text-xs text-faint">{inv.user.email}</span>
                  </td>
                  <td className={tdClass}>
                    {inv.strategy.name}
                    <span className="block text-xs text-faint">{inv.referenceId}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-foreground">{formatCurrency(inv.amount)}</span>
                    <span className="block text-xs text-faint">
                      P/L {formatCurrency(inv.profitLoss)}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <Badge
                      tone={
                        inv.status === "ACTIVE"
                          ? "success"
                          : inv.status === "PENDING"
                            ? "warning"
                            : "neutral"
                      }
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className={tdClass}>{formatDateTime(inv.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3">
        {investments
          .filter((i) => i.status === "PENDING" || i.status === "ACTIVE")
          .map((inv) => (
            <details key={inv.id} className="rounded-2xl border border-border bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <span className="text-sm text-foreground">
                  {inv.user.email} · {inv.strategy.name} ·{" "}
                  <span className="text-gold">{formatCurrency(inv.amount)}</span>
                </span>
                <Badge tone={inv.status === "ACTIVE" ? "success" : "warning"}>
                  {inv.status}
                </Badge>
              </summary>
              <div className="grid gap-6 border-t border-border p-5 sm:grid-cols-2">
                <form action={updateInvestmentAction} className="space-y-3">
                  <input type="hidden" name="id" value={inv.id} />
                  <div>
                    <Label>Set status</Label>
                    <Select name="status" defaultValue={inv.status}>
                      {STATUS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label>Internal note (optional)</Label>
                    <Input name="note" defaultValue={inv.notes ?? ""} />
                  </div>
                  <Button type="submit" size="sm">
                    Update status
                  </Button>
                </form>

                <form action={updateInvestmentProfitAction} className="space-y-3">
                  <input type="hidden" name="id" value={inv.id} />
                  <div>
                    <Label>Profit / loss (USD)</Label>
                    <Input
                      name="profitLoss"
                      type="number"
                      step="0.01"
                      defaultValue={inv.profitLoss}
                    />
                  </div>
                  <Button type="submit" size="sm" variant="secondary">
                    Record P/L
                  </Button>
                </form>
              </div>
            </details>
          ))}
      </div>
    </>
  );
}
