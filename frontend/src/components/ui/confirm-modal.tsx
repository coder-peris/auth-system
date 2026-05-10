"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuX, LuTriangle } from "react-icons/lu";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl bg-card border p-6 shadow-2xl">
        <div className="absolute right-4 top-4">
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <LuX className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <div
            className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
              variant === "danger"
                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            <LuTriangle className="h-6 w-6" />
          </div>

          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-lg border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-accent disabled:opacity-50 transition-colors cursor-pointer sm:w-auto min-w-[100px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm disabled:opacity-50 transition-colors cursor-pointer sm:w-auto min-w-[100px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
