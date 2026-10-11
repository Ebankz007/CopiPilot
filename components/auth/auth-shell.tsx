import Link from "next/link";
import { Logo } from "@/components/site/logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24">
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-30"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top,rgba(212,175,55,0.16),transparent_65%)]"
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/" aria-label="CopiPilot home">
            <Logo />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-card p-7 shadow-2xl sm:p-8">
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-1.5 text-sm text-muted">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <p className="mt-6 text-center text-xs text-faint">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-muted hover:text-gold">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-muted hover:text-gold">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
