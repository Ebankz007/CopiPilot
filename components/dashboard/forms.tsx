"use client";

import * as React from "react";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Select } from "@/components/ui/field";
import { formatCurrency, formatPercent } from "@/lib/money";
import {
  requestDepositAction,
  requestWithdrawalAction,
  requestInvestmentAction,
} from "@/app/(public)/dashboard/actions";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer",
  CARD: "Card",
  CRYPTO: "Crypto",
  WALLET: "Wallet",
  OTHER: "Other",
};

export function DepositRequestForm({ available }: { available: number }) {
  return (
    <ActionForm action={requestDepositAction} submitLabel="Request deposit">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="deposit-amount">Amount (USD)</Label>
          <Input
            id="deposit-amount"
            name="amount"
            type="number"
            min={1}
            step="0.01"
            required
            placeholder="1000"
          />
        </div>
        <div>
          <Label htmlFor="deposit-method">Method</Label>
          <Select id="deposit-method" name="method" defaultValue="BANK_TRANSFER">
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="deposit-reference">Reference (optional)</Label>
        <Input id="deposit-reference" name="reference" placeholder="Payment reference or tx hash" />
      </div>
      <p className="text-xs text-faint">
        Deposits are reviewed by our team before funds are credited. Current available
        balance: <span className="text-muted">{formatCurrency(available)}</span>.
      </p>
    </ActionForm>
  );
}

export function WithdrawalRequestForm({ available }: { available: number }) {
  return (
    <ActionForm action={requestWithdrawalAction} submitLabel="Request withdrawal">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="withdraw-amount">Amount (USD)</Label>
          <Input
            id="withdraw-amount"
            name="amount"
            type="number"
            min={1}
            step="0.01"
            max={available > 0 ? available : undefined}
            required
            placeholder="500"
          />
        </div>
        <div>
          <Label htmlFor="withdraw-method">Method</Label>
          <Select id="withdraw-method" name="method" defaultValue="BANK_TRANSFER">
            {Object.entries(METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="withdraw-destination">Payout details</Label>
        <Input
          id="withdraw-destination"
          name="destination"
          required
          placeholder="Bank account or wallet address"
        />
      </div>
      <p className="text-xs text-faint">
        Available to withdraw: <span className="text-muted">{formatCurrency(available)}</span>.
      </p>
    </ActionForm>
  );
}

export function InvestForm({
  strategies,
  available,
  preselectId,
}: {
  strategies: {
    id: string;
    name: string;
    minInvestment: number;
    maxInvestment: number | null;
    targetReturn: number | null;
    returnPeriod: string | null;
    riskLevel: string;
  }[];
  available: number;
  preselectId?: string;
}) {
  const [strategyId, setStrategyId] = React.useState(
    preselectId ?? strategies[0]?.id ?? "",
  );
  const selected = strategies.find((s) => s.id === strategyId) ?? strategies[0];

  return (
    <ActionForm action={requestInvestmentAction} submitLabel="Submit investment request">
      <div>
        <Label htmlFor="invest-strategy">Strategy</Label>
        <Select
          id="invest-strategy"
          name="strategyId"
          value={strategyId}
          onChange={(e) => setStrategyId(e.target.value)}
          required
        >
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} · min {formatCurrency(s.minInvestment)}
            </option>
          ))}
        </Select>
      </div>

      {selected && (
        <div className="grid grid-cols-3 gap-3 rounded-xl border border-border bg-elevated/40 p-4 text-center text-xs">
          <div>
            <p className="uppercase tracking-wide text-faint">Min</p>
            <p className="mt-1 font-semibold text-foreground">
              {formatCurrency(selected.minInvestment)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-faint">Target</p>
            <p className="mt-1 font-semibold text-brand">
              {selected.targetReturn != null
                ? `${formatPercent(selected.targetReturn, 1)} ${selected.returnPeriod ?? ""}`.trim()
                : "—"}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide text-faint">Risk</p>
            <p className="mt-1 font-semibold text-foreground">{selected.riskLevel}</p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="invest-amount">Amount (USD)</Label>
        <Input
          id="invest-amount"
          name="amount"
          type="number"
          min={selected?.minInvestment ?? 1}
          max={selected?.maxInvestment ?? undefined}
          step="0.01"
          required
          placeholder={String(selected?.minInvestment ?? 100)}
        />
        <p className="mt-1.5 text-xs text-faint">
          Available to invest: <span className="text-muted">{formatCurrency(available)}</span>.
        </p>
      </div>
    </ActionForm>
  );
}
