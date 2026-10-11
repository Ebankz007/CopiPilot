"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DangerButton({
  children,
  message = "Are you sure? This cannot be undone.",
  className,
  label,
}: {
  children?: React.ReactNode;
  message?: string;
  className?: string;
  label?: string;
}) {
  const [pending, setPending] = React.useState(false);

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
          return;
        }
        setPending(true);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border border-danger/30 px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10 disabled:opacity-50",
        className,
      )}
      aria-label={label}
    >
      {children ?? "Delete"}
    </button>
  );
}
