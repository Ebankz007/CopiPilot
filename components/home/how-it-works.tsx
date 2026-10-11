import { UserPlus, LineChart, Wallet, BarChart3 } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

export type StepItem = { title: string; body: string };

const ICONS = [UserPlus, LineChart, Wallet, BarChart3];

export function HowItWorks({
  eyebrow,
  title,
  subtitle,
  steps,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  steps: StepItem[];
}) {
  if (steps.length === 0) return null;

  return (
    <section id="how-it-works" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={step.title} delay={i * 80}>
                <div className="card card-hover relative h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold text-gold/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-base font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
