import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentAdmin } from "@/lib/auth";
import { Logo } from "@/components/site/logo";
import { AdminLoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");
  const { next } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-25"
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="CopiPilot home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl">
          <h1 className="font-display text-xl font-bold text-foreground">
            Admin console
          </h1>
          <p className="mt-1.5 text-sm text-muted">
            Sign in to manage site content.
          </p>
          <div className="mt-7">
            <AdminLoginForm next={next} />
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-faint">
          <Link href="/" className="hover:text-gold">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
