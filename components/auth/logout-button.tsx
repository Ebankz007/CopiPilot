"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton({
  endpoint = "/api/auth/logout",
  redirectTo = "/",
  className,
  label = "Sign out",
}: {
  endpoint?: string;
  redirectTo?: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function onClick() {
    setPending(true);
    try {
      await fetch(endpoint, { method: "POST" });
      router.push(redirectTo);
      router.refresh();
    } catch {
      toast.error("Could not sign out. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={pending}
      className={className}
    >
      <LogOut className="h-4 w-4" />
      {pending ? "Signing out…" : label}
    </Button>
  );
}
