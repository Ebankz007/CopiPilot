import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader, tableClass, tdClass, thClass } from "@/components/admin/admin-header";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClass } from "@/components/ui/button";

const PAGE_SIZE = 50;
const ACTIONS = ["CREATE", "UPDATE", "DELETE", "LOGIN", "LOGOUT"] as const;

type Tone = "brand" | "neutral" | "success" | "warning" | "danger";

function actionTone(action: string): Tone {
  switch (action) {
    case "CREATE":
      return "success";
    case "UPDATE":
      return "brand";
    case "DELETE":
      return "danger";
    case "LOGIN":
      return "neutral";
    case "LOGOUT":
      return "warning";
    default:
      return "neutral";
  }
}

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

export default async function AdminAuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requirePermission("audit");

  const sp = await searchParams;
  const entity = first(sp.entity);
  const action = first(sp.action);
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const where = {
    ...(entity ? { entity: { contains: entity, mode: "insensitive" as const } } : {}),
    ...(action ? { action } : {}),
  };

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { admin: { select: { name: true, email: true } } },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filtered = Boolean(entity || action);

  const buildHref = (overrides: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams();
    if (entity) params.set("entity", entity);
    if (action) params.set("action", action);
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === "") params.delete(key);
      else params.set(key, String(value));
    }
    const qs = params.toString();
    return qs ? `/admin/audit?${qs}` : "/admin/audit";
  };

  return (
    <>
      <AdminHeader
        title="Audit log"
        description="Every content change and sign-in, newest first. Read-only."
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">Entity</span>
          <input
            type="text"
            name="entity"
            defaultValue={entity}
            placeholder="e.g. Page, PricingPlan"
            className="w-56 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wider text-faint">Action</span>
          <select
            name="action"
            defaultValue={action}
            className="w-40 rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-brand"
          >
            <option value="">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Filter
        </button>
        {filtered && (
          <Link href="/admin/audit" className={buttonClass("ghost", "md")}>
            Clear
          </Link>
        )}
        <span className="ml-auto text-xs text-faint">
          {total} {total === 1 ? "entry" : "entries"}
        </span>
      </form>

      {logs.length === 0 ? (
        <EmptyState
          title="No activity"
          description={
            filtered
              ? "No audit entries match these filters."
              : "Content changes and sign-ins will be recorded here."
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className={tableClass}>
            <thead>
              <tr>
                <th className={thClass}>When</th>
                <th className={thClass}>Action</th>
                <th className={thClass}>Entity</th>
                <th className={thClass}>By</th>
                <th className={thClass}>IP</th>
                <th className={thClass}>Detail</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const detail =
                  log.before || log.after
                    ? JSON.stringify({ before: log.before, after: log.after }, null, 2)
                    : null;
                return (
                  <tr key={log.id}>
                    <td className={`${tdClass} whitespace-nowrap text-xs`}>
                      {log.createdAt.toLocaleString()}
                    </td>
                    <td className={tdClass}>
                      <Badge tone={actionTone(log.action)}>{log.action}</Badge>
                    </td>
                    <td className={tdClass}>
                      <span className="text-foreground">{log.entity}</span>
                      {log.entityId && (
                        <span className="ml-2 font-mono text-xs text-faint">
                          {log.entityId.slice(0, 8)}
                        </span>
                      )}
                    </td>
                    <td className={tdClass}>{log.admin?.name ?? "system"}</td>
                    <td className={`${tdClass} font-mono text-xs`}>{log.ip ?? "—"}</td>
                    <td className={tdClass}>
                      {detail ? (
                        <details>
                          <summary className="cursor-pointer text-xs text-brand hover:underline">
                            View
                          </summary>
                          <pre className="mt-2 max-w-md overflow-x-auto rounded-lg bg-surface p-3 text-xs text-muted">
                            {detail}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-xs text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          {page > 1 ? (
            <Link href={buildHref({ page: page - 1 })} className={buttonClass("secondary", "sm")}>
              Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-xs text-faint">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={buildHref({ page: page + 1 })} className={buttonClass("secondary", "sm")}>
              Next
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </>
  );
}
