import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm } from "@/components/dashboard/profile-forms";

export default async function DashboardSettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-foreground">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted">
          Keep your contact details up to date.
        </p>
        <div className="mt-5">
          <ProfileForm
            defaults={{
              fullName: user.fullName,
              phone: user.phone ?? "",
              country: user.country ?? "",
              email: user.email,
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-display text-base font-semibold text-foreground">
          Password
        </h2>
        <p className="mt-1 text-sm text-muted">
          Changing your password signs out every other session.
        </p>
        <div className="mt-5">
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
