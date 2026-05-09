import SwitchTheme from "@/components/switch-theme";
import { PublicRoute } from "@/components/auth/public-route";
import type { ReactNode } from "react";
import Image from "next/image";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <PublicRoute>
      <main className="flex flex-col items-center justify-center px-4 bg-sidebar">
        <div className="min-h-screen w-full max-w-md rounded-xl shadow-lg px-6 py-3 transition-colors bg-background">
          <div className="sticky top-0 mb-2 backdrop-blur-xs bg-background/30 z-50">
            <SwitchTheme />
          </div>
          <header className="mb-6 flex flex-col items-center text-center gap-2">
            <Image
              src="/branding/logo-light.png"
              alt="Auth System"
              width={100}
              height={100}
              loading="eager"
              className="block dark:hidden"
            />
            <Image
              src="/branding/logo-dark.png"
              alt="Auth System"
              width={100}
              height={100}
              loading="eager"
              className="hidden dark:block"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Auth System
            </h1>
          </header>
          {children}
        </div>
      </main>
    </PublicRoute>
  );
}
