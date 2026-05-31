"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/user.store";
import { Loader2 } from "lucide-react";

function RootPageContent() {
  const { user, isLoading } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Handle OAuth callback CSRF token
    const csrfToken = searchParams.get("csrfToken");
    if (csrfToken) {
      localStorage.setItem("csrf_token", csrfToken);
      // Remove token from URL to prevent exposure in browser history and server logs
      window.history.replaceState({}, "", window.location.pathname);
    }

    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [user, isLoading, router, searchParams]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return null;
}

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <RootPageContent />
    </Suspense>
  );
}
