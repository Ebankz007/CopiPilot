"use client";

import { ActionForm } from "@/components/ui/action-form";
import { Input, Label } from "@/components/ui/field";
import {
  updateProfileAction,
  changePasswordAction,
} from "@/app/(public)/dashboard/actions";

export function ProfileForm({
  defaults,
}: {
  defaults: { fullName: string; phone: string; country: string; email: string };
}) {
  return (
    <ActionForm action={updateProfileAction} submitLabel="Save profile">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            name="fullName"
            defaultValue={defaults.fullName}
            required
          />
        </div>
        <div>
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={defaults.email} disabled readOnly />
          <p className="mt-1.5 text-xs text-faint">
            Contact support to change your email.
          </p>
        </div>
        <div>
          <Label htmlFor="profile-phone">Phone</Label>
          <Input id="profile-phone" name="phone" defaultValue={defaults.phone} />
        </div>
        <div>
          <Label htmlFor="profile-country">Country</Label>
          <Input id="profile-country" name="country" defaultValue={defaults.country} />
        </div>
      </div>
    </ActionForm>
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={changePasswordAction} submitLabel="Update password">
      <div>
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <div>
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="mt-1.5 text-xs text-faint">At least 8 characters.</p>
      </div>
    </ActionForm>
  );
}
