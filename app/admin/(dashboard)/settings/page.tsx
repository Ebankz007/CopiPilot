import { requirePermission } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { AdminHeader } from "@/components/admin/admin-header";
import { ActionForm } from "@/components/ui/action-form";
import { Input, Label, Textarea } from "@/components/ui/field";
import { updateSettingsAction } from "@/app/admin/actions/content";

export default async function AdminSettingsPage() {
  await requirePermission("settings");
  const s = await getSiteSettings();

  return (
    <>
      <AdminHeader
        title="Settings"
        description="Global site identity, contact details, SEO defaults, and the risk notice shown in the footer."
      />

      <div className="max-w-3xl rounded-2xl border border-border bg-card p-6">
        <ActionForm action={updateSettingsAction} submitLabel="Save settings">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Site name</Label>
              <Input name="siteName" defaultValue={s.siteName} required />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input name="tagline" defaultValue={s.tagline} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Logo URL</Label>
              <Input name="logoUrl" defaultValue={s.logoUrl} />
            </div>
            <div>
              <Label>Favicon URL</Label>
              <Input name="faviconUrl" defaultValue={s.faviconUrl} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <Label>Contact email</Label>
              <Input name="contactEmail" defaultValue={s.contactEmail} />
            </div>
            <div>
              <Label>Contact phone</Label>
              <Input name="contactPhone" defaultValue={s.contactPhone} />
            </div>
            <div>
              <Label>Primary color</Label>
              <Input name="primaryColor" defaultValue={s.primaryColor} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Telegram URL</Label>
              <Input name="telegram" defaultValue={s.telegram} />
            </div>
            <div>
              <Label>WhatsApp URL</Label>
              <Input name="whatsapp" defaultValue={s.whatsapp} />
            </div>
          </div>

          <fieldset className="rounded-xl border border-border p-4">
            <legend className="px-2 text-xs font-semibold uppercase tracking-wider text-faint">
              Social links
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label>X (Twitter)</Label>
                <Input name="socials_x" defaultValue={s.socials.x ?? ""} />
              </div>
              <div>
                <Label>LinkedIn</Label>
                <Input name="socials_linkedin" defaultValue={s.socials.linkedin ?? ""} />
              </div>
              <div>
                <Label>YouTube</Label>
                <Input name="socials_youtube" defaultValue={s.socials.youtube ?? ""} />
              </div>
              <div>
                <Label>Instagram</Label>
                <Input name="socials_instagram" defaultValue={s.socials.instagram ?? ""} />
              </div>
            </div>
          </fieldset>

          <div>
            <Label>Footer text</Label>
            <Textarea name="footerText" rows={2} defaultValue={s.footerText} />
          </div>

          <div>
            <Label>Copyright</Label>
            <Input name="copyright" defaultValue={s.copyright} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <Label>Default SEO title</Label>
              <Input name="defaultSeoTitle" defaultValue={s.defaultSeoTitle} />
            </div>
            <div>
              <Label>Google Analytics ID</Label>
              <Input name="gaId" defaultValue={s.gaId} placeholder="G-XXXXXXX" />
            </div>
          </div>

          <div>
            <Label>Default SEO description</Label>
            <Textarea name="defaultSeoDescription" rows={2} defaultValue={s.defaultSeoDescription} />
          </div>

          <div>
            <Label>Risk notice (footer)</Label>
            <Textarea name="riskNotice" rows={3} defaultValue={s.riskNotice} />
          </div>
        </ActionForm>
      </div>
    </>
  );
}
