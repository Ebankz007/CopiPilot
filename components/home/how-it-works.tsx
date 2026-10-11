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

  // Match the column count to the number of steps so the row stays balanced
  // (a fixed 4-col grid left a 3-step row hugging the left edge).
  const cols =
    steps.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : steps.length === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : steps.length === 2
          ? "sm:grid-cols-2"
          : "";

  return (
    <section id="how-it-works" className="relative py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <div className={`mt-14 grid gap-5 ${cols}`}>
          {steps.map((step, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Reveal key={step.title} delay={i * 80}>
                <div className="card card-hover relative h-full p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-4xl font-bold text-brand/20">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand">
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
