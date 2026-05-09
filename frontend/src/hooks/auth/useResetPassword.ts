import { resetPassword } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import type { ResetPasswordInput } from "@/schema/auth.schema";

export const useResetPassword = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.push("/login");
    },
  });

  const getErrorMessage = (): string | null => {
    if (!mutation.isError) return null;
    if (isAxiosError(mutation.error)) {
      const { message, statusCode } = mutation.error.response?.data ?? {};
      if (statusCode === 400 && Array.isArray(message))
        return message.join(". ");
      if (statusCode === 401)
        return typeof message === "string" ? message : "Authentication failed.";
    }
    return "Something went wrong. Please try again.";
  };

  return {
    resetPassword: (data: Omit<ResetPasswordInput, "confirmPassword">) =>
      mutation.mutate(data),
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
};
