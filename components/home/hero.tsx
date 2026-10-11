import { ArrowRight, ShieldCheck, TrendingUp } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/site/reveal";
import { GrowthChart } from "@/components/site/growth-chart";

export type HeroContent = {
  badge?: string;
  primaryCtaLabel?: string;
  primaryCtaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  highlights?: string[];
};

/** Broker partners shown as a trust strip beneath the hero CTAs. */
const BROKERS = ["Vantage", "PuPrime", "Ultima", "EC Markets"];

const ILLUSTRATIVE = [
  { month: 0, balance: 1000 },
  { month: 1, balance: 1025 },
  { month: 2, balance: 1051 },
  { month: 3, balance: 1078 },
  { month: 4, balance: 1105 },
  { month: 5, balance: 1133 },
  { month: 6, balance: 1162 },
  { month: 7, balance: 1191 },
  { month: 8, balance: 1221 },
  { month: 9, balance: 1252 },
  { month: 10, balance: 1283 },
  { month: 11, balance: 1315 },
  { month: 12, balance: 1348 },
];

export function Hero({
  eyebrow,
  title,
  subtitle,
  content,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  content?: HeroContent;
}) {
  const c = content ?? {};

  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Ambient background */}
      <div
        className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(58,141,255,0.22),transparent_65%)] blur-2xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[420px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(1,91,196,0.16),transparent_70%)] blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        {/* Copy */}
        <div>
          <Reveal>
            <Badge tone="brand" className="gap-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              {c.badge ?? eyebrow ?? "Investing Made Easy"}
            </Badge>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              {title}
            </h1>
          </Reveal>

          {subtitle && (
            <Reveal delay={150}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
                {subtitle}
              </p>
            </Reveal>
          )}

          <Reveal delay={220}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={c.primaryCtaUrl ?? "/register"} size="lg">
                {c.primaryCtaLabel ?? "Click Here To Get Private Access"}
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href={c.secondaryCtaUrl ?? "/strategies"}
                variant="secondary"
                size="lg"
              >
                {c.secondaryCtaLabel ?? "Explore strategies"}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="mt-10">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-faint">
                Trusted broker partners
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-7 gap-y-3">
                {BROKERS.map((b) => (
                  <span
                    key={b}
                    className="font-display text-base font-semibold text-muted/70 transition-colors hover:text-foreground"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {/* Floating UI card */}
        <Reveal delay={200} className="relative">
          <div className="relative mx-auto max-w-md">
            <div className="card border-brand/20 p-6 shadow-[0_40px_120px_-40px_rgba(58,141,255,0.4)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-faint">
                    Portfolio overview
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    $1,000.00
                  </p>
                </div>
                <Badge tone="brand">Illustrative</Badge>
              </div>

              <div className="mt-4">
                <GrowthChart points={ILLUSTRATIVE} ariaLabel="Illustrative growth projection" />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg border border-border bg-elevated/40 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-faint">Capital</p>
                  <p className="text-sm font-semibold text-foreground">$1,000</p>
                </div>
                <div className="rounded-lg border border-border bg-elevated/40 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-faint">Growth</p>
                  <p className="text-sm font-semibold text-brand">+34.8%</p>
                </div>
                <div className="rounded-lg border border-border bg-elevated/40 py-2.5">
                  <p className="text-[11px] uppercase tracking-wide text-faint">Period</p>
                  <p className="text-sm font-semibold text-foreground">12 mo</p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -bottom-5 -left-5 hidden rounded-xl border border-brand/20 bg-surface/90 px-4 py-3 shadow-xl backdrop-blur sm:block">
              <p className="text-[11px] uppercase tracking-wide text-faint">Active strategies</p>
              <p className="flex items-center gap-1.5 font-display text-lg font-bold text-foreground">
                <TrendingUp className="h-4 w-4 text-brand" />
                Managed &amp; automated
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
