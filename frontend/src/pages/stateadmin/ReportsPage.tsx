import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, FileText, Loader2 } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const REPORTS = [
  {
    type: "state-summary",
    title: "State Summary Report",
    description: "Overview of all key metrics for your state",
    icon: FileText,
  },
  {
    type: "district-report",
    title: "District Report",
    description: "Performance breakdown by district",
    icon: FileText,
  },
  {
    type: "school-report",
    title: "School Report",
    description: "Detailed school-level performance data",
    icon: FileText,
  },
  {
    type: "volunteer-report",
    title: "Volunteer Report",
    description: "Volunteer roster and activity status",
    icon: FileText,
  },
  {
    type: "assessment-report",
    title: "Assessment Report",
    description: "Assessment completion statistics",
    icon: FileText,
  },
  {
    type: "certification-report",
    title: "Certification Report",
    description: "FLN certification distribution",
    icon: FileText,
  },
];

export function ReportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const { toast } = useToast();

  const generateMutation = useMutation({
    mutationFn: async (type: string) => {
      setGenerating(type);
      const result = await stateAdminApi.generateReport(type);
      return result;
    },
    onSuccess: (result, type) => {
      if (result?.csv && result?.filename) {
        const blob = new Blob([result.csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = result.filename;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Report downloaded", variant: "success" });
      }
    },
    onError: () => toast({ title: "Failed to generate report", variant: "destructive" }),
    onSettled: () => setGenerating(null),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate and download comprehensive state reports"
        breadcrumbs={[{ label: "Reports" }]}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => {
          const Icon = report.icon;
          const isLoading = generating === report.type;
          return (
            <Card key={report.type}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                  <Icon className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center gap-2">
                  <Badge variant="outline">CSV</Badge>
                  <Badge variant="outline">Excel</Badge>
                </div>
                <Button
                  className="w-full"
                  onClick={() => generateMutation.mutate(report.type)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}