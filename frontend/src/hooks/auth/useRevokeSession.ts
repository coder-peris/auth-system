import { revokeSession } from "@/services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

export const useRevokeSession = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      toast.success("Session revoked successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to revoke session.";
      toast.error(message);
    },
  });

  return {
    revokeSession: mutation.mutate,
    isPending: mutation.isPending,
  };
};
