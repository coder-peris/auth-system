"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks/auth/useLogin";
import { loginSchema, type LoginInput } from "@/schema/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import {
  LuEye,
  LuEyeOff,
  LuLoader,
  LuLock,
  LuMail,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    reValidateMode: "onSubmit",
  });

  const emailField = register("email");
  const passwordField = register("password");

  const { login, isPending, errorMessage, resetError } = useLogin();

  const onSubmit = (data: LoginInput) => login(data);

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue
        </p>
      </div>

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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LuLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...passwordField}
              id="password"
              type={showPassword ? "text" : "password"}
              className="pl-9 pr-10 rounded-lg"
              aria-invalid={!!errors.password}
              disabled={isPending}
              onChange={(e) => {
                passwordField.onChange(e);
                clearErrors("password");
                resetError();
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <LuEyeOff className="h-4 w-4" />
              ) : (
                <LuEye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="button"
          variant="link"
          className="text-sm p-0 h-fit"
          asChild
        >
          <Link href="/forgot-password">Forgot password?</Link>
        </Button>

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

        <Button type="submit" disabled={isPending} className="w-full py-5.25">
          {isPending ? (
            <>
              <LuLoader className="animate-spin-slow" />
              Signing In...
            </>
          ) : (
            "Sign In"
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

      <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          asChild
        >
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 items-center gap-3">
        <div className="col-span-2 flex items-center gap-3 mb-2.5 mt-1">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Or continue with
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`)
          }
          disabled={isPending}
        >
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            (window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`)
          }
          disabled={isPending}
        >
          <FaGithub className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <div className="flex items-start gap-3">
          <LuTriangleAlert className="mt-0.5 h-4 w-4 text-muted-foreground" />

          <div className="space-y-1">
            <p className="font-medium text-foreground">Need help signing in?</p>

            <p className="text-muted-foreground">
              If you&apos;re facing issues accessing your account, you can reach
              out.
            </p>

            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm"
              asChild
            >
              <Link href="/support">Contact Customer Support</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
