"use client";

import Link from "next/link";
import { LuMail, LuX, LuLoader } from "react-icons/lu";
import { useState } from "react";
import { useVerification } from "@/hooks/auth/useVerification";
import { useUserStore } from "@/store/user.store";
import { useRouter } from "next/navigation";

export function VerificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { user } = useUserStore();
  const router = useRouter();
  const { resend, isResending } = useVerification();

  if (!isVisible || !user) return null;

  const handleResend = () => {
    resend(user.email, {
      onSuccess: () => {
        router.push("/verify-email");
      },
    });
  };

  return (
    <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <LuMail className="mt-0.5 h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Please verify your email
            </p>
            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
              <p>
                Check your inbox for the verification email. If you didn&apos;t
                receive it, you can request a new one below or from your{" "}
                <Link
                  href="/settings"
                  className="underline hover:no-underline font-medium"
                >
                  settings
                </Link>
                .
              </p>
              <div className="mt-3 flex items-center gap-4">
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="flex items-center gap-2 rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending && <LuLoader className="h-3 w-3 animate-spin" />}
                  {isResending ? "Sending..." : "Resend Email"}
                </button>
                <Link
                  href="/verify-email"
                  className="text-xs font-semibold text-yellow-800 hover:text-yellow-900 dark:text-yellow-200 dark:hover:text-yellow-100"
                >
                  Enter Code →
                </Link>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-4 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
        >
          <LuX className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
