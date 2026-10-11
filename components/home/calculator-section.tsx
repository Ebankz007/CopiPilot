import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { InvestmentCalculator } from "@/components/calculator/calculator";
import type { CalculatorSettings } from "@/lib/settings";

export function CalculatorSection({
  eyebrow,
  title,
  subtitle,
  settings,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  settings: CalculatorSettings;
}) {
  return (
    <section id="calculator" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Reveal className="mt-14">
          <InvestmentCalculator settings={settings} />
        </Reveal>
      </div>
    </section>
  );
}
