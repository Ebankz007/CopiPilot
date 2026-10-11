import { Target, Eye, ShieldCheck, Cpu, Headphones, Scale } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { SectionHeading } from "@/components/site/section-heading";

const VALUES = [
  { icon: Scale, title: "Transparency", body: "Every figure on this site is editable and clearly labelled. No hidden numbers." },
  { icon: ShieldCheck, title: "Risk management", body: "Capital preservation comes first; projections are estimates, never guarantees." },
  { icon: Cpu, title: "Technology", body: "A modern platform built on a secure, auditable, role-based architecture." },
  { icon: Headphones, title: "Support", body: "Responsive client support and a clear onboarding path for every investor." },
];

export function AboutSection({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string | null;
  title: string;
  subtitle?: string | null;
}) {
  return (
    <section id="about" className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} align="left" />

            <Reveal delay={120}>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-brand">
                    <Target className="h-4 w-4" />
                    <h3 className="text-sm font-semibold text-foreground">Our mission</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    To give investors clear, structured access to professionally managed
                    investment strategies — with technology that keeps every number visible.
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-center gap-2 text-brand">
                    <Eye className="h-4 w-4" />
                    <h3 className="text-sm font-semibold text-foreground">Our vision</h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A modern financial platform where strategy, technology, and transparency
                    work together to build long-term value.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={160}>
            <div className="grid gap-4 sm:grid-cols-2">
              {VALUES.map((v) => {
                const Icon = v.icon;
                return (
                  <div key={v.title} className="card p-5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand/25 bg-brand/10 text-brand">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 font-display text-sm font-semibold text-foreground">
                      {v.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
