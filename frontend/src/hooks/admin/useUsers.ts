import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios-instance";
import { User } from "@/store/user.store";
import { toast } from "sonner";

interface ApiError {
  response?: {
    data?: {
      message?: string | string[];
    };
  };
}

interface UsersQueryParams {
  page: number;
  limit: number;
  search?: string;
}

interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useUsers = (params: UsersQueryParams) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("page", params.page.toString());
      searchParams.set("limit", params.limit.toString());
      if (params.search) {
        searchParams.set("search", encodeURIComponent(params.search));
      }

      const response = await api.get<UsersResponse>(`/users?${searchParams}`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || "Failed to delete user";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: "USER" | "ADMIN";
    }) => {
      const response = await api.patch(`/users/${userId}/role`, { role });
      return response.data;
    },
    onSuccess: (updatedUser: User) => {
      toast.success(`User role updated to ${updatedUser.role}`);
      queryClient.setQueriesData(
        { queryKey: ["users"] },
        (
          oldData: { data?: User[]; meta?: UsersResponse["meta"] } | undefined,
        ) => {
          if (!oldData?.data) return oldData;

          return {
            ...oldData,
            data: oldData.data.map((user: User) =>
              user.id === updatedUser.id ? updatedUser : user,
            ),
          };
        },
      );
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Failed to update user role";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
};

export const useForceLogoutUser = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete(`/users/${userId}/sessions`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("User logged out from all sessions");
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || "Failed to logout user";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
};

export const useSendRecoveryLink = () => {
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.post(`/users/${userId}/recovery-link`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Recovery link sent successfully");
    },
    onError: (error: ApiError) => {
      const message =
        error.response?.data?.message || "Failed to send recovery link";
      toast.error(Array.isArray(message) ? message[0] : message);
    },
  });
};
