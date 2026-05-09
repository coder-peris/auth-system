import { forgotPassword } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";

export const useForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: forgotPassword,
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
    forgotPassword: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
    isSuccess: mutation.isSuccess,
  };
};
