import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-25"
        aria-hidden="true"
      />
      <div className="relative">
        <Link href="/" aria-label="CopiPilot home" className="inline-block">
          <Logo />
        </Link>
        <p className="mt-10 font-display text-7xl font-bold text-gold">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
          This page has left the runway
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/">Back to home</ButtonLink>
          <ButtonLink href="/contact" variant="secondary">
            Contact us
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
