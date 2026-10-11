"use client";

import * as React from "react";
import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/lib/form";

type Action = (
  state: ActionState | undefined,
  formData: FormData,
) => Promise<ActionState | void>;

export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  submitClassName,
  className,
  hideSubmit = false,
  footer,
}: {
  action: Action;
  children: React.ReactNode;
  submitLabel?: string;
  submitClassName?: string;
  className?: string;
  hideSubmit?: boolean;
  footer?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(
    action as (s: ActionState | undefined, f: FormData) => Promise<ActionState>,
    undefined,
  );

  return (
    <form action={formAction} className={cn("space-y-5", className)}>
      {children}

      {state?.error && (
        <p className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {state.error}
        </p>
      )}
      {state?.ok && state.message && (
        <p className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-3.5 py-2.5 text-sm text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {state.message}
        </p>
      )}

      {!hideSubmit && (
        <div className="flex items-center gap-3 pt-1">
          <Button type="submit" disabled={pending} className={submitClassName}>
            {pending ? <Spinner /> : null}
            {pending ? "Saving…" : submitLabel}
          </Button>
          {footer}
        </div>
      )}
      {hideSubmit && footer}
    </form>
  );
}
