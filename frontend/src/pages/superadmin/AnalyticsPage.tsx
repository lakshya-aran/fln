import { useQuery } from "@tanstack/react-query";
import { Download, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { superadminApi } from "@/services/superadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const STATE_COMPARISON = [
  { state: "UP", reading: 62, math: 58, completion: 78 },
  { state: "MP", reading: 58, math: 54, completion: 72 },
  { state: "RJ", reading: 65, math: 60, completion: 81 },
  { state: "BR", reading: 55, math: 50, completion: 68 },
  { state: "GJ", reading: 70, math: 67, completion: 85 },
  { state: "TN", reading: 68, math: 64, completion: 79 },
  { state: "MH", reading: 64, math: 61, completion: 76 },
  { state: "KA", reading: 72, math: 68, completion: 82 },
];

const LEARNING_TRENDS = [
  { month: "Jan", reading: 45, math: 40 },
  { month: "Feb", reading: 48, math: 43 },
  { month: "Mar", reading: 52, math: 47 },
  { month: "Apr", reading: 55, math: 50 },
  { month: "May", reading: 58, math: 54 },
  { month: "Jun", reading: 62, math: 58 },
];

const CLASS_TRENDS = [
  { class: "Class 1", score: 45 },
  { class: "Class 2", score: 52 },
  { class: "Class 3", score: 58 },
  { class: "Class 4", score: 62 },
  { class: "Class 5", score: 65 },
];

export function AnalyticsPage() {
  const { data: analytics } = useQuery({
    queryKey: ["superadmin-analytics"],
    queryFn: superadminApi.analytics,
  });

  const downloadReport = (type: string) => {
    const csv = `Report,Value\nGenerated,${new Date().toISOString()}\nType,${type}\n`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${type}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const feedbackByCategory: Record<string, number> = analytics?.feedback?.byCategory || {};
  const feedbackCategoryData = Object.entries(feedbackByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nationwide Analytics"
        description="Comprehensive analytics across all states and demographics"
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <Button variant="outline" onClick={() => downloadReport("analytics")}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>User Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Active", value: analytics?.users?.active ?? 0 },
                        { name: "Inactive", value: analytics?.users?.inactive ?? 0 },
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {[0, 1].map((i) => (
                        <Cell key={i} fill={COLORS[i]} />
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
                <CardTitle>Question Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={Object.entries(analytics?.questions?.byStatus || {}).map(([name, value]) => ({ name, value }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#2563EB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={feedbackCategoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label
                    >
                      {feedbackCategoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                State Comparison - Reading & Math
              </CardTitle>
              <CardDescription>Performance across major states</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={STATE_COMPARISON}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="state" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="reading" fill="#2563EB" />
                  <Bar dataKey="math" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Class-wise Performance</CardTitle>
              <CardDescription>Average scores by class</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={CLASS_TRENDS}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="class" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Trends</CardTitle>
              <CardDescription>Reading and math outcomes over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={LEARNING_TRENDS}>
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
        </TabsContent>
      </Tabs>
    </div>
  );
}