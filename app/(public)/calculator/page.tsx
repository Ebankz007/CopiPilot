import type { Metadata } from "next";
import { ShieldCheck, TrendingUp, Clock, Wallet } from "lucide-react";
import { getCalculatorSettings } from "@/lib/settings";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { InvestmentCalculator } from "@/components/calculator/calculator";
import { CtaBand } from "@/components/site/cta";

export const metadata: Metadata = {
  title: "Investment Calculator",
  description:
    "Model how your investment could grow over time with CopiPilot's compound-interest calculator. Illustrative projections only.",
};

export const revalidate = 120;

const POINTS = [
  {
    icon: TrendingUp,
    title: "Compounding",
    body: "Switch on reinvestment to see the effect of compounding returns month over month.",
  },
  {
    icon: Clock,
    title: "Any horizon",
    body: "Compare short and long durations side by side to understand the time value of money.",
  },
  {
    icon: Wallet,
    title: "Real inputs",
    body: "Adjust the amount, duration, and rate — the projection updates instantly.",
  },
  {
    icon: ShieldCheck,
    title: "Honest framing",
    body: "Every projection is labelled as an estimate. No returns are promised.",
  },
];

export default async function CalculatorPage() {
  const settings = await getCalculatorSettings();

  return (
    <>
      <PageHeader
        eyebrow="Calculator"
        title="See how your money could grow"
        subtitle="Adjust the amount, duration, and rate to model a projection. It's an estimate — not a promise — but it's a useful way to think in time and compounding."
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <InvestmentCalculator settings={settings} />
          </Reveal>
        </div>
      </section>

      <section className="border-t border-border py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {POINTS.map((p, i) => {
              const Icon = p.icon;
              return (
                <Reveal key={p.title} delay={i * 70}>
                  <div className="card h-full p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-sm font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <div className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CtaBand
            title="Found a plan that works?"
            subtitle="Create your account and start investing in a live strategy."
            primaryLabel="Create your account"
            primaryUrl="/register"
            secondaryLabel="Browse strategies"
            secondaryUrl="/strategies"
          />
        </div>
      </div>
    </>
  );
}
