import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingDown, TrendingUp } from "lucide-react";

export function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["district-analytics"],
    queryFn: districtAdminApi.analytics,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="In-depth performance analysis for your district"
        breadcrumbs={[{ label: "Analytics" }]}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Block-wise Performance</CardTitle>
            <CardDescription>Average scores by block</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.blockWise ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="block" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgReading" fill="#2563EB" name="Reading" />
                <Bar dataKey="avgMath" fill="#10B981" name="Math" />
                <Bar dataKey="avgCertification" fill="#F59E0B" name="Certification" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Schools</CardTitle>
            <CardDescription>Schools with highest FLN certification</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-gray-500">Loading...</p> : (
              <div className="space-y-3">
                {data?.topPerformers?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium">{s.school}</p>
                        <p className="text-xs text-gray-500">{s.block}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1"><Award className="h-4 w-4 text-emerald-500" /> {s.flnCertification}%</span>
                      <span className="text-gray-400">R:{s.readingScore} M:{s.mathScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Performing Schools</CardTitle>
            <CardDescription>Schools below 40% FLN certification</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <p className="text-gray-500">Loading...</p> : (
              <div className="space-y-3">
                {data?.lowPerformingSchools?.map((s, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 p-3">
                    <div>
                      <p className="font-medium">{s.school}</p>
                      <p className="text-xs text-gray-500">{s.block}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-red-600">{s.flnCertification}%</span>
                      <span className="text-gray-400">R:{s.readingScore} M:{s.mathScore}</span>
                    </div>
                  </div>
                ))}
                {(!data?.lowPerformingSchools || data.lowPerformingSchools.length === 0) && (
                  <p className="text-gray-500">No low-performing schools</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volunteer Distribution</CardTitle>
            <CardDescription>Volunteers across blocks</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data?.volunteerDistribution ?? []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="block" type="category" width={80} />
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
