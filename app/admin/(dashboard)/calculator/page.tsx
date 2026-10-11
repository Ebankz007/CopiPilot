import { requirePermission } from "@/lib/auth";
import { getCalculatorSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/field";
import { saveCalculatorSettingsAction } from "@/app/admin/actions/catalog";

export default async function AdminCalculatorPage() {
  await requirePermission("calculator");
  const settings = await getCalculatorSettings();

  return (
    <>
      <AdminHeader
        title="Calculator settings"
        description="Controls the public investment calculator: amount and rate bounds, selectable terms, and the compounding options."
      />

      <div className="rounded-2xl border border-border bg-card p-6">
        <ActionForm action={saveCalculatorSettingsAction} submitLabel="Save settings">
          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Default amount</Label>
              <Input
                name="defaultAmount"
                type="number"
                step="0.01"
                defaultValue={settings.defaultAmount}
              />
            </div>
            <div>
              <Label>Min amount</Label>
              <Input
                name="minAmount"
                type="number"
                step="0.01"
                defaultValue={settings.minAmount}
              />
            </div>
            <div>
              <Label>Max amount</Label>
              <Input
                name="maxAmount"
                type="number"
                step="0.01"
                defaultValue={settings.maxAmount}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-4">
            <div>
              <Label>Default months</Label>
              <Input
                name="defaultMonths"
                type="number"
                defaultValue={settings.defaultMonths}
              />
            </div>
            <div>
              <Label>Default rate (% / month)</Label>
              <Input
                name="defaultRate"
                type="number"
                step="0.1"
                defaultValue={settings.defaultRate}
              />
            </div>
            <div>
              <Label>Min rate</Label>
              <Input
                name="minRate"
                type="number"
                step="0.1"
                defaultValue={settings.minRate}
              />
            </div>
            <div>
              <Label>Max rate</Label>
              <Input
                name="maxRate"
                type="number"
                step="0.1"
                defaultValue={settings.maxRate}
              />
            </div>
          </div>

          <div>
            <Label>Available terms (months, comma-separated)</Label>
            <Input
              name="availableMonths"
              defaultValue={settings.availableMonths.join(", ")}
              placeholder="1, 3, 6, 12, 24, 36"
            />
          </div>

          <div>
            <Label>Disclaimer</Label>
            <Textarea name="disclaimer" rows={3} defaultValue={settings.disclaimer} />
          </div>

          <div className="flex flex-wrap gap-6">
            <Checkbox
              name="allowCompound"
              defaultChecked={settings.allowCompound}
              label="Allow compounding"
            />
            <Checkbox
              name="allowSimple"
              defaultChecked={settings.allowSimple}
              label="Allow simple interest"
            />
          </div>
        </ActionForm>
      </div>

      <p className="mt-4 text-xs text-faint">
        These figures drive illustrative projections only. They are never a promise of
        returns.
      </p>
    </>
  );
}
