import { Counter } from "./counter";
import { Reveal } from "./reveal";

export type StatData = {
  id: string;
  label: string;
  value: string;
  suffix: string | null;
  prefix: string | null;
  description: string | null;
};

function parseValue(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const num = Number.parseFloat(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function StatCard({ stat, delay = 0 }: { stat: StatData; delay?: number }) {
  const numeric = parseValue(stat.value);
  const decimals = stat.value.includes(".") ? 2 : 0;

  return (
    <Reveal
      delay={delay}
      className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-brand/30"
    >
      <div className="font-display text-3xl font-bold tracking-tight text-brand sm:text-4xl">
        {numeric !== null ? (
          <Counter
            value={numeric}
            prefix={stat.prefix ?? ""}
            suffix={stat.suffix ?? ""}
            decimals={decimals}
          />
        ) : (
          <>
            {stat.prefix}
            {stat.value}
            {stat.suffix}
          </>
        )}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
      {stat.description && (
        <p className="mt-1 text-xs leading-relaxed text-faint">
          {stat.description}
        </p>
      )}
    </Reveal>
  );
}
