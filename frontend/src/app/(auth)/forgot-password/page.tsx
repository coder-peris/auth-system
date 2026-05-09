"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
import { emailSchema, type EmailInput } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { LuLoader, LuMail, LuTriangleAlert, LuX } from "react-icons/lu";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submittedEmail, setSubmittedEmail] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    reValidateMode: "onSubmit",
  });

  const { forgotPassword, isPending, errorMessage, resetError, isSuccess } =
    useForgotPassword();

  const onSubmit = (data: EmailInput) => {
    setSubmittedEmail(data.email);
    forgotPassword(data.email);
  };

  // Redirect to reset password page on successful submission
  React.useEffect(() => {
    if (isSuccess && submittedEmail) {
      router.push(
        `/reset-password?email=${encodeURIComponent(submittedEmail)}`,
      );
    }
  }, [isSuccess, router, submittedEmail]);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Forgot Password
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Enter your email to receive a password reset code
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
              {...register("email")}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-9 rounded-lg"
              aria-invalid={!!errors.email}
              disabled={isPending}
              onChange={(e) => {
                register("email").onChange(e);
                clearErrors("email");
                resetError();
              }}
            />
          </div>
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
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
              Sending...
            </>
          ) : (
            "Send Reset Code"
          )}
        </Button>
      </form>

      <div className="w-full text-center">
        <Button
          type="button"
          variant="link"
          className="text-sm w-fit mt-2"
          asChild
        >
          <Link href="/request-magic-link">Get a magic link instead</Link>
        </Button>
      </div>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your password?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm "
          asChild
        >
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </>
  );
}
