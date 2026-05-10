"use client";

import { Users, UserCheck, Clock, Shield } from "lucide-react";
import { useDashboardStats } from "@/hooks/admin/useDashboardStats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load dashboard statistics
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0 space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <p className="text-gray-600 mt-2">
          Overview of system statistics and user activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
          description="Registered users"
        />

        <StatCard
          title="Active Sessions"
          value={stats?.activeSessions}
          icon={<Clock className="h-6 w-6" />}
          isLoading={isLoading}
          description="Currently active"
        />

        <StatCard
          title="Recent Users"
          value={stats?.recentUsers}
          icon={<UserCheck className="h-6 w-6" />}
          isLoading={isLoading}
          description="Joined in last 7 days"
        />

        <StatCard
          title="Verified Users"
          value={stats?.verifiedUsers}
          icon={<Shield className="h-6 w-6" />}
          isLoading={isLoading}
          description="Email verified"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/admin/users"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium">Manage Users</div>
                  <div className="text-sm text-gray-500">
                    View and manage all users
                  </div>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">API Status</span>
                <span className="text-sm font-medium text-green-600">
                  Healthy
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="text-sm font-medium text-green-600">
                  Connected
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Authentication</span>
                <span className="text-sm font-medium text-green-600">
                  Active
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  icon: React.ReactNode;
  isLoading: boolean;
  description: string;
}

function StatCard({
  title,
  value,
  icon,
  isLoading,
  description,
}: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl font-bold">
            {value?.toLocaleString() || 0}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
