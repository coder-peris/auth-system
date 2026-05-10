"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  LuShield,
  LuQrCode,
  LuCheck,
  LuMail,
  LuSmartphone,
} from "react-icons/lu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserStore } from "@/store/user.store";
import { useState } from "react";
import { QRCode } from "@/components/ui/qr-code";
import { cn } from "@/lib/utils";
import {
  useTotpSetup,
  useTotpConfirm,
  useEmail2FASetup,
  useEmail2FAConfirm,
  useDisable2FA,
} from "@/hooks/auth/useTotpSetup";
import {
  totpSchema,
  type TotpInput,
  otpSchema,
  type OtpInput,
} from "@/schema/auth.schema";

export function Configure2FAForm() {
  const { user } = useUserStore();
  const [showTotpDialog, setShowTotpDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [method, setMethod] = useState<"TOTP" | "EMAIL">("TOTP");

  const {
    setupTotp,
    isPending: isSettingUpTotp,
    data: totpData,
  } = useTotpSetup();
  const { confirmTotp, isPending: isConfirmingTotp } = useTotpConfirm();

  const { setupEmail2FA, isPending: isSettingUpEmail } = useEmail2FASetup();
  const { confirmEmail2FA, isPending: isConfirmingEmail } =
    useEmail2FAConfirm();

  const { disable2FA, isPending: isDisabling } = useDisable2FA();

  const totpForm = useForm<TotpInput>({
    resolver: zodResolver(totpSchema),
    defaultValues: {
      code: "",
    },
  });

  const emailForm = useForm<OtpInput>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  const handleSetup = () => {
    if (method === "TOTP") {
      setupTotp(undefined, {
        onSuccess: () => {
          setShowTotpDialog(true);
        },
      });
    } else {
      setupEmail2FA(undefined, {
        onSuccess: () => {
          setShowEmailDialog(true);
        },
      });
    }
  };

  const onTotpSubmit = (data: TotpInput) => {
    confirmTotp(data.code, {
      onSuccess: () => {
        setShowTotpDialog(false);
        totpForm.reset();
      },
    });
  };

  const onEmailSubmit = (data: OtpInput) => {
    confirmEmail2FA(data.otp, {
      onSuccess: () => {
        setShowEmailDialog(false);
        emailForm.reset();
      },
    });
  };

  if (!user) return null;

  const isEnabled = user.twoFactorMethod !== "NONE";

  return (
    <>
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4 flex items-center space-x-2">
          <LuShield className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Two-Factor Authentication</h2>
        </div>

        {!user.isVerified ? (
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Please verify your email to enable Two-Factor Authentication.
          </p>
        ) : (
          <div className="space-y-6">
            {isEnabled && (
              <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900">
                <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                  <LuCheck className="h-5 w-5" />
                  <span className="font-medium capitalize">
                    {user.twoFactorMethod === "TOTP"
                      ? "Authenticator App"
                      : "Email OTP"}{" "}
                    2FA is active
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disable2FA()}
                  disabled={isDisabling}
                  className="text-destructive hover:text-destructive cursor-pointer border-destructive/20"
                >
                  {isDisabling ? "Disabling..." : "Disable"}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {isEnabled
                  ? "Switch to another method"
                  : "Choose your verification method"}
              </Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as "TOTP" | "EMAIL")}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem
                    value="TOTP"
                    id="totp"
                    className="peer sr-only"
                    disabled={user.twoFactorMethod === "TOTP"}
                  />
                  <Label
                    htmlFor="totp"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                      user.twoFactorMethod === "TOTP" &&
                        "opacity-50 cursor-not-allowed border-primary/50 bg-accent/50",
                    )}
                  >
                    <LuSmartphone className="mb-3 h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">Authenticator App</p>
                      <p className="text-xs text-muted-foreground">
                        Use an app like Google Authenticator
                      </p>
                    </div>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="EMAIL"
                    id="email"
                    className="peer sr-only"
                    disabled={user.twoFactorMethod === "EMAIL"}
                  />
                  <Label
                    htmlFor="email"
                    className={cn(
                      "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                      user.twoFactorMethod === "EMAIL" &&
                        "opacity-50 cursor-not-allowed border-primary/50 bg-accent/50",
                    )}
                  >
                    <LuMail className="mb-3 h-6 w-6" />
                    <div className="text-center">
                      <p className="font-semibold">Email OTP</p>
                      <p className="text-xs text-muted-foreground">
                        Receive a verification code via email
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button
              onClick={handleSetup}
              disabled={
                isSettingUpTotp ||
                isSettingUpEmail ||
                method === user.twoFactorMethod
              }
              className="w-full md:w-auto flex items-center space-x-2 cursor-pointer"
            >
              <LuQrCode className="h-4 w-4" />
              <span>
                {isSettingUpTotp || isSettingUpEmail
                  ? "Setting up..."
                  : isEnabled
                    ? `Switch to ${method === "TOTP" ? "Authenticator" : "Email"}`
                    : `Setup ${method === "TOTP" ? "TOTP" : "Email"} 2FA`}
              </span>
            </Button>
          </div>
        )}
      </div>

      {showTotpDialog && totpData?.otpauthUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="mb-4 text-xl font-bold">Setup TOTP 2FA</h3>

            <div className="mb-6 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Scan this QR code with your authenticator app:
              </p>
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={totpData.otpauthUrl} size={200} />
              </div>
            </div>

            <form
              onSubmit={totpForm.handleSubmit(onTotpSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  {...totpForm.register("code")}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
                {totpForm.formState.errors.code && (
                  <p className="text-sm text-destructive text-center">
                    {totpForm.formState.errors.code.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTotpDialog(false)}
                  className="flex-1 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConfirmingTotp}
                  className="flex-1 cursor-pointer"
                >
                  {isConfirmingTotp ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-card border p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <h3 className="mb-4 text-xl font-bold">Setup Email 2FA</h3>

            <div className="mb-6 space-y-4 text-center">
              <LuMail className="mx-auto h-12 w-12 text-primary opacity-20" />
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a 6-digit verification code to{" "}
                <span className="font-semibold text-foreground">
                  {user.email}
                </span>
                . Please enter it below to enable Email 2FA.
              </p>
            </div>

            <form
              onSubmit={emailForm.handleSubmit(onEmailSubmit)}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="000000"
                  {...emailForm.register("otp")}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={6}
                />
                {emailForm.formState.errors.otp && (
                  <p className="text-sm text-destructive text-center">
                    {emailForm.formState.errors.otp.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEmailDialog(false)}
                  className="flex-1 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isConfirmingEmail}
                  className="flex-1 cursor-pointer"
                >
                  {isConfirmingEmail ? "Confirming..." : "Confirm"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
