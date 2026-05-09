import { verify2FAEmail, verify2FATOTP } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/user-provider";

export const use2FAEmail = () => {
  const router = useRouter();
  const { refreshUser } = useUser();

  const mutation = useMutation({
    mutationFn: ({
      pendingSessionId,
      otp,
    }: {
      pendingSessionId: string;
      otp: string;
    }) => verify2FAEmail(pendingSessionId, otp),
    onSuccess: async () => {
      sessionStorage.removeItem("pendingSessionId");
      await refreshUser();
      router.push("/dashboard");
    },
  });

  const getErrorMessage = (): string | null => {
    if (!mutation.isError) return null;
    if (isAxiosError(mutation.error)) {
      const { message, statusCode } = mutation.error.response?.data ?? {};
      if (statusCode === 400 && Array.isArray(message))
        return message.join(". ");
      if (statusCode === 401)
        return typeof message === "string" ? message : "Invalid OTP.";
    }
    return "Something went wrong. Please try again.";
  };

  return {
    verify: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
};

export const use2FATOTP = () => {
  const router = useRouter();
  const { refreshUser } = useUser();

  const mutation = useMutation({
    mutationFn: ({
      pendingSessionId,
      code,
    }: {
      pendingSessionId: string;
      code: string;
    }) => verify2FATOTP(pendingSessionId, code),
    onSuccess: async () => {
      sessionStorage.removeItem("pendingSessionId");
      await refreshUser();
      router.push("/dashboard");
    },
  });

  const getErrorMessage = (): string | null => {
    if (!mutation.isError) return null;
    if (isAxiosError(mutation.error)) {
      const { message, statusCode } = mutation.error.response?.data ?? {};
      if (statusCode === 400 && Array.isArray(message))
        return message.join(". ");
      if (statusCode === 401)
        return typeof message === "string" ? message : "Invalid code.";
    }
    return "Something went wrong. Please try again.";
  };

  return {
    verify: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
};
