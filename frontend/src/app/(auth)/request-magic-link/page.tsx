"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMagicLink } from "@/hooks/auth/useMagicLink";
import { emailSchema, type EmailInput } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import {
  LuLoader,
  LuMail,
  LuTriangleAlert,
  LuX,
  LuCheck,
} from "react-icons/lu";
import Link from "next/link";

export default function RequestMagicLinkPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<EmailInput>({
    resolver: zodResolver(emailSchema),
    reValidateMode: "onSubmit",
  });

  const { sendMagicLink, isPending, errorMessage, resetError, isSuccess } =
    useMagicLink();

  const onSubmit = (data: EmailInput) => {
    sendMagicLink(data.email);
  };

  if (isSuccess) {
    return (
      <>
        <div className="mb-6">
          <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
            Check Your Email
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            If an account exists, a magic link has been sent to your email.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40 p-4">
          <LuCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <p className="text-muted-foreground">
            Click the link in the email to sign in. The link will expire in 15
            minutes.
          </p>
        </div>

        <div className="mt-6 justify-center flex gap-2">
          <p className="text-sm">Didn&apos;t receive email?</p>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm "
            onClick={() => {
              resetError();
            }}
          >
            Send another link
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Magic Link
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in without a password using a magic link
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
            "Send Magic Link"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
        Prefer password login?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          asChild
        >
          <Link href="/login">Sign in with password</Link>
        </Button>
      </div>
    </>
  );
}
