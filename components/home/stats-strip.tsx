import { Counter } from "@/components/site/counter";
import { Reveal } from "@/components/site/reveal";
import { cn } from "@/lib/utils";

export type StatData = {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  note: string | null;
};

function parseNumeric(value: string): { num: number | null; decimals: number } {
  const cleaned = value.replace(/[^0-9.\-]/g, "");
  const num = Number(cleaned);
  if (!cleaned || Number.isNaN(num)) return { num: null, decimals: 0 };
  const decimals = cleaned.includes(".") ? cleaned.split(".")[1]!.length : 0;
  return { num, decimals };
}

export function StatsStrip({ stats }: { stats: StatData[] }) {
  if (stats.length === 0) return null;

  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
        {stats.slice(0, 4).map((stat, i) => {
          const { num, decimals } = parseNumeric(stat.value);
          return (
            <Reveal
              key={stat.id}
              delay={i * 70}
              className={cn(
                "px-2 py-8 text-center sm:py-10",
                i < 3 && "lg:border-r lg:border-border",
              )}
            >
              <p className="font-display text-3xl font-bold text-gradient-brand sm:text-4xl">
                {num !== null ? (
                  <Counter value={num} decimals={decimals} suffix={stat.suffix ?? ""} />
                ) : (
                  `${stat.value}${stat.suffix ?? ""}`
                )}
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
              {stat.note && <p className="mt-1 text-xs text-faint">{stat.note}</p>}
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
