import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink } from "@/components/ui/button";
import { StrategyCard, type StrategyCardData } from "@/components/site/strategy-card";

export function StrategiesSection({
  eyebrow,
  title,
  subtitle,
  strategies,
  showAllLink = true,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  strategies: StrategyCardData[];
  showAllLink?: boolean;
}) {
  if (strategies.length === 0) return null;

  return (
    <section id="strategies" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((s, i) => (
            <Reveal key={s.id} delay={i * 70}>
              <StrategyCard strategy={s} />
            </Reveal>
          ))}
        </div>

        {showAllLink && (
          <Reveal delay={120}>
            <div className="mt-12 text-center">
              <ButtonLink href="/strategies" variant="secondary" size="lg">
                Compare all strategies
              </ButtonLink>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
