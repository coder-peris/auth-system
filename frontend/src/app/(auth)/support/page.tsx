"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useSupport } from "@/hooks/support/useSupport";
import { supportSchema, type SupportInput } from "@/schema/support.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  LuArrowLeft,
  LuCircleCheck,
  LuLoader,
  LuMail,
  LuMessageSquare,
  LuSend,
  LuTriangleAlert,
  LuX,
} from "react-icons/lu";

export default function SupportPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const { submitSupport, isSubmitting, error, clearError } = useSupport();

  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    watch,
  } = useForm<SupportInput>({
    resolver: zodResolver(supportSchema),
    reValidateMode: "onSubmit",
  });

  const selectedIssueType = watch("issueType");

  const onSubmit = async (data: SupportInput) => {
    try {
      const result = await submitSupport(data);
      setTicketId(result.ticketId || null);
      setIsSubmitted(true);
    } catch {
      // Error is handled by the useSupport hook
    }
  };

  const issueTypes = [
    {
      value: "login",
      label: "Login Issues",
      description: "Problems signing in or accessing your account",
    },
    {
      value: "account",
      label: "Account Issues",
      description: "Profile, settings, or account management problems",
    },
    {
      value: "technical",
      label: "Technical Issues",
      description: "Bugs, errors, or system malfunctions",
    },
    {
      value: "other",
      label: "Other",
      description: "Any other issues not listed above",
    },
  ];

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <LuCircleCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
            Support Request Received
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            We&apos;ve received your support request and will get back to you
            within 24 hours.
          </p>
          {ticketId && (
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
              Ticket ID: {ticketId}
            </p>
          )}
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm mb-6">
          <div className="flex items-start gap-3">
            <LuMail className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">What happens next?</p>
              <ul className="text-muted-foreground space-y-1 text-left">
                <li>• Our support team will review your request</li>
                <li>• You&apos;ll receive a response at your contact email</li>
                <li>• We may ask for additional information if needed</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full"
          >
            Submit Another Request
          </Button>
          <Button type="button" variant="link" asChild className="w-full">
            <Link href="/login">
              <LuArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            asChild
            className="p-0 h-auto text-muted-foreground hover:text-foreground"
          >
            <Link href="/login">
              <LuArrowLeft className="mr-1 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>

        <h2 className="text-2xl mb-2 text-gray-900 dark:text-white">
          Customer Support
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We&apos;re here to help. Describe your issue and we&apos;ll get back
          to you soon.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="space-y-2.5">
          <Label htmlFor="contactEmail">Contact Email</Label>
          <div className="relative">
            <LuMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              {...register("contactEmail")}
              id="contactEmail"
              type="email"
              placeholder="your.email@example.com"
              className="pl-9 rounded-lg"
              aria-invalid={!!errors.contactEmail}
              onChange={(e) => {
                register("contactEmail").onChange(e);
                clearErrors("contactEmail");
              }}
            />
          </div>
          {errors.contactEmail && (
            <p className="text-xs text-red-500">
              {errors.contactEmail.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            We&apos;ll send our response to this email address
          </p>
        </div>

        <div className="space-y-2.5">
          <Label>Issue Type</Label>
          <RadioGroup
            value={selectedIssueType}
            onValueChange={(value) =>
              setValue(
                "issueType",
                value as "login" | "account" | "technical" | "other",
              )
            }
            className="space-y-2"
          >
            {issueTypes.map((type) => (
              <div key={type.value} className="flex items-start space-x-2">
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <Label
                    htmlFor={type.value}
                    className="font-medium cursor-pointer"
                  >
                    {type.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
          {errors.issueType && (
            <p className="text-xs text-red-500">{errors.issueType.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="subject">Subject</Label>
          <Input
            {...register("subject")}
            id="subject"
            type="text"
            placeholder="Brief description of your issue"
            className="rounded-lg"
            aria-invalid={!!errors.subject}
            onChange={(e) => {
              register("subject").onChange(e);
              clearErrors("subject");
            }}
          />
          {errors.subject && (
            <p className="text-xs text-red-500">{errors.subject.message}</p>
          )}
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="problemDescription">Problem Description</Label>
          <div className="relative">
            <Textarea
              {...register("problemDescription")}
              id="problemDescription"
              placeholder="Please describe your issue in detail. Include any error messages, steps to reproduce the problem, and what you expected to happen."
              className="rounded-lg min-h-[120px] resize-none"
              aria-invalid={!!errors.problemDescription}
              onChange={(e) => {
                register("problemDescription").onChange(e);
                clearErrors("problemDescription");
              }}
            />
          </div>
          {errors.problemDescription && (
            <p className="text-xs text-red-500">
              {errors.problemDescription.message}
            </p>
          )}
          <div className="flex justify-between">
            <p className="text-xs text-muted-foreground">
              Be as detailed as possible to help us resolve your issue faster
            </p>
            <p className="text-xs text-muted-foreground">
              {watch("problemDescription")?.length || 0}/1000
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
          <div className="flex items-start gap-3">
            <LuMessageSquare className="mt-0.5 h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <p className="font-medium text-foreground">Response Time</p>
              <p className="text-muted-foreground">
                We typically respond to support requests within 24 hours during
                business days.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-400">
            <LuTriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => clearError()}
              className="hover:bg-red-100 dark:hover:bg-red-950 cursor-pointer ml-auto flex p-0.5 items-center justify-center rounded-sm transition-colors"
            >
              <LuX className="h-4 w-4" />
            </button>
          </div>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-5.25"
        >
          {isSubmitting ? (
            <>
              <LuLoader className="animate-spin-slow mr-2 h-4 w-4" />
              Sending...
            </>
          ) : (
            <>
              <LuSend className="mr-2 h-4 w-4" />
              Send Support Request
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        Remember your login details?{" "}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-sm"
          asChild
        >
          <Link href="/login">Sign in</Link>
        </Button>
      </div>
    </>
  );
}
