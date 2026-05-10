import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios-instance";

interface DashboardStats {
  totalUsers: number;
  activeSessions: number;
  recentUsers: number;
  verifiedUsers: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      // Since there's no specific dashboard stats endpoint, we'll fetch users and calculate stats
      const response = await api.get("/users?page=1&limit=1000");
      const users = response.data.data;

      const stats: DashboardStats = {
        totalUsers: users.length,
        activeSessions: users.length, // This is a placeholder - would need actual session data
        recentUsers: users.filter((user: { createdAt: string }) => {
          const createdAt = new Date(user.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        }).length,
        verifiedUsers: users.filter(
          (user: { isVerified: boolean }) => user.isVerified,
        ).length,
      };

      return stats;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
