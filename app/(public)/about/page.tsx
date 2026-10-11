import type { Metadata } from "next";
import { Target, Eye, ShieldCheck, Cpu, Headphones, Scale, ArrowRight } from "lucide-react";
import { getStats } from "@/lib/content";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { StatCard } from "@/components/site/stat-card";
import { CtaBand } from "@/components/site/cta";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description:
    "CopiPilot gives investors clear, structured access to professionally managed investment strategies — with technology that keeps every number visible.",
};

const VALUES = [
  {
    icon: Scale,
    title: "Transparency",
    body: "Every figure on this site is editable and clearly labelled. If a number is an estimate, we say so.",
  },
  {
    icon: ShieldCheck,
    title: "Risk first",
    body: "Capital preservation comes before upside. Projections are estimates, never guarantees.",
  },
  {
    icon: Cpu,
    title: "Technology",
    body: "A modern platform built on a secure, auditable, role-based architecture.",
  },
  {
    icon: Headphones,
    title: "Support",
    body: "Responsive client support and a clear onboarding path for every investor.",
  },
];

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <>
      <PageHeader
        eyebrow="About"
        title="A modern investment platform built on transparency"
        subtitle="CopiPilot exists to give investors structured access to professionally managed strategies — and to keep every number visible while doing it."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <div className="card h-full p-7">
              <div className="flex items-center gap-2 text-gold">
                <Target className="h-4 w-4" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Our mission
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                To give investors clear, structured access to professionally managed
                investment strategies — with technology that keeps every number
                visible and every risk disclosed.
              </p>
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="card h-full p-7">
              <div className="flex items-center gap-2 text-gold">
                <Eye className="h-4 w-4" />
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Our vision
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                A financial platform where strategy, technology, and transparency
                work together to build long-term value for the people who trust us
                with their capital.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-border bg-surface/60 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-foreground">
              What we stand for
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Four principles that shape every product decision we make.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 70}>
                  <div className="card h-full p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-sm font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <h2 className="font-display text-2xl font-bold text-foreground">
                By the numbers
              </h2>
              <p className="mt-2 text-sm text-muted">
                Illustrative figures — see our Risk Disclosure for detail.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s, i) => (
                <StatCard
                  key={s.id}
                  delay={i * 60}
                  stat={{
                    id: s.id,
                    label: s.label,
                    value: s.value,
                    suffix: s.suffix,
                    prefix: null,
                    description: s.note,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="card flex flex-col items-start justify-between gap-6 p-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  See the strategies for yourself
                </h2>
                <p className="mt-1.5 text-sm text-muted">
                  Compare our structured strategies and model a projection.
                </p>
              </div>
              <ButtonLink href="/strategies" size="lg">
                Explore strategies
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CtaBand
            title="Invest with structure"
            subtitle="Join CopiPilot and put your capital to work with a clear, transparent plan."
            primaryLabel="Create your account"
            primaryUrl="/register"
            secondaryLabel="Talk to us"
            secondaryUrl="/contact"
          />
        </div>
      </div>
    </>
  );
}
