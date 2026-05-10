import { getCurrentUser } from "@/services/auth.service";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/user.store";
import { useRouter } from "next/navigation";

export const useCurrentUser = () => {
  const { user, setUser, setIsLoading } = useUserStore();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    enabled: false, // Don't fetch automatically - handled by route protection
    retry: false,
  });

  const refetchUser = () => {
    query.refetch().then((result) => {
      if (result.data) {
        setUser(result.data.user);
        setIsLoading(false);
      } else if (result.error) {
        setUser(null);
        setIsLoading(false);
        router.push("/login");
      }
    });
  };

  return {
    user,
    isLoading: query.isLoading || !user,
    error: query.error,
    refetch: refetchUser,
  };
};
