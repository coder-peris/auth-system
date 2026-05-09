import { logout, logoutAll } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export const useLogout = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      setUser(null);
      router.push("/login");
    },
  });

  return {
    logout: mutation.mutate,
    isPending: mutation.isPending,
  };
};

export const useLogoutAll = () => {
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      setUser(null);
      router.push("/login");
    },
  });

  return {
    logoutAll: mutation.mutate,
    isPending: mutation.isPending,
  };
};
