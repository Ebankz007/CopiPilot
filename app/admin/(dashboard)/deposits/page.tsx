import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/field";
import { formatCurrency } from "@/lib/money";
import { formatDateTime } from "@/lib/utils";
import { updateDepositAction } from "@/app/admin/actions/finance";

const STATUS = ["PENDING", "APPROVED", "COMPLETED", "REJECTED", "FAILED"] as const;

function tone(status: string) {
  if (status === "COMPLETED" || status === "APPROVED") return "success" as const;
  if (status === "PENDING") return "warning" as const;
  return "danger" as const;
}

export default async function AdminDepositsPage() {
  await requirePermission("deposits");

  const deposits = await prisma.deposit.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { email: true, fullName: true } } },
  });

  return (
    <>
      <AdminHeader
        title="Deposits"
        description="Review client deposit requests. Approving credits the client's available balance."
      />

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className={tableClass}>
          <thead>
            <tr>
              <th className={thClass}>Client</th>
              <th className={thClass}>Amount</th>
              <th className={thClass}>Method</th>
              <th className={thClass}>Reference</th>
              <th className={thClass}>Status</th>
              <th className={thClass}>Created</th>
            </tr>
          </thead>
          <tbody>
            {deposits.length === 0 ? (
              <tr>
                <td className={tdClass} colSpan={6}>
                  No deposits yet.
                </td>
              </tr>
            ) : (
              deposits.map((d) => (
                <tr key={d.id}>
                  <td className={tdClass}>
                    <span className="block text-foreground">{d.user.fullName}</span>
                    <span className="text-xs text-faint">{d.user.email}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-foreground">{formatCurrency(d.amount)}</span>
                  </td>
                  <td className={tdClass}>{d.method.replace("_", " ")}</td>
                  <td className={tdClass}>{d.reference ?? "—"}</td>
                  <td className={tdClass}>
                    <Badge tone={tone(d.status)}>{d.status}</Badge>
                  </td>
                  <td className={tdClass}>{formatDateTime(d.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3">
        {deposits
          .filter((d) => d.status === "PENDING")
          .map((d) => (
            <details key={d.id} className="rounded-2xl border border-border bg-card">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                <span className="text-sm text-foreground">
                  {d.user.email} ·{" "}
                  <span className="text-gold">{formatCurrency(d.amount)}</span> ·{" "}
                  {d.method.replace("_", " ")}
                </span>
                <Badge tone="warning">PENDING</Badge>
              </summary>
              <form action={updateDepositAction} className="grid gap-5 border-t border-border p-5 sm:grid-cols-3">
                <input type="hidden" name="id" value={d.id} />
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
                  <Input name="note" defaultValue={d.adminNote ?? ""} />
                </div>
                <div className="flex items-end">
                  <Button type="submit" size="sm">
                    Update deposit
                  </Button>
                </div>
              </form>
            </details>
          ))}
      </div>
    </>
  );
}
