import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "./reveal";

export function CtaBand({
  title,
  subtitle,
  primaryLabel,
  primaryUrl,
  secondaryLabel,
  secondaryUrl,
}: {
  title: string;
  subtitle?: string | null;
  primaryLabel: string;
  primaryUrl: string;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
}) {
  return (
    <Reveal className="relative overflow-hidden rounded-3xl border border-brand/25 bg-gradient-to-br from-[#0a1a2e] via-[#0b1c33] to-[#050b16] px-6 py-14 text-center sm:px-12">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl"
        aria-hidden="true"
      />
      <h2 className="relative font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="relative mx-auto mt-4 max-w-xl text-base text-muted">
          {subtitle}
        </p>
      )}
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href={primaryUrl} size="lg">
          {primaryLabel}
        </ButtonLink>
        {secondaryLabel && secondaryUrl && (
          <ButtonLink href={secondaryUrl} variant="secondary" size="lg">
            {secondaryLabel}
          </ButtonLink>
        )}
      </div>
    </Reveal>
  );
}
