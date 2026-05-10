import { useState } from "react";
import type { SupportInput } from "@/schema/support.schema";

interface UseSupportReturn {
  submitSupport: (
    data: SupportInput,
  ) => Promise<{ ticketId?: string; message: string }>;
  isSubmitting: boolean;
  error: string | null;
  clearError: () => void;
}

export function useSupport(): UseSupportReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitSupport = async (data: SupportInput) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/support`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit support request");
      }

      return result;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => setError(null);

  return {
    submitSupport,
    isSubmitting,
    error,
    clearError,
  };
}
