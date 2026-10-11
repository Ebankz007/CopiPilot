import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";
import { Accordion } from "@/components/ui/accordion";
import { ButtonLink } from "@/components/ui/button";

export function FaqSection({
  eyebrow,
  title,
  subtitle,
  items,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
  items: { id: string; question: string; answer: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section id="faq" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />
            <Reveal delay={140}>
              <div className="mt-6">
                <ButtonLink href="/contact" variant="secondary">
                  Still have questions? Contact us
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <Accordion items={items} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
