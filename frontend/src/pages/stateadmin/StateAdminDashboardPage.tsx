import { useQuery } from "@tanstack/react-query";
import {
  Building2, School, Users, UserCheck, Award, AlertTriangle,
  Lock, TrendingUp, Activity,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { stateAdminApi } from "@/services/stateadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function StateAdminDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["stateadmin-dashboard"],
    queryFn: stateAdminApi.dashboard,
  });

  const { data: charts } = useQuery({
    queryKey: ["stateadmin-charts"],
    queryFn: stateAdminApi.charts,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dashboard?.state ?? "State"} Dashboard`}
        description="Real-time overview of your state's FLN performance"
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Districts"
          value={dashboard?.totalDistricts ?? 0}
          icon={Building2}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Total Schools"
          value={dashboard?.totalSchools ?? 0}
          icon={School}
          color="purple"
          loading={isLoading}
        />
        <StatCard
          title="Teachers"
          value={dashboard?.teachers ?? 0}
          icon={Users}
          color="indigo"
          loading={isLoading}
        />
        <StatCard
          title="Volunteers"
          value={dashboard?.volunteers ?? 0}
          icon={UserCheck}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="Assessment Completion"
          value={`${dashboard?.assessmentCompletion ?? 0}%`}
          icon={TrendingUp}
          color="green"
          loading={isLoading}
        />
        <StatCard
          title="FLN Certification"
          value={`${dashboard?.flnCertification ?? 0}%`}
          icon={Award}
          color="blue"
          loading={isLoading}
        />
        <StatCard
          title="Locked Schools"
          value={dashboard?.lockedSchools ?? 0}
          icon={Lock}
          color="orange"
          loading={isLoading}
        />
        <StatCard
          title="Districts Below 40%"
          value={dashboard?.districtsBelow40 ?? 0}
          icon={AlertTriangle}
          color="red"
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>District-wise FLN Certification</CardTitle>
            <CardDescription>FLN % across districts in your state</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.districtCert ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="district" />
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
              <Activity className="h-5 w-5 text-primary-600" />
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
            <CardTitle>Volunteer Distribution</CardTitle>
            <CardDescription>Volunteers across districts</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.volunteerDist ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="district" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>School Completion Status</CardTitle>
            <CardDescription>Status of schools in your state</CardDescription>
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