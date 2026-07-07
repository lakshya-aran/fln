import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Download } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const REPORT_TYPES = [
  { value: "volunteer", label: "Volunteer Report" },
  { value: "school", label: "School Report" },
  { value: "assessment", label: "Assessment Report" },
  { value: "question-paper", label: "Question Paper Report" },
  { value: "printing", label: "Printing Report" },
  { value: "student-registration", label: "Student Registration Report" },
  { value: "infrastructure", label: "Infrastructure Report" },
];

export function BlockReportsPage() {
  const [reportType, setReportType] = useState("volunteer");
  const [format, setFormat] = useState<"json" | "csv">("json");

  const { data, isLoading, refetch, isFetching } = useQuery<IReportData>({
    queryKey: ["block-report", reportType],
    queryFn: () => blockAdminApi.generateReport(reportType) as Promise<IReportData>,
    enabled: false,
  });

  const downloadCSV = async () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const res = await fetch(`http://localhost:5000/api/v1/block/reports?type=${reportType}&format=csv`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${reportType}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and export reports for your block"
        breadcrumbs={[{ label: "Reports" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Choose a report type and generate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <label className="mb-1 block text-sm font-medium">Format</label>
              <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <Download className="h-4 w-4" /> Generate
            </Button>
            {format === "csv" && (
              <Button variant="outline" onClick={downloadCSV} className="gap-2">
                <Download className="h-4 w-4" /> Download CSV
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && <p className="text-gray-500">Generating...</p>}
      {data && format === "json" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {data.reportType}
            </CardTitle>
            <CardDescription>Generated for {data.block} at {new Date(data.generatedAt as string).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-4 text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}