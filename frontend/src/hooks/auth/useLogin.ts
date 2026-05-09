import { loginUser } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export const useLogin = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.twoFactorRequired) {
        sessionStorage.setItem("pendingSessionId", data.pendingSessionId);
        router.push(`/2fa/${data.twoFactorMethod.toLowerCase()}`);
        return;
      }
      router.push("/dashboard");
    },
  });

  const getErrorMessage = (): string | null => {
    if (!mutation.isError) return null;
    if (isAxiosError(mutation.error)) {
      const { message, statusCode } = mutation.error.response?.data ?? {};
      if (statusCode === 400)
        return Array.isArray(message) ? message.join(". ") : message;
      if (statusCode === 401)
        return typeof message === "string" ? message : "Authentication failed.";
    }
    return "Something went wrong. Please try again.";
  };

  return {
    login: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
};
