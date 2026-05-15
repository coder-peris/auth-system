"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuKey, LuEye, LuEyeOff, LuTriangleAlert, LuX } from "react-icons/lu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/schema/auth.schema";

export function ChangePasswordForm() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { changePassword, isPending, errorMessage, resetError } =
    useChangePassword();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      sessionOption: "DONT_LOGOUT",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    clearErrors,
  } = form;

  const currentPasswordField = register("currentPassword");
  const newPasswordField = register("newPassword");
  const confirmPasswordField = register("confirmPassword");

  const onSubmit = (data: ChangePasswordInput) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        sessionOption: data.sessionOption,
      },
      {
        onSuccess: () => {
          form.reset();
        },
      },
    );
  };

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center space-x-2">
        <LuKey className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Change Password</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <div className="relative">
            <Input
              id="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              placeholder="••••••••"
              {...currentPasswordField}
              onChange={(e) => {
                currentPasswordField.onChange(e);
                clearErrors("currentPassword");
                resetError?.();
              }}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showCurrentPassword ? (
                <LuEyeOff className="h-4 w-4" />
              ) : (
                <LuEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-destructive">
              {errors.currentPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="••••••••"
              {...newPasswordField}
              onChange={(e) => {
                newPasswordField.onChange(e);
                clearErrors("newPassword");
                resetError?.();
              }}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showNewPassword ? (
                <LuEyeOff className="h-4 w-4" />
              ) : (
                <LuEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-sm text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              {...confirmPasswordField}
              onChange={(e) => {
                confirmPasswordField.onChange(e);
                clearErrors("confirmPassword");
                resetError?.();
              }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              {showConfirmPassword ? (
                <LuEyeOff className="h-4 w-4" />
              ) : (
                <LuEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label>Session Option</Label>
          <Controller
            control={control}
            name="sessionOption"
            render={({ field }) => (
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DONT_LOGOUT" id="dont_logout" />
                  <Label
                    htmlFor="dont_logout"
                    className="font-normal cursor-pointer"
                  >
                    Don&apos;t logout from any sessions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LOGOUT_OTHERS" id="logout_others" />
                  <Label
                    htmlFor="logout_others"
                    className="font-normal cursor-pointer"
                  >
                    Logout from other sessions
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="LOGOUT_ALL" id="logout_all" />
                  <Label
                    htmlFor="logout_all"
                    className="font-normal cursor-pointer"
                  >
                    Logout from all sessions
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

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

        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending ? "Changing..." : "Change Password"}
        </Button>
      </form>
    </div>
  );
}
