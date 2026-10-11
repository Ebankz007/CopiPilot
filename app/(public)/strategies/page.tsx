import type { Metadata } from "next";
import { getStrategies } from "@/lib/content";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { StrategyCard, type StrategyCardData } from "@/components/site/strategy-card";
import { CtaBand } from "@/components/site/cta";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata: Metadata = {
  title: "Strategies",
  description:
    "Compare CopiPilot's structured investment strategies — returns, durations, risk levels, and minimums, all clearly defined.",
};

export const revalidate = 120;

export default async function StrategiesPage() {
  const strategies = await getStrategies();

  const cards: StrategyCardData[] = strategies.map((s) => ({
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
      <PageHeader
        eyebrow="Strategies"
        title="Structured strategies, clearly defined"
        subtitle="Each strategy carries a defined risk level, minimum, target return, and duration — so you can compare like for like before you commit a single dollar."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {cards.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((s, i) => (
                <Reveal key={s.id} delay={i * 60}>
                  <StrategyCard strategy={s} />
                </Reveal>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No strategies published yet"
              description="Strategies will appear here once they're published from the admin console."
            />
          )}

          <p className="mt-8 text-xs leading-relaxed text-faint">
            Target returns are illustrative estimates, not guarantees. All investing
            carries risk, including the risk of loss of principal. Review each
            strategy&apos;s terms before investing.
          </p>
        </div>
      </section>

      <div className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CtaBand
            title="Ready to put capital to work?"
            subtitle="Create your account to invest in any active strategy."
            primaryLabel="Create your account"
            primaryUrl="/register"
            secondaryLabel="Model a projection"
            secondaryUrl="/calculator"
          />
        </div>
      </div>
    </>
  );
}
