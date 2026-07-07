import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, School } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const pipelineLabels: Record<string, string> = {
  assessment_conducted: "Assessment Conducted",
  uploaded: "Uploaded",
  scanning: "Scanning",
  evaluation: "Evaluation",
  outcomes: "Outcomes",
  certified: "Certified",
};

export function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["district-schools", blockFilter, stageFilter],
    queryFn: () => districtAdminApi.schools({
      block: blockFilter !== "all" ? blockFilter : undefined,
      stage: stageFilter !== "all" ? stageFilter : undefined,
    }),
  });

  const filtered = (data ?? []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.school.toLowerCase().includes(search.toLowerCase()) ||
    s.block.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="View schools in your district"
        breadcrumbs={[{ label: "Schools" }]}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search schools..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={blockFilter} onValueChange={setBlockFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blocks</SelectItem>
            <SelectItem value="Haveli">Haveli</SelectItem>
            <SelectItem value="Mulshi">Mulshi</SelectItem>
            <SelectItem value="Khed">Khed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Pipeline Stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="assessment_conducted">Assessment Conducted</SelectItem>
            <SelectItem value="uploaded">Uploaded</SelectItem>
            <SelectItem value="scanning">Scanning</SelectItem>
            <SelectItem value="evaluation">Evaluation</SelectItem>
            <SelectItem value="outcomes">Outcomes</SelectItem>
            <SelectItem value="certified">Certified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schools ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <School className="mx-auto mb-2 h-8 w-8" />
              <p>No schools found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Block</th>
                    <th className="pb-2 font-medium">Pipeline Stage</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Days in Stage</th>
                    <th className="pb-2 font-medium">Reading</th>
                    <th className="pb-2 font-medium">Math</th>
                    <th className="pb-2 font-medium">FLN %</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{s.school || s.name}</td>
                      <td className="py-2">{s.block}</td>
                      <td className="py-2">
                        {s.pipelineStage ? pipelineLabels[s.pipelineStage] ?? s.pipelineStage : "-"}
                      </td>
                      <td className="py-2">
                        <Badge
                          variant="outline"
                          className={
                            s.completionStatus === "complete" ? "border-green-300 bg-green-50 text-green-700"
                            : s.completionStatus === "in_progress" ? "border-blue-300 bg-blue-50 text-blue-700"
                            : s.completionStatus === "locked" ? "border-red-300 bg-red-50 text-red-700"
                            : "border-gray-300 bg-gray-50 text-gray-700"
                          }
                        >
                          {s.completionStatus}
                        </Badge>
                      </td>
                      <td className="py-2">{s.daysInCurrentStage ?? 0}d</td>
                      <td className="py-2">{s.readingScore}</td>
                      <td className="py-2">{s.mathScore}</td>
                      <td className="py-2">{s.flnCertification}%</td>
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
