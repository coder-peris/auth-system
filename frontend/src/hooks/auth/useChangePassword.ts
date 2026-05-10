import { changePassword } from "@/services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { AxiosError } from "axios";
import { useUser } from "@/providers/user-provider";

export const useChangePassword = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useUser();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: async () => {
      toast.success("Password changed successfully");
      setErrorMessage(null);
      await queryClient.invalidateQueries({ queryKey: ["sessions"] });
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to change password.";
      setErrorMessage(message);
    },
  });

  const resetError = () => setErrorMessage(null);

  return {
    changePassword: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage,
    resetError,
  };
};
