import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/site/section-heading";
import { Reveal } from "@/components/site/reveal";

export function TestimonialsSection({
  items,
}: {
  items: { id: string; name: string; role: string | null; company: string | null; quote: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Client voices"
          title="Trusted by modern investors"
          subtitle="Illustrative feedback from people using the CopiPilot approach."
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t.id} delay={i * 70}>
              <figure className="card h-full p-6">
                <Quote className="h-6 w-6 text-gold/50" />
                <blockquote className="mt-4 text-sm leading-relaxed text-muted">
                  {t.quote}
                </blockquote>
                <figcaption className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-xs text-faint">
                    {[t.role, t.company].filter(Boolean).join(" · ")}
                  </p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
