import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Gauge,
  TrendingUp,
  Timer,
  ShieldAlert,
  Target,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getStrategyBySlug, getStrategies } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";
import { formatCurrency, formatPercent } from "@/lib/money";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { StrategyCard, type StrategyCardData } from "@/components/site/strategy-card";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const strategy = await getStrategyBySlug(slug);
  if (!strategy) return { title: "Strategy not found" };
  return {
    title: strategy.name,
    description: strategy.shortDescription,
  };
}

const RISK_TONE: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export default async function StrategyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [strategy, all, user] = await Promise.all([
    getStrategyBySlug(slug),
    getStrategies(),
    getCurrentUser(),
  ]);

  if (!strategy || strategy.status === "INACTIVE") notFound();

  const comingSoon = strategy.status === "COMING_SOON";
  const investHref = user
    ? `/dashboard/investments?strategy=${strategy.slug}`
    : `/register?next=/dashboard/investments?strategy=${strategy.slug}`;

  const metrics = [
    { label: "Minimum", value: formatCurrency(strategy.minInvestment), icon: Gauge },
    {
      label: "Maximum",
      value: strategy.maxInvestment ? formatCurrency(strategy.maxInvestment) : "No cap",
      icon: Target,
    },
    {
      label: "Target return",
      value:
        strategy.targetReturn != null
          ? `${formatPercent(strategy.targetReturn, 1)} ${strategy.returnPeriod ?? ""}`.trim()
          : "—",
      icon: TrendingUp,
    },
    {
      label: "Duration",
      value: strategy.durationMonths ? `${strategy.durationMonths} months` : "Flexible",
      icon: Timer,
    },
    {
      label: "Risk level",
      value: strategy.riskLevel,
      icon: ShieldAlert,
    },
    {
      label: "Profit factor",
      value: strategy.profitFactor != null ? strategy.profitFactor.toFixed(2) : "—",
      icon: Activity,
    },
    {
      label: "Max drawdown",
      value: strategy.maxDrawdown != null ? formatPercent(strategy.maxDrawdown, 1) : "—",
      icon: ShieldAlert,
    },
    {
      label: "Type",
      value: strategy.strategyType,
      icon: Activity,
    },
  ];

  const descriptionHtml = renderMarkdown(strategy.description);
  const termsHtml = strategy.terms ? renderMarkdown(strategy.terms) : null;

  const related: StrategyCardData[] = all
    .filter((s) => s.id !== strategy.id)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      slug: s.slug,
      name: s.name,
      shortDescription: s.shortDescription,
      minInvestment: s.minInvestment,
      maxInvestment: s.maxInvestment,
      targetReturn: s.targetReturn,
      returnPeriod: s.returnPeriod,
      durationMonths: s.durationMonths,
      riskLevel: s.riskLevel,
      strategyType: s.strategyType,
      profitFactor: s.profitFactor,
      maxDrawdown: s.maxDrawdown,
      status: s.status,
      isFeatured: s.isFeatured,
      ctaLabel: s.ctaLabel,
      ctaUrl: s.ctaUrl,
    }));

  return (
    <>
      <PageHeader eyebrow={strategy.strategyType} title={strategy.name} subtitle={strategy.shortDescription} />

      <section className="py-12 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.6fr_1fr] lg:px-8">
          {/* Main */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-3">
                <Badge tone={RISK_TONE[strategy.riskLevel] ?? "neutral"}>
                  {strategy.riskLevel} risk
                </Badge>
                {strategy.isFeatured && <Badge tone="brand">Featured</Badge>}
                <Badge tone={comingSoon ? "warning" : "success"}>
                  {comingSoon ? "Coming soon" : "Active"}
                </Badge>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {metrics.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.label}
                      className="rounded-xl border border-border bg-elevated/40 p-4"
                    >
                      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint">
                        <Icon className="h-3.5 w-3.5 text-brand/70" />
                        {m.label}
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-foreground">
                        {m.value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-10">
                <h2 className="font-display text-xl font-bold text-foreground">
                  About this strategy
                </h2>
                <article
                  className="prose-cp mt-4"
                  dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                />
              </div>
            </Reveal>

            {termsHtml && (
              <Reveal delay={180}>
                <div className="mt-10">
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Terms
                  </h2>
                  <article
                    className="prose-cp mt-4"
                    dangerouslySetInnerHTML={{ __html: termsHtml }}
                  />
                </div>
              </Reveal>
            )}
          </div>

          {/* Sticky CTA */}
          <Reveal delay={100}>
            <div className="lg:sticky lg:top-28">
              <div className="card border-brand/25 p-6">
                <p className="text-xs uppercase tracking-wider text-faint">
                  Minimum investment
                </p>
                <p className="mt-1 font-display text-3xl font-bold text-gradient-brand">
                  {formatCurrency(strategy.minInvestment)}
                </p>

                {strategy.targetReturn != null && (
                  <p className="mt-3 text-sm text-muted">
                    Target{" "}
                    <span className="font-semibold text-brand">
                      {formatPercent(strategy.targetReturn, 1)}
                    </span>{" "}
                    {strategy.returnPeriod ?? ""}
                  </p>
                )}

                <div className="mt-6 space-y-2.5 text-sm text-muted">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    {strategy.durationMonths
                      ? `${strategy.durationMonths}-month term`
                      : "Flexible term"}
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    {strategy.riskLevel} risk profile
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand" />
                    Track everything in your dashboard
                  </p>
                </div>

                <div className="mt-6">
                  {comingSoon ? (
                    <ButtonLink href="/contact" variant="secondary" className="w-full">
                      Join the waitlist
                    </ButtonLink>
                  ) : (
                    <ButtonLink href={investHref} className="w-full">
                      {user ? "Invest now" : "Get started"}
                      <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                  )}
                </div>

                <p className="mt-4 text-xs leading-relaxed text-faint">
                  Target returns are estimates only and are not guaranteed. Capital is
                  at risk. Read the Risk Disclosure before investing.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-border py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-xl font-bold text-foreground">
              Other strategies
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((s) => (
                <StrategyCard key={s.id} strategy={s} />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/strategies"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-bright"
              >
                View all strategies
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
