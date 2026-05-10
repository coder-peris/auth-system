"use client";

import { VerificationBanner } from "@/components/layout/verification-banner";
import { useUserStore } from "@/store/user.store";
import Link from "next/link";
import {
  LuCircleAlert,
  LuCircleCheck,
  LuMonitor,
  LuSettings,
  LuShield,
  LuUser,
} from "react-icons/lu";

const quickLinks = [
  {
    name: "Profile",
    href: "/profile",
    icon: LuUser,
    description: "View your account details",
  },
  {
    name: "Sessions",
    href: "/sessions",
    icon: LuMonitor,
    description: "Manage active sessions",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: LuSettings,
    description: "Change password, email, 2FA",
  },
];

export default function Dashboard() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="space-y-6">
      {!user.isVerified && <VerificationBanner />}

      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {user.name || user.email}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s an overview of your account.
        </p>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Role</p>
          <div className="flex items-center gap-2">
            <LuShield className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium capitalize">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Email Verified</p>
          <div className="flex items-center gap-2">
            {user.isVerified ? (
              <>
                <LuCircleCheck className="h-4 w-4 text-green-500" />
                <p className="text-sm font-medium">Verified</p>
              </>
            ) : (
              <>
                <LuCircleAlert className="h-4 w-4 text-yellow-500" />
                <p className="text-sm font-medium">Not Verified</p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground">Two-Factor Auth</p>
          <div className="flex items-center gap-2">
            <LuShield className="h-4 w-4 text-primary" />
            <p className="text-sm font-medium capitalize">
              {user.twoFactorMethod === "NONE"
                ? "Disabled"
                : user.twoFactorMethod}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">
          QUICK ACCESS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="rounded-lg border bg-card p-4 hover:bg-accent transition-colors space-y-2"
            >
              <div className="flex items-center gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium">{link.name}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs text-muted-foreground">Member since</p>
        <p className="text-sm font-medium mt-1">
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
