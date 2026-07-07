import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Mail, Download, Bell } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import type { ILowPerformingDistrict } from "@/types/stateadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export function LowPerformancePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-low-performing"],
    queryFn: stateAdminApi.lowPerformingDistricts,
  });
  const { toast } = useToast();

  const districts: ILowPerformingDistrict[] = data?.districts ?? [];

  const notifyMutation = useMutation({
    mutationFn: async (district: string) => {
      await new Promise(r => setTimeout(r, 600));
      return district;
    },
    onSuccess: (district) =>
      toast({ title: `Notification sent to ${district} district admin`, variant: "success" }),
  });

  const exportReport = () => {
    if (!districts.length) return;
    const csv = "District,Certification %,Assessment Completion,Schools,Pending Schools,Total Students,Total Teachers,Priority,Suggested Action\n" +
      districts.map(d =>
        `${d.district},${d.certification},${d.assessmentCompletion},${d.schools},${d.pendingSchools},${d.totalStudents},${d.totalTeachers},${d.priority},"${d.suggestedAction}"`
      ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `low-performing-districts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report exported", variant: "success" });
  };

  const priorityColor = (p: string) => {
    if (p === "critical") return "destructive" as const;
    if (p === "high") return "warning" as const;
    return "info" as const;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Performance Monitoring"
        description="Districts with FLN Certification below 40%"
        breadcrumbs={[{ label: "Low Performance" }]}
        actions={
          <Button variant="outline" onClick={exportReport} disabled={!districts.length}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Critical Districts ({data?.total ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : districts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <Bell className="mb-2 h-8 w-8 text-green-500" />
              <p className="font-medium text-green-700">All districts performing well!</p>
              <p className="text-xs">No districts below 40% FLN certification</p>
            </div>
          ) : (
            <div className="space-y-4">
              {districts.map((d) => (
                <div key={d.district} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{d.district}</h3>
                        <Badge variant={priorityColor(d.priority)}>
                          {d.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="destructive">{d.certification}% FLN</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                        <div>
                          <p className="text-gray-500">Assessment</p>
                          <p className="font-medium">{d.assessmentCompletion}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Schools</p>
                          <p className="font-medium">{d.schools}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pending Schools</p>
                          <p className="font-medium text-red-600">{d.pendingSchools}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Students</p>
                          <p className="font-medium">{d.totalStudents}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Teachers</p>
                          <p className="font-medium">{d.totalTeachers}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-md bg-blue-50 p-2 text-xs text-blue-900">
                        <p className="font-medium">Recommended Action</p>
                        <p>{d.suggestedAction}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => notifyMutation.mutate(d.district)}
                        disabled={notifyMutation.isPending}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Notify Admin
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}