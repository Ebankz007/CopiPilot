"use client";

import * as React from "react";
import { Calculator as CalcIcon, TrendingUp, Wallet, Percent, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { GrowthChart } from "@/components/site/growth-chart";
import { calculateGrowth } from "@/lib/calculator";
import { formatCurrency, formatPercent } from "@/lib/money";
import type { CalculatorSettings } from "@/lib/settings";

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000];

export function InvestmentCalculator({
  settings,
}: {
  settings: CalculatorSettings;
}) {
  const [amount, setAmount] = React.useState(settings.defaultAmount);
  const [months, setMonths] = React.useState(settings.defaultMonths);
  const [rate, setRate] = React.useState(settings.defaultRate);
  const [reinvest, setReinvest] = React.useState(settings.allowCompound);

  const result = React.useMemo(
    () => calculateGrowth({ principal: amount, months, monthlyRate: rate, reinvest }),
    [amount, months, rate, reinvest],
  );

  const summary = [
    { label: "Starting capital", value: formatCurrency(result.principal), icon: Wallet },
    { label: "Estimated profit", value: formatCurrency(result.totalProfit), icon: TrendingUp },
    { label: "Estimated ROI", value: formatPercent(result.roi, 1), icon: Percent },
    { label: "Final balance", value: formatCurrency(result.finalBalance), icon: Coins },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
      {/* Inputs */}
      <div className="card p-6">
        <div className="flex items-center gap-2 text-gold">
          <CalcIcon className="h-5 w-5" />
          <h3 className="font-display text-base font-semibold text-foreground">
            Configure your projection
          </h3>
        </div>

        {/* Amount */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label htmlFor="calc-amount" className="text-sm font-medium text-foreground/90">
              Investment amount
            </label>
            <span className="font-display text-sm font-semibold text-gold">
              {formatCurrency(amount)}
            </span>
          </div>
          <input
            id="calc-amount"
            type="number"
            min={settings.minAmount}
            max={settings.maxAmount}
            value={amount}
            onChange={(e) => {
              const v = Number(e.target.value);
              setAmount(Number.isFinite(v) ? Math.min(Math.max(v, 0), settings.maxAmount) : 0);
            }}
            className="mt-2 h-11 w-full rounded-xl border border-border-strong bg-[#101010] px-3.5 text-sm text-foreground focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20"
          />
          <input
            type="range"
            aria-label="Investment amount slider"
            min={settings.minAmount}
            max={settings.maxAmount}
            step={Math.max(1, Math.round(settings.maxAmount / 500))}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 w-full accent-[#d4af37]"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_AMOUNTS.filter(
              (q) => q >= settings.minAmount && q <= settings.maxAmount,
            ).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q)}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                  amount === q
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {formatCurrency(q)}
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mt-6">
          <label className="text-sm font-medium text-foreground/90">Duration</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {settings.availableMonths.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMonths(m)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors",
                  months === m
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted hover:text-foreground",
                )}
              >
                {m} {m === 1 ? "month" : "months"}
              </button>
            ))}
          </div>
        </div>

        {/* Rate */}
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <label htmlFor="calc-rate" className="text-sm font-medium text-foreground/90">
              Monthly return rate
            </label>
            <span className="font-display text-sm font-semibold text-gold">
              {rate.toFixed(1)}%
            </span>
          </div>
          <input
            id="calc-rate"
            type="range"
            min={settings.minRate}
            max={settings.maxRate}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="mt-3 w-full accent-[#d4af37]"
          />
          <p className="mt-1.5 text-xs text-faint">
            Illustrative rate — not a promise of performance.
          </p>
        </div>

        {/* Compounding */}
        <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-elevated/40 p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Reinvest profits</p>
            <p className="mt-0.5 text-xs text-faint">
              Compound monthly for exponential growth.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={reinvest}
            aria-label="Reinvest profits"
            disabled={!settings.allowCompound && !settings.allowSimple}
            onClick={() => setReinvest((v) => !v)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors",
              reinvest ? "border-gold/50 bg-gold/30" : "border-border-strong bg-elevated",
            )}
          >
            <span
              className={cn(
                "inline-block h-4 w-4 transform rounded-full transition-transform",
                reinvest ? "translate-x-6 bg-gold" : "translate-x-1 bg-muted",
              )}
            />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="card p-6">
        <h3 className="font-display text-base font-semibold text-foreground">
          Your projection
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          {summary.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-elevated/40 p-4">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-faint">
                  <Icon className="h-3.5 w-3.5 text-gold/70" />
                  {s.label}
                </div>
                <p className="mt-1.5 font-display text-xl font-bold text-foreground">
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-elevated/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Growth over time</p>
            <span className="text-xs text-faint">
              {months} {months === 1 ? "month" : "months"}
            </span>
          </div>
          <GrowthChart points={result.schedule} />
        </div>

        <div className="mt-6 rounded-xl border border-gold/20 bg-gold/[0.06] p-4 text-center">
          <p className="text-sm text-muted">Your investment could grow to</p>
          <p className="mt-1 font-display text-3xl font-bold text-gradient-gold">
            {formatCurrency(result.finalBalance)}
          </p>
          <p className="mt-1 text-xs text-muted">
            You could earn{" "}
            <span className="font-semibold text-gold">
              {formatCurrency(result.totalProfit)}
            </span>{" "}
            in estimated profit
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-faint">{settings.disclaimer}</p>
      </div>
    </div>
  );
}
