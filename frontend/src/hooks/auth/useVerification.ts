import { resendVerification, verifyEmail } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useUser } from "@/providers/user-provider";
import { AxiosError } from "axios";

export const useVerification = () => {
  const { refreshUser } = useUser();

  const resendMutation = useMutation({
    mutationFn: resendVerification,
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message || "Failed to send verification email.";
      toast.error(message);
    },
  });

  const verifyMutation = useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      verifyEmail(email, otp),
    onSuccess: async () => {
      toast.success("Email verified successfully!");
      await refreshUser();
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const message =
        error.response?.data?.message ||
        "Verification failed. Invalid or expired OTP.";
      toast.error(message);
    },
  });

  return {
    resend: resendMutation.mutate,
    isResending: resendMutation.isPending,
    verify: verifyMutation.mutate,
    isVerifying: verifyMutation.isPending,
    isSuccess: verifyMutation.isSuccess,
  };
};
