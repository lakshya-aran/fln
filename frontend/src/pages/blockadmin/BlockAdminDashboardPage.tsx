import { useQuery } from "@tanstack/react-query";
import {
  School, Users, UserCheck, Calendar, FileText, Wifi, Printer,
  AlertCircle, TrendingUp, Award, GitBranch, Lock, Bell, GraduationCap,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const COLORS = ["#9333EA", "#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function BlockAdminDashboardPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["block-dashboard"],
    queryFn: blockAdminApi.dashboard,
  });
  const { data: charts } = useQuery({
    queryKey: ["block-charts"],
    queryFn: blockAdminApi.charts,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${dashboard?.blocks?.[0] ?? "Block"} Dashboard`}
        description={`${dashboard?.district ?? ""} • ${dashboard?.state ?? ""}`}
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard title="Total Schools" value={dashboard?.totalSchools ?? 0} icon={School} color="blue" loading={isLoading} />
        <StatCard title="Teachers" value={dashboard?.teachers ?? 0} icon={Users} color="indigo" loading={isLoading} />
        <StatCard title="Students" value={dashboard?.students ?? 0} icon={GraduationCap} color="green" loading={isLoading} />
        <StatCard title="Volunteers" value={dashboard?.volunteers ?? 0} icon={UserCheck} color="purple" loading={isLoading} />
        <StatCard title="Assessments Scheduled" value={dashboard?.assessmentsScheduled ?? 0} icon={Calendar} color="orange" loading={isLoading} />
        <StatCard title="Assessments Completed" value={dashboard?.assessmentsCompleted ?? 0} icon={Calendar} color="green" loading={isLoading} />
        <StatCard title="Schools Pending" value={dashboard?.schoolsPending ?? 0} icon={AlertCircle} color="red" loading={isLoading} />
        <StatCard title="Question Papers" value={dashboard?.questionPapersGenerated ?? 0} icon={FileText} color="blue" loading={isLoading} />
        <StatCard title="No Internet Schools" value={dashboard?.schoolsWithoutInternet ?? 0} icon={Wifi} color="orange" loading={isLoading} />
        <StatCard title="Print Pending" value={dashboard?.printRequestsPending ?? 0} icon={Printer} color="orange" loading={isLoading} />
        <StatCard title="Student Reg. Pending" value={dashboard?.studentRegistrationsPending ?? 0} icon={UserCheck} color="orange" loading={isLoading} />
        <StatCard title="Locked Dashboards" value={dashboard?.lockedSchoolDashboards ?? 0} icon={Lock} color="red" loading={isLoading} />
        <StatCard title="FLN Certification" value={`${dashboard?.flnCertification ?? 0}%`} icon={Award} color="green" loading={isLoading} />
        <StatCard title="Assessment Completion" value={`${dashboard?.assessmentCompletion ?? 0}%`} icon={TrendingUp} color="blue" loading={isLoading} />
        <StatCard title="In Pipeline" value={dashboard?.schoolsInPipeline ?? 0} icon={GitBranch} color="indigo" loading={isLoading} />
        <StatCard title="Unread Notifications" value={dashboard?.unreadNotifications ?? 0} icon={Bell} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School Performance</CardTitle>
            <CardDescription>FLN scores across schools</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.data?.schoolPerformance ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="school" angle={-20} textAnchor="end" height={70} fontSize={10} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="flnCertification" fill="#9333EA" name="FLN %" />
                <Bar dataKey="readingScore" fill="#2563EB" name="Reading" />
                <Bar dataKey="mathScore" fill="#10B981" name="Math" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Pipeline</CardTitle>
            <CardDescription>Distribution across pipeline stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={(charts?.data?.pipelineByStage ?? []).map(p => ({
                    name: p.stage?.replace(/_/g, " ")?.replace(/\b\w/g, (c: string) => c.toUpperCase()) || "Unknown",
                    value: p.count,
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {(charts?.data?.pipelineByStage ?? []).map((_: unknown, i: number) => (
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
            <CardTitle>Volunteer Activity</CardTitle>
            <CardDescription>Recent volunteer assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={charts?.data?.volunteerDist ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#9333EA" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Registration Trend</CardTitle>
            <CardDescription>Pending vs approved registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts?.data?.regTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}