import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Select, Textarea } from "@/components/ui/field";
import { DangerButton } from "@/components/admin/danger-button";
import { Badge } from "@/components/ui/badge";
import {
  deleteStrategyAction,
  saveStrategyAction,
} from "@/app/admin/actions/catalog";

const RISK = ["LOW", "MEDIUM", "HIGH"] as const;
const STATUS = ["ACTIVE", "INACTIVE", "COMING_SOON"] as const;

function StrategyFields({
  defaults,
}: {
  defaults?: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    minInvestment: number;
    maxInvestment: number | null;
    targetReturn: number | null;
    returnPeriod: string | null;
    durationMonths: number | null;
    riskLevel: string;
    strategyType: string;
    profitFactor: number | null;
    maxDrawdown: number | null;
    status: string;
    isFeatured: boolean;
    icon: string | null;
    imageUrl: string | null;
    ctaLabel: string;
    ctaUrl: string | null;
    terms: string | null;
    order: number;
  };
}) {
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label>Name</Label>
          <Input name="name" defaultValue={defaults?.name} required />
        </div>
        <div>
          <Label>Slug</Label>
          <Input name="slug" defaultValue={defaults?.slug} placeholder="growth-momentum" required />
        </div>
      </div>
      <div>
        <Label>Short description</Label>
        <Input name="shortDescription" defaultValue={defaults?.shortDescription} required />
      </div>
      <div>
        <Label>Full description</Label>
        <Textarea name="description" rows={5} defaultValue={defaults?.description} required />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label>Min investment</Label>
          <Input
            name="minInvestment"
            type="number"
            step="0.01"
            defaultValue={defaults?.minInvestment ?? 100}
            required
          />
        </div>
        <div>
          <Label>Max investment</Label>
          <Input
            name="maxInvestment"
            type="number"
            step="0.01"
            defaultValue={defaults?.maxInvestment ?? ""}
          />
        </div>
        <div>
          <Label>Target return (% p.a.)</Label>
          <Input
            name="targetReturn"
            type="number"
            step="0.1"
            defaultValue={defaults?.targetReturn ?? ""}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <Label>Return period</Label>
          <Input name="returnPeriod" defaultValue={defaults?.returnPeriod ?? "monthly"} />
        </div>
        <div>
          <Label>Duration (months)</Label>
          <Input
            name="durationMonths"
            type="number"
            defaultValue={defaults?.durationMonths ?? ""}
          />
        </div>
        <div>
          <Label>Risk level</Label>
          <Select name="riskLevel" defaultValue={defaults?.riskLevel ?? "MEDIUM"}>
            {RISK.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select name="status" defaultValue={defaults?.status ?? "ACTIVE"}>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-4">
        <div>
          <Label>Type</Label>
          <Input name="strategyType" defaultValue={defaults?.strategyType ?? "Automated"} />
        </div>
        <div>
          <Label>Profit factor</Label>
          <Input
            name="profitFactor"
            type="number"
            step="0.01"
            defaultValue={defaults?.profitFactor ?? ""}
          />
        </div>
        <div>
          <Label>Max drawdown (%)</Label>
          <Input
            name="maxDrawdown"
            type="number"
            step="0.1"
            defaultValue={defaults?.maxDrawdown ?? ""}
          />
        </div>
        <div>
          <Label>Order</Label>
          <Input name="order" type="number" defaultValue={defaults?.order ?? 0} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <Label>CTA label</Label>
          <Input name="ctaLabel" defaultValue={defaults?.ctaLabel ?? "Get started"} />
        </div>
        <div>
          <Label>CTA URL</Label>
          <Input name="ctaUrl" defaultValue={defaults?.ctaUrl ?? "/register"} />
        </div>
        <div>
          <Label>Icon</Label>
          <Input name="icon" defaultValue={defaults?.icon ?? ""} placeholder="trending-up" />
        </div>
      </div>
      <div>
        <Label>Image URL</Label>
        <Input name="imageUrl" defaultValue={defaults?.imageUrl ?? ""} />
      </div>
      <div>
        <Label>Terms &amp; risk notes</Label>
        <Textarea name="terms" rows={3} defaultValue={defaults?.terms ?? ""} />
      </div>
      <Checkbox name="isFeatured" defaultChecked={defaults?.isFeatured} label="Featured" />
    </>
  );
}

export default async function AdminStrategiesPage() {
  await requirePermission("strategies");
  const strategies = await prisma.strategy.findMany({ orderBy: { order: "asc" } });

  return (
    <>
      <AdminHeader
        title="Strategies"
        description="Investment strategies shown across the site. Target returns are illustrative — keep the risk notes honest."
      />

      <div className="mb-8 rounded-2xl border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-base font-semibold text-foreground">
          Add strategy
        </h2>
        <ActionForm action={saveStrategyAction} submitLabel="Create strategy">
          <StrategyFields defaults={undefined} />
        </ActionForm>
      </div>

      <div className="space-y-3">
        {strategies.map((s) => (
          <details key={s.id} className="rounded-2xl border border-border bg-card">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                <p className="truncate text-xs text-faint">
                  /{s.slug} · min ${s.minInvestment.toLocaleString()}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge tone={s.status === "ACTIVE" ? "success" : "neutral"}>
                  {s.status.replace("_", " ")}
                </Badge>
                {s.isFeatured && <Badge tone="gold">Featured</Badge>}
              </div>
            </summary>
            <div className="border-t border-border p-5">
              <ActionForm action={saveStrategyAction} submitLabel="Save strategy">
                <input type="hidden" name="id" value={s.id} />
                <StrategyFields
                  defaults={{
                    name: s.name,
                    slug: s.slug,
                    shortDescription: s.shortDescription,
                    description: s.description,
                    minInvestment: s.minInvestment,
                    maxInvestment: s.maxInvestment,
                    targetReturn: s.targetReturn,
                    returnPeriod: s.returnPeriod,
                    durationMonths: s.durationMonths,
                    riskLevel: s.riskLevel,
                    strategyType: s.strategyType,
                    profitFactor: s.profitFactor,
                    maxDrawdown: s.maxDrawdown,
                    status: s.status,
                    isFeatured: s.isFeatured,
                    icon: s.icon,
                    imageUrl: s.imageUrl,
                    ctaLabel: s.ctaLabel,
                    ctaUrl: s.ctaUrl,
                    terms: s.terms,
                    order: s.order,
                  }}
                />
              </ActionForm>
              <form action={deleteStrategyAction} className="mt-3">
                <input type="hidden" name="id" value={s.id} />
                <DangerButton message={`Delete strategy “${s.name}”?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
