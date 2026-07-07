import { useQuery } from "@tanstack/react-query";
import {
  Building2, School, Users, UserCheck, Award, AlertTriangle,
  Bell, GitBranch, TrendingUp,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function DistrictAdminDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["district-dashboard"],
    queryFn: districtAdminApi.dashboard,
  });

  const { data: charts } = useQuery({
    queryKey: ["district-charts"],
    queryFn: districtAdminApi.charts,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dashboard?.district ?? "District"} Dashboard`}
        description="Real-time overview of your district's FLN performance"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Blocks" value={dashboard?.totalBlocks ?? 0} icon={Building2} color="blue" loading={isLoading} />
        <StatCard title="Total Schools" value={dashboard?.totalSchools ?? 0} icon={School} color="purple" loading={isLoading} />
        <StatCard title="Teachers" value={dashboard?.teachers ?? 0} icon={Users} color="indigo" loading={isLoading} />
        <StatCard title="Volunteers" value={dashboard?.volunteers ?? 0} icon={UserCheck} color="green" loading={isLoading} />
        <StatCard title="Assessment Completion" value={`${dashboard?.assessmentCompletion ?? 0}%`} icon={TrendingUp} color="green" loading={isLoading} />
        <StatCard title="FLN Certification" value={`${dashboard?.flnCertification ?? 0}%`} icon={Award} color="blue" loading={isLoading} />
        <StatCard title="In Pipeline" value={dashboard?.schoolsInPipeline ?? 0} icon={GitBranch} color="orange" loading={isLoading} />
        <StatCard title="Unread Notifications" value={dashboard?.unreadNotifications ?? 0} icon={Bell} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Block-wise FLN Certification</CardTitle>
            <CardDescription>FLN % across blocks in your district</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.blockCert ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="certification" fill="#2563EB" name="FLN Cert %" />
                <Bar dataKey="completion" fill="#10B981" name="Completion %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              Learning Trends
            </CardTitle>
            <CardDescription>Reading and math scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts?.monthlyTrend ?? []}>
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
            <CardTitle>Pipeline Distribution</CardTitle>
            <CardDescription>Schools across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts?.pipelineDistribution?.map(p => ({
                    name: p.stage?.replace(/_/g, " ")?.replace(/\b\w/g, c => c.toUpperCase()) || "Unknown",
                    value: p.count,
                  })) ?? []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(charts?.pipelineDistribution ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Completion Status</CardTitle>
            <CardDescription>Status of schools in your district</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(charts?.schoolStatus ?? {}).map(([name, value]) => ({ name, value }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {Object.keys(charts?.schoolStatus ?? {}).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
