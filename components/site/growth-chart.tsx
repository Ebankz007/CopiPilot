import { cn } from "@/lib/utils";

/**
 * Dependency-free SVG area chart. Pure/serialisable so it renders on the
 * server and streams to the client with no chart library and no hydration cost.
 */
export function GrowthChart({
  points,
  className,
  ariaLabel = "Projected growth chart",
}: {
  points: { month: number; balance: number }[];
  className?: string;
  ariaLabel?: string;
}) {
  const w = 640;
  const h = 240;
  const pad = 10;

  if (points.length < 2) {
    return (
      <div
        className={cn(
          "flex h-48 items-center justify-center rounded-xl border border-border bg-elevated/40 text-sm text-faint",
          className,
        )}
      >
        Enter a duration to see the projection.
      </div>
    );
  }

  const values = points.map((p) => p.balance);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  const stepX = (w - pad * 2) / (points.length - 1);

  const coords = points.map((p, i) => {
    const x = pad + i * stepX;
    const y = h - pad - ((p.balance - min) / span) * (h - pad * 2);
    return [x, y] as const;
  });

  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
  const last = coords[coords.length - 1];
  const first = coords[0];
  const area = `${line} L${last[0].toFixed(1)},${h - pad} L${first[0].toFixed(1)},${h - pad} Z`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={cn("h-auto w-full", className)}
      role="img"
      aria-label={ariaLabel}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="cp-chart-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a8dff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#3a8dff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="cp-chart-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#015bc4" />
          <stop offset="100%" stopColor="#8bbeff" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad}
          x2={w - pad}
          y1={pad + f * (h - pad * 2)}
          y2={pad + f * (h - pad * 2)}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#cp-chart-fill)" />
      <path
        d={line}
        fill="none"
        stroke="url(#cp-chart-line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={last[0]} cy={last[1]} r="4" fill="#8bbeff" />
    </svg>
  );
}
