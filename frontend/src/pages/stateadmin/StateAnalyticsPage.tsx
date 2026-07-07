import { useQuery } from "@tanstack/react-query";
import { Download, BarChart3, TrendingUp, Award } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { stateAdminApi } from "@/services/stateadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { StatCard } from "@/components/superadmin/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function StateAnalyticsPage() {
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["stateadmin-dashboard"],
    queryFn: stateAdminApi.dashboard,
  });

  const { data: charts } = useQuery({
    queryKey: ["stateadmin-charts"],
    queryFn: stateAdminApi.charts,
  });

  const { data: certification } = useQuery({
    queryKey: ["stateadmin-certification"],
    queryFn: stateAdminApi.certificationByDistrict,
  });

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = async (type: string, format: "csv" | "pdf") => {
    const result = await stateAdminApi.generateReport(type);
    if (result?.csv) {
      downloadCSV(result.csv, result.filename);
    }
  };

  const radarData = (certification?.districts ?? []).slice(0, 6).map(d => ({
    district: d.district,
    certification: d.certification,
    completion: d.completion,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="State Analytics"
        description="Comprehensive performance analytics for your state"
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => generateReport("state-summary", "csv")}>
              <Download className="mr-2 h-4 w-4" />
              State Report
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="FLN Certification" value={`${dashboard?.flnCertification ?? 0}%`} icon={Award} color="green" loading={isLoading} />
        <StatCard title="Assessment Completion" value={`${dashboard?.assessmentCompletion ?? 0}%`} icon={TrendingUp} color="blue" loading={isLoading} />
        <StatCard title="Total Students" value={dashboard?.students ?? 0} icon={BarChart3} color="purple" loading={isLoading} />
        <StatCard title="Districts" value={dashboard?.totalDistricts ?? 0} icon={BarChart3} color="indigo" loading={isLoading} />
      </div>

      <Tabs defaultValue="comparison">
        <TabsList>
          <TabsTrigger value="comparison">District Comparison</TabsTrigger>
          <TabsTrigger value="trends">Learning Trends</TabsTrigger>
          <TabsTrigger value="subject">Subject Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>District Performance Comparison</CardTitle>
              <CardDescription>Rank your districts by FLN certification</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={certification?.districts ?? []}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="district" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="certification" fill="#2563EB" name="FLN %" />
                  <Bar dataKey="completion" fill="#10B981" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Learning Trends</CardTitle>
              <CardDescription>Reading and math performance over the year</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={charts?.monthlyTrend ?? []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reading" stroke="#2563EB" strokeWidth={2} />
                  <Line type="monotone" dataKey="math" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="completion" stroke="#F59E0B" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subject">
          <Card>
            <CardHeader>
              <CardTitle>Subject Performance Radar</CardTitle>
              <CardDescription>Reading, math, completion per district</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="district" />
                  <PolarRadiusAxis />
                  <Radar name="FLN %" dataKey="certification" stroke="#2563EB" fill="#2563EB" fillOpacity={0.5} />
                  <Radar name="Completion %" dataKey="completion" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}