"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { LuLoader, LuMail, LuLock, LuTriangleAlert, LuX } from "react-icons/lu";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    reValidateMode: "onSubmit",
    defaultValues: {
      email,
      logoutAll: false,
    },
  });

  const emailField = register("email");
  const otpField = register("otp");
  const newPasswordField = register("newPassword");
  const confirmPasswordField = register("confirmPassword");

  const { resetPassword, isPending, errorMessage, resetError } =
    useResetPassword();

  const onSubmit = (data: ResetPasswordInput) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...resetData } = data;
    resetPassword(resetData);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Reset Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          If that email exists, a reset code has been sent
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
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...emailField}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9 rounded-lg"
              aria-invalid={!!errors.email}
              disabled={isPending}
              onChange={(e) => {
                emailField.onChange(e);
                clearErrors("email");
                resetError();
              }}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="otp">Reset Code</Label>
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...otpField}
              id="otp"
              type="text"
              placeholder="123456"
              className="pl-9 rounded-lg"
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

        <div className="space-y-2.5">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...newPasswordField}
              id="newPassword"
              type="password"
              placeholder="Enter new password"
              className="pl-9 rounded-lg"
              aria-invalid={!!errors.newPassword}
              disabled={isPending}
              onChange={(e) => {
                newPasswordField.onChange(e);
                clearErrors("newPassword");
                resetError();
              }}
            />
          </div>
          {errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...confirmPasswordField}
              id="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              className="pl-9 rounded-lg"
              aria-invalid={!!errors.confirmPassword}
              disabled={isPending}
              onChange={(e) => {
                confirmPasswordField.onChange(e);
                clearErrors("confirmPassword");
                resetError();
              }}
            />
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            {...register("logoutAll")}
            id="logoutAll"
            type="checkbox"
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            disabled={isPending}
          />
          <Label
            htmlFor="logoutAll"
            className="text-sm text-gray-600 dark:text-gray-400"
          >
            Log out from all devices
          </Label>
        </div>

        <Button type="submit" disabled={isPending} className="w-full py-5.25">
          {isPending ? (
            <>
              <LuLoader className="animate-spin-slow" />
              Resetting Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Didn&apos;t receive the code?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          asChild
        >
          <Link href="/forgot-password">Request again</Link>
        </Button>
      </div>
    </>
  );
}
