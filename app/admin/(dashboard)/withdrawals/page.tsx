import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { formatCurrency } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { updateWithdrawalAction } from "@/app/admin/actions/finance";

const STATUS = ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "FAILED"] as const;

function tone(status: string) {
  if (status === "COMPLETED" || status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  return "danger" as const;
}

export default async function AdminWithdrawalsPage() {
  await requirePermission("withdrawals");

  const withdrawals = await prisma.withdrawal.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, fullName: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Withdrawals"
        description="Review client withdrawal requests. Approving marks the payout as settled."
      />

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Client</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Method</th>
              <th className={thClass}>Destination</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.length === 0 ? (
              <tr>
                <td className={tdClass} colSpan={6}>
                  No withdrawals yet.
                </td>
              </tr>
            ) : (
              withdrawals.map((w) => (
                <tr key={w.id}>
                  <td className={tdClass}>
                    <span className="block text-foreground">{w.user.fullName}</span>
                    <span className="text-xs text-faint">{w.user.email}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-foreground">{formatCurrency(w.amount)}</span>
                  </td>
                  <td className={tdClass}>{w.method.replace("_", " ")}</td>
                  <td className={tdClass}>{w.destination ?? "—"}</td>
                  <td className={tdClass}>
                    <Badge tone={tone(w.status)}>{w.status}</Badge>
                  </td>
                  <td className={tdClass}>{formatDateTime(w.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3">
        {withdrawals
          .filter((w) => w.status === "PENDING")
          .map((w) => (
            <details key={w.id} className="rounded-2xl border border-border bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <span className="text-sm text-foreground">
                  {w.user.email} ·{" "}
                  <span className="text-brand">{formatCurrency(w.amount)}</span> ·{" "}
                  {w.destination ?? w.method.replace("_", " ")}
                </span>
                <Badge tone="warning">PENDING</Badge>
              </summary>
              <form action={updateWithdrawalAction} className="grid gap-5 border-t border-border p-5 sm:grid-cols-3">
                <input type="hidden" name="id" value={w.id} />
                <div>
                  <Label>Set status</Label>
                  <Select name="status" defaultValue="APPROVED">
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>Internal note (optional)</Label>
                  <Input name="note" defaultValue={w.adminNote ?? ""} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="sm">
                    Update withdrawal
                  </Button>
                </div>
              </form>
            </details>
          ))}
      </div>
    </>
  );
}
