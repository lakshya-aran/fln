import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, School, Users, Lock } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import type { ISchool } from "@/types/stateadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SchoolDetailDialog } from "@/components/stateadmin/SchoolDetailDialog";

export function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-schools", search, district, status, page],
    queryFn: () => stateAdminApi.schools({ search, district, status, page, limit: 20 }),
  });

  const { data: districts } = useQuery({
    queryKey: ["stateadmin-districts-list"],
    queryFn: () => stateAdminApi.districts({ limit: 100 }),
  });

  const schools: ISchool[] = data?.schools ?? [];

  const certVariant = (c: number) => {
    if (c >= 60) return "success" as const;
    if (c >= 40) return "warning" as const;
    return "destructive" as const;
  };

  const statusVariant = (s: string) => {
    if (s === "complete") return "success" as const;
    if (s === "in_progress") return "info" as const;
    if (s === "locked") return "destructive" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Management"
        description="Search and monitor all schools in your state"
        breadcrumbs={[{ label: "Schools" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <School className="h-5 w-5" />
              All Schools ({data?.total ?? 0})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search schools..."
                  className="w-56 pl-9"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
              <Select value={district} onValueChange={(v) => { setDistrict(v); setPage(1); }}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="District" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Districts</SelectItem>
                  {districts?.districts?.map((d: any) => (
                    <SelectItem key={d.district} value={d.district}>{d.district}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="locked">Locked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : schools.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No schools found</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Block</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>FLN Cert</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Principal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow
                    key={s._id}
                    className="cursor-pointer"
                    onClick={() => setSelected(s._id)}
                  >
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.district}</TableCell>
                    <TableCell>{s.block}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {s.students}
                      </span>
                    </TableCell>
                    <TableCell>{s.assessmentCompletion}%</TableCell>
                    <TableCell>
                      <Badge variant={certVariant(s.flnCertification)}>
                        {s.flnCertification}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(s.completionStatus)}>
                        {s.completionStatus === "locked" && <Lock className="mr-1 h-3 w-3" />}
                        {s.completionStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.principal ? (
                        <div>
                          <p className="font-medium">{s.principal.name}</p>
                          <p className="text-gray-500">{s.principal.email}</p>
                          {!s.principal.isActive && (
                            <Badge variant="destructive" className="mt-1">Locked</Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">Not assigned</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
        <SchoolDetailDialog schoolId={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}