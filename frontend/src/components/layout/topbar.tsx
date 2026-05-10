"use client";

import { useUserStore } from "@/store/user.store";
import Image from "next/image";
import SwitchTheme from "@/components/switch-theme";
import { useState, useRef, useEffect } from "react";
import { useLogout } from "@/hooks/auth/useLogout";
import { LuLogOut } from "react-icons/lu";

export function Topbar() {
  const { user } = useUserStore();
  const { logout, isPending } = useLogout();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="text-lg font-semibold">
        {/* Page title will be handled by individual pages */}
      </div>

      <div className="flex items-center space-x-4">
        <SwitchTheme />

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className={`rounded-full cursor-pointer transition-all ${
              showDropdown ? "ring-2 ring-ring/30 ring-offset-1" : ""
            }`}
          >
            {user?.avatarUrl ? (
              <Image
                src={user.avatarUrl}
                alt={user.name || user.email}
                className="h-8 w-8 rounded-full object-cover"
                width={32}
                height={32}
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                {user?.name?.[0] || user?.email?.[0]?.toUpperCase()}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border bg-background shadow-lg">
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                disabled={isPending}
                className="flex w-full items-center space-x-2 px-4 py-2 text-sm text-left text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 cursor-pointer"
              >
                <LuLogOut className="h-4 w-4" />
                <span>{isPending ? "Logging out..." : "Logout"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
