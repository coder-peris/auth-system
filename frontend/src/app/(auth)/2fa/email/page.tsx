"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { use2FAEmail } from "@/hooks/auth/use2FA";
import { otpSchema, type OtpInput } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { LuLoader, LuLock, LuTriangleAlert, LuX } from "react-icons/lu";

export default function TwoFactorEmailPage() {
  const pendingSessionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("pendingSessionId")
      : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    reValidateMode: "onSubmit",
  });

  const otpField = register("otp");

  const { verify, isPending, errorMessage, resetError } = use2FAEmail();

  useEffect(() => {
    if (!pendingSessionId) {
      window.location.href = "/login";
    }
  }, [pendingSessionId]);

  const onSubmit = (data: OtpInput) => {
    if (!pendingSessionId) return;
    verify({ pendingSessionId, otp: data.otp });
  };

  if (!pendingSessionId) {
    return null;
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Two-Factor Authentication
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter the 6-digit code sent to your email
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
          <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => resetError()}
            className="hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer ml-auto flex p-0.5 items-center justify-center rounded-sm transition-colors"
          >
            <LuX className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-2.5">
          <Label htmlFor="otp">OTP Code</Label>
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...otpField}
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="123456"
              maxLength={6}
              className="pl-9 rounded-lg text-center text-2xl tracking-widest"
              aria-invalid={!!errors.otp}
              disabled={isPending}
              onChange={(e) => {
                otpField.onChange(e);
                clearErrors("otp");
                resetError();
              }}
            />
          </div>
          {errors.otp && (
            <p className="text-xs text-red-500">{errors.otp.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className={`w-full ${isPending ? "cursor-wait!" : ""}`}
        >
          {isPending ? (
            <>
              <LuLoader className="mr-2 h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Verify"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Didn&apos;t receive the code?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          onClick={() => (window.location.href = "/login")}
        >
          Go back to login
        </Button>
      </div>
    </>
  );
}
