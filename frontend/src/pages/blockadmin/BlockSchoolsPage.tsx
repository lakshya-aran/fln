import { useQuery } from "@tanstack/react-query";
import { Search, School, AlertCircle } from "lucide-react";
import { useState } from "react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

export function BlockSchoolsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { data, isLoading } = useQuery({
    queryKey: ["block-schools", status],
    queryFn: () => blockAdminApi.schools({ status: status !== "all" ? status : undefined }),
  });

  const filtered = (data ?? []).filter(s =>
    !search || s.school.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Schools" description="Schools in your block" breadcrumbs={[{ label: "Schools" }]} />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="complete">Complete</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Schools ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-gray-500">Loading...</p> : filtered.length === 0 ? (
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
                    <th className="pb-2 font-medium">FLN %</th>
                    <th className="pb-2 font-medium">Completion</th>
                    <th className="pb-2 font-medium">Reading</th>
                    <th className="pb-2 font-medium">Math</th>
                    <th className="pb-2 font-medium">Pipeline</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{s.school}</td>
                      <td className="py-2">
                        <span className={s.flnCertification < 40 ? "font-semibold text-red-600" : "font-semibold"}>
                          {s.flnCertification}%
                        </span>
                      </td>
                      <td className="py-2">{s.assessmentCompletion}%</td>
                      <td className="py-2">{s.readingScore}</td>
                      <td className="py-2">{s.mathScore}</td>
                      <td className="py-2 text-xs capitalize">{s.pipelineStage?.replace(/_/g, " ") || "-"}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                          {s.completionStatus}
                        </Badge>
                      </td>
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