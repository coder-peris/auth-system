"use client";

import { useUserStore } from "@/store/user.store";
import { ChangePasswordForm } from "./change-password-form";
import { ChangeEmailForm } from "./change-email-form";
import { Configure2FAForm } from "./configure-2fa-form";

export default function SettingsPage() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and security preferences.
        </p>
      </div>

      <div className="grid gap-8">
        <ChangePasswordForm />
        <ChangeEmailForm />
        <Configure2FAForm />
      </div>
    </div>
  );
}
