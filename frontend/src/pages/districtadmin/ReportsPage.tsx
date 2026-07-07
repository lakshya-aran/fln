import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function ReportsPage() {
  const [reportType, setReportType] = useState("performance-summary");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["district-report", reportType],
    queryFn: () => districtAdminApi.reports(reportType),
    enabled: false,
  });

  const handleGenerate = () => refetch();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and view district performance reports"
        breadcrumbs={[{ label: "Reports" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select a report type and generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="performance-summary">Performance Summary</SelectItem>
                  <SelectItem value="bottleneck-report">Bottleneck Report</SelectItem>
                  <SelectItem value="block-comparison">Block Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} className="gap-2">
              <Download className="h-4 w-4" /> Generate
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-gray-500">Generating report...</p>}

      {data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {data.reportType}
            </CardTitle>
            <CardDescription>
              Generated for {data.district} at {new Date(data.generatedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-sm">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
