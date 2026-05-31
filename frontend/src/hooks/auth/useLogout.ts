import { logout, logoutAll } from "@/services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/user.store";

export const useLogout = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      localStorage.removeItem("csrf_token");
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
  const setUser = useUserStore((state) => state.setUser);

  const mutation = useMutation({
    mutationFn: logoutAll,
    onSuccess: () => {
      localStorage.removeItem("csrf_token");
      setUser(null);
      router.push("/login");
    },
  });

  return {
    logoutAll: mutation.mutate,
    isPending: mutation.isPending,
  };
};
