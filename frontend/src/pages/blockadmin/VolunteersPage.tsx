import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, Filter, CheckCircle2, XCircle, Briefcase } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const statusColors: Record<string, string> = {
  available: "border-green-300 bg-green-50 text-green-700",
  offline: "border-gray-300 bg-gray-50 text-gray-700",
  assignment_offered: "border-blue-300 bg-blue-50 text-blue-700",
  assignment_accepted: "border-blue-300 bg-blue-50 text-blue-700",
  slot_locked: "border-purple-300 bg-purple-50 text-purple-700",
  on_duty: "border-orange-300 bg-orange-50 text-orange-700",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

export function VolunteersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["block-volunteers", statusFilter, activeFilter],
    queryFn: () => blockAdminApi.volunteers({
      status: statusFilter !== "all" ? statusFilter : undefined,
      isActive: activeFilter !== "all" ? activeFilter : undefined,
    }),
  });

  const filtered = (data ?? []).filter(v =>
    !search || v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.email.toLowerCase().includes(search.toLowerCase()) ||
    v.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Management"
        description="Manage volunteers in your block"
        breadcrumbs={[{ label: "Volunteers" }]}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search volunteers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="assignment_offered">Assignment Offered</SelectItem>
              <SelectItem value="assignment_accepted">Assignment Accepted</SelectItem>
              <SelectItem value="slot_locked">Slot Locked</SelectItem>
              <SelectItem value="on_duty">On Duty</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={activeFilter} onValueChange={setActiveFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Active" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volunteers ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <p>No volunteers found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Reliability</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Assignments</th>
                    <th className="pb-2 font-medium">Current</th>
                    <th className="pb-2 font-medium">Active</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr key={v._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{v.name}</td>
                      <td className="py-2 text-xs">{v.email}</td>
                      <td className="py-2">
                        <span className="font-semibold">{v.reliabilityScore}%</span>
                      </td>
                      <td className="py-2">
                        <Badge variant="outline" className={statusColors[v.status] || "border-gray-300 bg-gray-50"}>
                          {v.status?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2">{v.completedCount}/{v.assignmentCount}</td>
                      <td className="py-2 text-xs">
                        {v.currentAssignment ? (
                          <div className="flex items-center gap-1">
                            <Briefcase className="h-3 w-3" />
                            {v.currentAssignment.school}
                          </div>
                        ) : "-"}
                      </td>
                      <td className="py-2">
                        {v.isActive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
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