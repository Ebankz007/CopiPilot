import Link from "next/link";
import { ArrowRight, Gauge, TrendingUp, Timer, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/money";

export type StrategyCardData = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  minInvestment: number;
  maxInvestment: number | null;
  targetReturn: number | null;
  returnPeriod: string | null;
  durationMonths: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  strategyType: string;
  profitFactor: number | null;
  maxDrawdown: number | null;
  status: "ACTIVE" | "INACTIVE" | "COMING_SOON";
  isFeatured: boolean;
  ctaLabel: string;
  ctaUrl: string | null;
};

const RISK_TONE: Record<string, "success" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "danger",
};

export function StrategyCard({ strategy }: { strategy: StrategyCardData }) {
  const comingSoon = strategy.status === "COMING_SOON";
  const metrics: { label: string; value: string; icon: typeof Gauge }[] = [
    { label: "Min. investment", value: formatCurrency(strategy.minInvestment), icon: Gauge },
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
      label: "Max drawdown",
      value: strategy.maxDrawdown != null ? formatPercent(strategy.maxDrawdown, 1) : "—",
      icon: ShieldAlert,
    },
  ];

  return (
    <div
      className={cn(
        "card card-hover relative flex h-full flex-col p-6",
        strategy.isFeatured && "border-gold/40",
      )}
    >
      {strategy.isFeatured && (
        <span className="absolute -top-3 left-6">
          <Badge tone="gold">Featured</Badge>
        </span>
      )}

      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">
            {strategy.name}
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-faint">
            {strategy.strategyType}
          </p>
        </div>
        <Badge tone={RISK_TONE[strategy.riskLevel] ?? "neutral"}>
          {strategy.riskLevel} risk
        </Badge>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        {strategy.shortDescription}
      </p>

      <dl className="mt-5 grid grid-cols-2 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="rounded-xl border border-border bg-elevated/40 p-3"
            >
              <dt className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint">
                <Icon className="h-3.5 w-3.5 text-gold/70" />
                {m.label}
              </dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">
                {m.value}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="mt-5 flex items-center gap-2 text-xs text-faint">
        <span
          className={cn(
            "inline-block h-1.5 w-1.5 rounded-full",
            comingSoon ? "bg-warning" : "bg-success",
          )}
        />
        {comingSoon ? "Launching soon" : "Active"}
        {strategy.profitFactor != null && (
          <span className="ml-auto">Profit factor {strategy.profitFactor.toFixed(2)}</span>
        )}
      </div>

      <div className="mt-6 pt-1">
        {comingSoon ? (
          <ButtonLink href="/contact" variant="secondary" className="w-full">
            Join the waitlist
          </ButtonLink>
        ) : (
          <ButtonLink href={strategy.ctaUrl ?? `/strategies/${strategy.slug}`} className="w-full">
            {strategy.ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>
        )}
      </div>

      <Link
        href={`/strategies/${strategy.slug}`}
        className="mt-3 text-center text-xs text-muted transition-colors hover:text-gold"
      >
        View full details
      </Link>
    </div>
  );
}
