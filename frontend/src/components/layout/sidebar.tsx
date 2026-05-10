"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import { useLogout } from "@/hooks/auth/useLogout";
import { cn } from "@/lib/utils";
import { LuUser, LuMonitor, LuSettings, LuLogOut } from "react-icons/lu";
import Image from "next/image";
import { Button } from "../ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LuMonitor },
  { name: "Profile", href: "/profile", icon: LuUser },
  { name: "Sessions", href: "/sessions", icon: LuMonitor },
  { name: "Settings", href: "/settings", icon: LuSettings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUserStore();
  const { logout, isPending } = useLogout();

  return (
    <aside className="flex h-full w-64 flex-col bg-card border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="relative h-8 w-8">
            <Image
              src="/branding/logo-light.png"
              alt="Auth System"
              fill
              className="block dark:hidden object-contain"
            />
            <Image
              src="/branding/logo-dark.png"
              alt="Auth System"
              fill
              className="hidden dark:block object-contain"
            />
          </div>
          <span className="text-lg font-semibold">Auth System</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      {user && (
        <div className="border-t p-4">
          <div className="mb-3 flex items-center space-x-3">
            {user.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || user.email}
                className="h-10 w-10 rounded-full object-cover"
                width={40}
                height={40}
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user.name?.[0] || user.email?.[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => logout()}
            disabled={isPending}
            className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 cursor-pointer"
          >
            <LuLogOut className="h-4 w-4" />
            <span>{isPending ? "Logging out..." : "Logout"}</span>
          </Button>
        </div>
      )}
    </aside>
  );
}
