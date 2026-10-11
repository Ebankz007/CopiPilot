"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";

export function ForgotPasswordForm() {
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (payload?.errors) setErrors(payload.errors);
        toast.error(payload?.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <p className="rounded-lg border border-success/30 bg-success/10 px-3.5 py-3 text-sm text-success">
          If an account exists for that email, we&apos;ve sent a reset link.
        </p>
        <p className="text-sm text-muted">
          Check your inbox and follow the link to choose a new password.
        </p>
        <Link href="/login" className="block text-sm font-medium text-brand hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="email" />
        <FieldError>{errors.email}</FieldError>
      </div>

      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? <Spinner /> : null}
        {pending ? "Sending…" : "Send reset link"}
      </Button>

      <p className="text-center text-sm text-muted">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
