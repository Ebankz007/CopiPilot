import { cn } from "@/lib/utils";

/**
 * CopiPilot mark — a brand navigation/autopilot chevron rising inside a
 * rounded tile. Original artwork; no third-party assets.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
      role="img"
    >
      <defs>
        <linearGradient id="cp-brand" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8bbeff" />
          <stop offset="50%" stopColor="#3a8dff" />
          <stop offset="100%" stopColor="#015bc4" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="11"
        fill="#050b16"
        stroke="url(#cp-brand)"
        strokeWidth="1.5"
      />
      {/* Autopilot chevron (paper-plane nose) */}
      <path
        d="M20 9 L30 24 L20 20 L10 24 Z"
        fill="url(#cp-brand)"
      />
      {/* Rising baseline */}
      <path
        d="M11 29 H29"
        stroke="url(#cp-brand)"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
  siteName = "CopiPilot",
}: {
  className?: string;
  showWordmark?: boolean;
  siteName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWordmark && (
        <span className="font-display text-lg font-bold tracking-tight text-foreground">
          {siteName}
          <span className="text-brand">.</span>
        </span>
      )}
    </span>
  );
}
