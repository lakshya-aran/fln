import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import {
  School, Users, GraduationCap, UserCheck, Award, TrendingUp, AlertCircle,
} from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function BlockAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["block-analytics"],
    queryFn: blockAdminApi.analytics,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Block Analytics" description="Deep insights into your block" breadcrumbs={[{ label: "Analytics" }]} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Schools" value={data?.cards?.schools ?? 0} icon={School} color="blue" loading={isLoading} />
        <StatCard title="Students" value={data?.cards?.students ?? 0} icon={GraduationCap} color="green" loading={isLoading} />
        <StatCard title="Teachers" value={data?.cards?.teachers ?? 0} icon={Users} color="indigo" loading={isLoading} />
        <StatCard title="Volunteers" value={data?.cards?.volunteers ?? 0} icon={UserCheck} color="purple" loading={isLoading} />
        <StatCard title="Certification" value={`${data?.cards?.certification ?? 0}%`} icon={Award} color="green" loading={isLoading} />
        <StatCard title="Completion" value={`${data?.cards?.assessmentCompletion ?? 0}%`} icon={TrendingUp} color="blue" loading={isLoading} />
        <StatCard title="Schools Pending" value={data?.cards?.schoolsPending ?? 0} icon={AlertCircle} color="red" loading={isLoading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>School Comparison</CardTitle>
            <CardDescription>Performance across schools</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.schoolComparison ?? []}>
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
            <CardTitle>Volunteer Reliability</CardTitle>
            <CardDescription>Top volunteers by reliability</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.volunteerReliability ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} fontSize={10} />
                <Tooltip />
                <Legend />
                <Bar dataKey="reliability" fill="#9333EA" name="Reliability %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volunteer Activity (30d)</CardTitle>
            <CardDescription>Total vs completed assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data?.volunteerActivity ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={10} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="total" stackId="1" stroke="#2563EB" fill="#2563EB" fillOpacity={0.5} name="Total" />
                <Area type="monotone" dataKey="completed" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.5} name="Completed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Outcomes</CardTitle>
            <CardDescription>Average scores by block</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.learningOutcomes ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reading" fill="#2563EB" name="Reading" />
                <Bar dataKey="math" fill="#10B981" name="Math" />
                <Bar dataKey="certification" fill="#F59E0B" name="Cert %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student Growth</CardTitle>
            <CardDescription>Approved registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.studentGrowth ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
            <CardTitle>Assessment Trend</CardTitle>
            <CardDescription>Completed assessments per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data?.assessmentTrend ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}