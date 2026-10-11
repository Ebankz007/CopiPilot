/** Currency and number formatting helpers (display only). */

export function formatCurrency(
  value: number | null | undefined,
  currency = "USD",
  options: { decimals?: number } = {},
): string {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  const decimals = options.decimals ?? (Number.isInteger(amount) ? 0 : 2);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(decimals)}`;
  }
}

/** Compact display: 12,500 → "$12.5K". */
export function formatCompactCurrency(value: number, currency = "USD"): string {
  const symbol = currency === "USD" ? "$" : `${currency} `;
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`;
  return `${symbol}${value.toFixed(0)}`;
}

export function formatNumber(value: number, decimals = 0): string {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 2,
): string {
  const n = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${n.toFixed(decimals)}%`;
}
