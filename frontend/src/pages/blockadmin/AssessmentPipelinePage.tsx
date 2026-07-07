import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GitBranch, Clock, CheckCircle2, Loader, Truck, BookOpen, Award } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stages = [
  { key: "question_generated", label: "Question Generated", icon: BookOpen },
  { key: "printed", label: "Printed", icon: CheckCircle2 },
  { key: "delivered", label: "Delivered", icon: Truck },
  { key: "exam_conducted", label: "Exam Conducted", icon: GitBranch },
  { key: "answer_uploaded", label: "Answer Uploaded", icon: Loader },
  { key: "evaluation", label: "Evaluation", icon: Clock },
  { key: "certification", label: "Certification", icon: Award },
];

export function AssessmentPipelinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["block-assessment-pipeline"],
    queryFn: blockAdminApi.assessmentPipeline,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Pipeline"
        description="Track assessment progress and identify delays"
        breadcrumbs={[{ label: "Assessment Pipeline" }]}
      />

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const stageData = data?.pipeline?.find(p => p.stage === stage.key);
            const count = stageData?.count ?? 0;
            return (
              <Card key={stage.key} className={count === 0 ? "opacity-60" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <CardTitle className="flex items-center gap-2 text-base">
                        Stage {i + 1}: {stage.label}
                      </CardTitle>
                    </div>
                    <Badge variant="outline">{count} schedules</Badge>
                  </div>
                </CardHeader>
                {count > 0 && stageData?.schedules && stageData.schedules.length > 0 && (
                  <CardContent>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {stageData.schedules.slice(0, 4).map((s) => (
                        <div key={s.id} className={`rounded-md border p-2 text-sm ${s.daysOverdue > 0 ? "border-red-300 bg-red-50" : "border-blue-300 bg-blue-50"}`}>
                          <p className="font-medium">{s.school}</p>
                          <p className="text-xs text-gray-600">
                            {s.subject} G{s.grade} • {new Date(s.scheduledDate).toLocaleDateString()}
                          </p>
                          {s.daysOverdue > 0 && (
                            <p className="mt-1 text-xs font-semibold text-red-600">
                              Overdue by {s.daysOverdue}d
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}