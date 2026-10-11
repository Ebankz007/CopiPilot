import type { ReactNode } from "react";

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export const tableClass =
  "w-full border-collapse text-left text-sm";
export const thClass =
  "border-b border-border px-4 py-3 text-xs font-semibold uppercase tracking-wider text-faint";
export const tdClass = "border-b border-border px-4 py-3 align-middle text-muted";
