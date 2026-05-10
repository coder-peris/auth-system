import { requestEmailChange, changeEmail } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/providers/user-provider";
import { useState } from "react";
import { AxiosError } from "axios";

export const useRequestEmailChange = () => {
  const mutation = useMutation({
    mutationFn: requestEmailChange,
    onSuccess: () => {
      toast.success("Verification code sent to your email");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to send verification email.";
      toast.error(message);
    },
  });

  return {
    requestEmailChange: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useChangeEmail = () => {
  const { refreshUser } = useUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: changeEmail,
    onSuccess: async () => {
      toast.success("Email changed successfully");
      setErrorMessage(null);
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to change email.";
      setErrorMessage(message);
    },
  });

  const resetError = () => setErrorMessage(null);

  return {
    changeEmail: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage,
    resetError,
  };
};
