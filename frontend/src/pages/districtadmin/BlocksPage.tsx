import { useQuery } from "@tanstack/react-query";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, School, Users, Award, TrendingUp, GitBranch, CheckCircle2 } from "lucide-react";

export function BlocksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["district-blocks"],
    queryFn: () => districtAdminApi.blocks({ sortBy: "flnCertification", order: "desc" }),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Blocks"
        description="View and manage blocks in your district"
        breadcrumbs={[{ label: "Blocks" }]}
      />

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data?.map((block) => (
            <Card key={block.block}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  {block.block}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-md bg-blue-50 p-2 text-center">
                    <School className="mx-auto mb-1 h-4 w-4 text-blue-500" />
                    <p className="text-lg font-bold">{block.schools}</p>
                    <p className="text-xs text-gray-500">Schools</p>
                  </div>
                  <div className="rounded-md bg-purple-50 p-2 text-center">
                    <Users className="mx-auto mb-1 h-4 w-4 text-purple-500" />
                    <p className="text-lg font-bold">{block.teachers}</p>
                    <p className="text-xs text-gray-500">Teachers</p>
                  </div>
                  <div className="rounded-md bg-green-50 p-2 text-center">
                    <Award className="mx-auto mb-1 h-4 w-4 text-green-500" />
                    <p className="text-lg font-bold">{block.flnCertification}%</p>
                    <p className="text-xs text-gray-500">FLN Cert</p>
                  </div>
                  <div className="rounded-md bg-orange-50 p-2 text-center">
                    <TrendingUp className="mx-auto mb-1 h-4 w-4 text-orange-500" />
                    <p className="text-lg font-bold">{block.assessmentCompletion}%</p>
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                  <div className="rounded-md bg-indigo-50 p-2 text-center">
                    <GitBranch className="mx-auto mb-1 h-4 w-4 text-indigo-500" />
                    <p className="text-lg font-bold">{block.inPipeline}</p>
                    <p className="text-xs text-gray-500">In Pipeline</p>
                  </div>
                  <div className="rounded-md bg-emerald-50 p-2 text-center">
                    <CheckCircle2 className="mx-auto mb-1 h-4 w-4 text-emerald-500" />
                    <p className="text-lg font-bold">{block.certified}</p>
                    <p className="text-xs text-gray-500">Certified</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reading Score</span>
                    <span className="font-medium">{block.readingScore}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Math Score</span>
                    <span className="font-medium">{block.mathScore}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
