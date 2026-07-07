import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, Users, Award, ChevronRight } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import type { IDistrictRow } from "@/types/stateadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DistrictDetailDialog } from "@/components/stateadmin/DistrictDetailDialog";

export function DistrictsPage() {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("flnCertification");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-districts", search, sortBy, order, page],
    queryFn: () => stateAdminApi.districts({ search, sortBy, order, page, limit: 20 }),
  });

  const districts: IDistrictRow[] = data?.districts ?? [];

  const certVariant = (c: number) => {
    if (c >= 60) return "success" as const;
    if (c >= 40) return "warning" as const;
    return "destructive" as const;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Management"
        description="Monitor and manage all districts in your state"
        breadcrumbs={[{ label: "Districts" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Districts ({data?.total ?? 0})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search districts..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="w-56 pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flnCertification">FLN Certification</SelectItem>
                  <SelectItem value="assessmentCompletion">Assessment Completion</SelectItem>
                  <SelectItem value="schools">Schools</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="teachers">Teachers</SelectItem>
                </SelectContent>
              </Select>
              <Select value={order} onValueChange={(v) => setOrder(v as "asc" | "desc")}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">High to Low</SelectItem>
                  <SelectItem value="asc">Low to High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : districts.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No districts found</p>
          ) : (
            <div className="divide-y">
              {districts.map((d) => (
                <div
                  key={d.district}
                  className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{d.district}</h3>
                      <Badge variant={certVariant(d.flnCertification)}>
                        {d.flnCertification}% FLN
                      </Badge>
                      {d.flnCertification < 40 && (
                        <Badge variant="destructive">Needs Attention</Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {d.schools} schools
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {d.teachers} teachers
                      </span>
                      <span>{d.students} students</span>
                      <span>{d.volunteers} volunteers</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      Admin: {d.districtAdmin ? `${d.districtAdmin.name} (${d.districtAdmin.email})` : "Not assigned"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Completion</p>
                    <p className="text-lg font-bold">{d.assessmentCompletion}%</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelected(d.district)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <span className="text-sm">Page {page} of {data.totalPages}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {selected && (
        <DistrictDetailDialog district={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}