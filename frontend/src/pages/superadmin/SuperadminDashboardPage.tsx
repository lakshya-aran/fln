import { useQuery } from "@tanstack/react-query";
import {
  Users, UserCheck, Shield, Calendar, BookOpen,
  AlertTriangle, MessageSquare, TrendingUp, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { superadminApi } from "@/services/superadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLE_TREND_DATA = [
  { month: "Jan", reading: 45, math: 40, dropout: 5 },
  { month: "Feb", reading: 48, math: 43, dropout: 4.8 },
  { month: "Mar", reading: 52, math: 47, dropout: 4.5 },
  { month: "Apr", reading: 55, math: 50, dropout: 4.2 },
  { month: "May", reading: 58, math: 54, dropout: 3.9 },
  { month: "Jun", reading: 62, math: 58, dropout: 3.5 },
];

const SAMPLE_STATE_DATA = [
  { state: "UP", completion: 78 },
  { state: "MP", completion: 72 },
  { state: "RJ", completion: 81 },
  { state: "BR", completion: 68 },
  { state: "GJ", completion: 85 },
  { state: "TN", completion: 79 },
  { state: "MH", completion: 76 },
  { state: "KA", completion: 82 },
];

export function SuperadminDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["superadmin-dashboard"],
    queryFn: superadminApi.dashboard,
  });

  const { data: stats } = useQuery({
    queryKey: ["superadmin-nationwide-stats"],
    queryFn: superadminApi.nationwideStats,
  });

  const { data: analytics } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: superadminApi.analytics,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="National Authority Dashboard"
        description="Complete oversight of the nationwide FLN platform"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={dashboard?.totalUsers ?? 0}
          icon={Users}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Active Users"
          value={dashboard?.activeUsers ?? 0}
          icon={UserCheck}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Curricula"
          value={dashboard?.curricula ?? 0}
          icon={BookOpen}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          title="Calendar Entries"
          value={dashboard?.calendarEntries ?? 0}
          icon={Calendar}
          color="indigo"
          loading={isLoading}
        />
        <StatCard
          title="Pending Reviews"
          value={dashboard?.pendingReviews ?? 0}
          icon={AlertTriangle}
          color="orange"
          loading={isLoading}
        />
        <StatCard
          title="Open Feedback"
          value={dashboard?.openFeedback ?? 0}
          icon={MessageSquare}
          color="red"
          loading={isLoading}
        />
        <StatCard
          title="Active Admins"
          value={dashboard?.totalAdmins ?? 0}
          icon={Shield}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="States Covered"
          value={stats?.states ?? 28}
          icon={TrendingUp}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary-600" />
              Learning Trends
            </CardTitle>
            <CardDescription>Reading and math outcomes over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={SAMPLE_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reading" stroke="#2563EB" strokeWidth={2} />
                <Line type="monotone" dataKey="math" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dropout Trend</CardTitle>
            <CardDescription>Student dropout percentage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={SAMPLE_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="dropout" stroke="#EF4444" fill="#FEE2E2" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>State-wise Assessment Completion</CardTitle>
            <CardDescription>Top states by completion rate (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={SAMPLE_STATE_DATA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="state" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="completion" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Total platform users per role</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={analytics?.users?.byRole
                  ? Object.entries(analytics.users.byRole).map(([role, count]) => ({
                      role: role.replace(/_/g, " "),
                      count,
                    }))
                  : []}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="role" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}