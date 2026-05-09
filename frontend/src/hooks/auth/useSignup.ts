import { registerUser } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";

export const useRegister = () => {
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const getErrorMessage = (): string | null => {
    if (!mutation.isError) return null;
    if (isAxiosError(mutation.error)) {
      const { message, statusCode } = mutation.error.response?.data ?? {};
      if (statusCode === 400)
        return Array.isArray(message) ? message.join(". ") : message;
      if (statusCode === 409 && typeof message === "string") return message;
    }
    return "Something went wrong. Please try again.";
  };

  return {
    register: mutation.mutate,
    isPending: mutation.isPending,
    errorMessage: getErrorMessage(),
    resetError: mutation.reset,
  };
};
