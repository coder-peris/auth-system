"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuMail, LuEye, LuEyeOff, LuTriangleAlert, LuX } from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/user.store";
import { useState } from "react";
import {
  useRequestEmailChange,
  useChangeEmail,
} from "@/hooks/auth/useChangeEmail";
import { changeEmailSchema, type ChangeEmailInput } from "@/schema/auth.schema";

export function ChangeEmailForm() {
  const { user } = useUserStore();
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { requestEmailChange, isPending: isRequestingEmailChange } =
    useRequestEmailChange();
  const {
    changeEmail,
    isPending: isChangingEmail,
    errorMessage,
    resetError,
  } = useChangeEmail();

  const form = useForm<ChangeEmailInput>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      newEmail: "",
      otp: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = form;

  const handleRequestEmailChange = () => {
    requestEmailChange(undefined, {
      onSuccess: () => {
        setEmailOtpSent(true);
      },
    });
  };

  const onSubmit = (data: ChangeEmailInput) => {
    changeEmail(
      {
        newEmail: data.newEmail,
        otp: data.otp,
        password: data.password,
      },
      {
        onSuccess: () => {
          form.reset();
          setEmailOtpSent(false);
        },
      },
    );
  };

  if (!user) return null;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <LuMail className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Change Email</h2>
      </div>

      <div className="space-y-4">
        {!user.isVerified ? (
          <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-900/30">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Your email is unverified. To change your email address, please
              provide your current password for security.
            </p>
          </div>
        ) : (
          <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-900/30">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              To change your email address, you must first verify your ownership
              of the current email address.
            </p>
            {!emailOtpSent && (
              <Button
                onClick={handleRequestEmailChange}
                disabled={isRequestingEmailChange}
                size="sm"
                variant="outline"
                className="mt-3 cursor-pointer bg-white dark:bg-background"
              >
                {isRequestingEmailChange
                  ? "Sending..."
                  : "Send OTP to Current Email"}
              </Button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newEmail">New Email Address</Label>
            <Input
              id="newEmail"
              type="email"
              placeholder="new@example.com"
              {...register("newEmail")}
              onChange={(e) => {
                register("newEmail").onChange(e);
                clearErrors("newEmail");
                resetError?.();
              }}
            />
            {errors.newEmail && (
              <p className="text-sm text-destructive">
                {errors.newEmail.message}
              </p>
            )}
          </div>

          {user.isVerified ? (
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                placeholder="000000"
                {...register("otp")}
                onChange={(e) => {
                  register("otp").onChange(e);
                  clearErrors("otp");
                  resetError?.();
                }}
                disabled={!emailOtpSent}
              />
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit code sent to your current email.
              </p>
              {errors.otp && (
                <p className="text-sm text-destructive">{errors.otp.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="password">Current Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  onChange={(e) => {
                    register("password").onChange(e);
                    clearErrors("password");
                    resetError?.();
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <LuEyeOff className="h-4 w-4" />
                  ) : (
                    <LuEye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
              <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
              <button
                type="button"
                onClick={() => resetError?.()}
                className="hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer ml-auto flex p-0.5 items-center justify-center rounded-sm transition-colors"
              >
                <LuX className="h-4 w-4" />
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isChangingEmail || (user.isVerified && !emailOtpSent)}
            className="w-full md:w-auto cursor-pointer"
          >
            {isChangingEmail ? "Changing Email..." : "Change Email Address"}
          </Button>
        </form>
      </div>
    </div>
  );
}
