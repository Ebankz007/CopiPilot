import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { ButtonLink } from "@/components/ui/button";

export function FinalCta({
  title,
  subtitle,
  ctaLabel,
  ctaUrl,
}: {
  title: string;
  subtitle?: string | null;
  ctaLabel: string;
  ctaUrl: string;
}) {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-gold/25 bg-[radial-gradient(ellipse_at_top_left,rgba(212,175,55,0.18),transparent_55%)] p-10 text-center sm:p-16">
            <div
              className="pointer-events-none absolute inset-0 grid-lines opacity-30"
              aria-hidden="true"
            />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-4 text-base leading-relaxed text-muted">{subtitle}</p>
              )}
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <ButtonLink href={ctaUrl} size="lg">
                  {ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </ButtonLink>
                <ButtonLink href="/contact" variant="secondary" size="lg">
                  Talk to us
                </ButtonLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
