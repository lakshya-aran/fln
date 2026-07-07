import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, AlertCircle, Filter } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export function BottlenecksPage() {
  const [severityFilter, setSeverityFilter] = useState("all");
  const [blockFilter, setBlockFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["district-bottlenecks", severityFilter, blockFilter],
    queryFn: () => districtAdminApi.bottlenecks({
      severity: severityFilter !== "all" ? severityFilter : undefined,
      block: blockFilter !== "all" ? blockFilter : undefined,
    }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bottleneck Detection"
        description="Schools delayed in pipeline stages that need attention"
        breadcrumbs={[{ label: "Bottlenecks" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{data?.totalDelayed ?? 0}</p>
            <p className="text-sm text-gray-500">7-14 days in same stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Critical
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{data?.totalCritical ?? 0}</p>
            <p className="text-sm text-gray-500">14+ days in same stage</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Bottlenecks</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.total ?? 0}</p>
            <p className="text-sm text-gray-500">schools needing attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Filters:</span>
        </div>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severities</SelectItem>
            <SelectItem value="delayed">Delayed</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={blockFilter} onValueChange={setBlockFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blocks</SelectItem>
            <SelectItem value="Haveli">Haveli</SelectItem>
            <SelectItem value="Mulshi">Mulshi</SelectItem>
            <SelectItem value="Khed">Khed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bottleneck Schools</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : data?.bottlenecks?.length === 0 ? (
            <p className="text-gray-500">No bottlenecks found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Block</th>
                    <th className="pb-2 font-medium">Stage</th>
                    <th className="pb-2 font-medium">Days</th>
                    <th className="pb-2 font-medium">Severity</th>
                    <th className="pb-2 font-medium">Reading</th>
                    <th className="pb-2 font-medium">Math</th>
                    <th className="pb-2 font-medium">FLN %</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.bottlenecks?.map((b) => (
                    <tr key={b.schoolId} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{b.school}</td>
                      <td className="py-2">{b.block}</td>
                      <td className="py-2 capitalize">{b.stage?.replace(/_/g, " ")}</td>
                      <td className="py-2">{b.daysInStage}d</td>
                      <td className="py-2">
                        <Badge
                          variant="outline"
                          className={b.severity === "critical" ? "border-red-300 bg-red-50 text-red-700" : "border-yellow-300 bg-yellow-50 text-yellow-700"}
                        >
                          {b.severity}
                        </Badge>
                      </td>
                      <td className="py-2">{b.readingScore}</td>
                      <td className="py-2">{b.mathScore}</td>
                      <td className="py-2">{b.flnCertification}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
