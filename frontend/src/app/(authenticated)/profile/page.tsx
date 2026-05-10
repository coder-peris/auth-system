"use client";

import { useUserStore } from "@/store/user.store";
import { LuUser, LuMail, LuShield, LuCalendar } from "react-icons/lu";
import Image from "next/image";

export default function ProfilePage() {
  const { user } = useUserStore();

  if (!user) return null;

  const profileFields = [
    {
      label: "User ID",
      value: user.id,
      icon: LuUser,
    },
    {
      label: "Name",
      value: user.name || "Not set",
      icon: LuUser,
    },
    {
      label: "Email",
      value: user.email,
      icon: LuMail,
    },
    {
      label: "Role",
      value: user.role,
      icon: LuShield,
    },
    {
      label: "Verification Status",
      value: user.isVerified ? "Verified" : "Unverified",
      icon: LuShield,
    },
    {
      label: "2FA Method",
      value: user.twoFactorMethod === "NONE" ? "None" : user.twoFactorMethod,
      icon: LuShield,
    },
    {
      label: "Member Since",
      value: new Date(user.createdAt).toLocaleDateString(),
      icon: LuCalendar,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>

      <div className="rounded-lg border bg-card">
        {/* Avatar Section */}
        <div className="border-b p-6">
          <div className="flex items-center space-x-4">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || user.email}
                className="h-20 w-20 rounded-full object-cover"
                width={80}
                height={80}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {user.name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {user.name || "No name set"}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Profile Information</h3>
          <div className="space-y-4">
            {profileFields.map((field) => (
              <div key={field.label} className="flex items-center space-x-3">
                <field.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{field.label}</p>
                  <p className="text-sm text-muted-foreground">{field.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted-foreground">
              To edit your profile information, visit the{" "}
              <a href="/settings" className="text-primary hover:underline">
                Settings
              </a>{" "}
              page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
