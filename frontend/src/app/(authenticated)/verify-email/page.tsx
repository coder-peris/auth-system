"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useVerification } from "@/hooks/auth/useVerification";
import { useUserStore } from "@/store/user.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LuMail, LuLoader, LuArrowLeft } from "react-icons/lu";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState("");
  const { user } = useUserStore();
  const router = useRouter();
  const { verify, isVerifying, resend, isResending, isSuccess } = useVerification();

  useEffect(() => {
    if (user?.isVerified) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.email && otp.length === 6) {
      verify({ email: user.email, otp });
    }
  };

  const handleResend = () => {
    if (user?.email) {
      resend(user.email);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-green-100 p-3 dark:bg-green-900/30">
          <LuMail className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Email Verified!</h2>
        <p className="mt-2 text-muted-foreground">
          Your email has been successfully verified. You can now access all features.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <LuArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground mt-2">
            We&apos;ve sent a 6-digit verification code to{" "}
            <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em] font-bold h-14"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11"
            disabled={isVerifying || otp.length !== 6}
          >
            {isVerifying && <LuLoader className="mr-2 h-4 w-4 animate-spin" />}
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={isResending}
              className="font-medium text-primary hover:underline disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend code"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
