/**
 * Investment calculator — pure, deterministic, testable.
 *
 * `reinvest: false` → simple interest on the starting principal.
 * `reinvest: true`  → monthly compounding on the running balance.
 *
 * This is an illustrative projection only. It is NOT a promise of returns.
 */

export type CalculatorInput = {
  principal: number;
  months: number;
  /** Monthly rate as a percentage, e.g. 2.5 means 2.5% per month. */
  monthlyRate: number;
  reinvest: boolean;
};

export type GrowthPoint = {
  month: number;
  balance: number;
  profit: number;
};

export type CalculatorResult = {
  principal: number;
  months: number;
  monthlyRate: number;
  reinvest: boolean;
  schedule: GrowthPoint[];
  finalBalance: number;
  totalProfit: number;
  roi: number;
};

function clampNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateGrowth(input: CalculatorInput): CalculatorResult {
  const principal = clampNonNegative(input.principal);
  const months = Math.max(0, Math.min(Math.floor(input.months) || 0, 600));
  const monthlyRate = Number.isFinite(input.monthlyRate)
    ? Math.max(0, Math.min(input.monthlyRate, 1000))
    : 0;
  const reinvest = Boolean(input.reinvest);

  const schedule: GrowthPoint[] = [{ month: 0, balance: principal, profit: 0 }];
  let cumulativeProfit = 0;

  for (let month = 1; month <= months; month += 1) {
    const base = reinvest ? principal + cumulativeProfit : principal;
    const interest = base * (monthlyRate / 100);
    cumulativeProfit += interest;
    schedule.push({
      month,
      balance: principal + cumulativeProfit,
      profit: cumulativeProfit,
    });
  }

  const finalBalance = principal + cumulativeProfit;
  const roi = principal > 0 ? (cumulativeProfit / principal) * 100 : 0;

  return {
    principal,
    months,
    monthlyRate,
    reinvest,
    schedule,
    finalBalance,
    totalProfit: cumulativeProfit,
    roi,
  };
}
