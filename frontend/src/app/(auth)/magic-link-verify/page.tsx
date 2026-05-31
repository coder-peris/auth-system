"use client";

import { verifyMagicLink } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuLoader, LuTriangleAlert } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@/providers/user-provider";

export default function MagicLinkVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const { refreshUser } = useUser();

  const missingParams = !email || !token;

  const { isLoading, error, data } = useQuery({
    queryKey: ["verify-magic-link", email, token],
    queryFn: () => verifyMagicLink(email!, token!),
    enabled: !missingParams,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      (async () => {
        await refreshUser();
        router.push("/dashboard");
      })();
    }
  }, [data, router, refreshUser]);

  const errorMessage = missingParams
    ? "Invalid magic link. Missing email or token."
    : isAxiosError(error)
      ? typeof error.response?.data?.message === "string"
        ? error.response.data.message
        : "Invalid or expired magic link."
      : error
        ? "Something went wrong. Please try again."
        : null;

  if (isLoading) {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
            Verifying Magic Link
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please wait while we verify your magic link...
          </p>
        </div>
        <div className="mb-6 flex items-center justify-center">
          <LuLoader className="h-12 w-12 animate-spin" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Invalid Link
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          The magic link you clicked is invalid or has expired.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <p className="text-muted-foreground mb-4">
          Magic links expire after 15 minutes. Please request a new one to sign
          in.
        </p>
      </div>

      <div className="mt-6 text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm hover:underline"
          asChild
        >
          <Link href="/request-magic-link">Request a new magic link</Link>
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <Button type="button" variant="link" asChild>
          <Link href="/login">Sign in with password</Link>
        </Button>
      </div>
    </>
  );
}
