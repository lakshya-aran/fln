import { useQuery } from "@tanstack/react-query";
import { GitBranch, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stageIcons: Record<string, typeof GitBranch> = {
  assessment_conducted: Clock,
  uploaded: ArrowRight,
  scanning: ArrowRight,
  evaluation: ArrowRight,
  outcomes: ArrowRight,
  certified: CheckCircle2,
};

const stageColors: Record<string, string> = {
  assessment_conducted: "bg-yellow-100 text-yellow-800 border-yellow-300",
  uploaded: "bg-blue-100 text-blue-800 border-blue-300",
  scanning: "bg-indigo-100 text-indigo-800 border-indigo-300",
  evaluation: "bg-purple-100 text-purple-800 border-purple-300",
  outcomes: "bg-orange-100 text-orange-800 border-orange-300",
  certified: "bg-green-100 text-green-800 border-green-300",
};

export function PipelineDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["district-pipeline"],
    queryFn: () => districtAdminApi.pipeline(),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pipeline Dashboard"
        description="Track schools through the FLN assessment pipeline"
        breadcrumbs={[{ label: "Pipeline" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Schools</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data?.totalSchools ?? 0}</p>
            <p className="text-sm text-gray-500">in district</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{data?.totalInPipeline ?? 0}</p>
            <p className="text-sm text-gray-500">schools actively progressing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Not Started</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-400">{data?.notStarted ?? 0}</p>
            <p className="text-sm text-gray-500">schools not yet in pipeline</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {data?.pipeline?.map((stage) => {
          const Icon = stageIcons[stage.stage] || ArrowRight;
          return (
            <Card key={stage.stage}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <CardTitle className="text-base">{stage.label}</CardTitle>
                  </div>
                  <Badge variant="outline" className={stageColors[stage.stage]}>
                    {stage.count} schools
                  </Badge>
                </div>
              </CardHeader>
              {stage.schools.length > 0 && (
                <CardContent>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {stage.schools.slice(0, 6).map((s) => (
                      <div key={s.schoolId} className="rounded-md border bg-gray-50 p-2 text-sm">
                        <p className="font-medium">{s.school}</p>
                        <p className="text-xs text-gray-500">{s.block}</p>
                      </div>
                    ))}
                    {stage.schools.length > 6 && (
                      <p className="text-sm text-gray-400">+{stage.schools.length - 6} more</p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {!isLoading && data?.pipeline?.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              <GitBranch className="mx-auto mb-2 h-8 w-8" />
              <p>No pipeline data available</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
