import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, UserPlus, CheckCircle2, AlertCircle, Filter } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const stageColors: Record<string, string> = {
  available: "border-gray-300 bg-gray-50 text-gray-700",
  schools_listed: "border-blue-300 bg-blue-50 text-blue-700",
  accepted: "border-blue-300 bg-blue-50 text-blue-700",
  locked: "border-purple-300 bg-purple-50 text-purple-700",
  principal_notified: "border-indigo-300 bg-indigo-50 text-indigo-700",
  visit: "border-orange-300 bg-orange-50 text-orange-700",
  uploaded: "border-yellow-300 bg-yellow-50 text-yellow-700",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

export function AssignmentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    volunteerId: "", volunteerName: "", volunteerEmail: "",
    school: "", schoolId: "", availability: "weekday", notes: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["block-assignments", statusFilter],
    queryFn: () => blockAdminApi.assignments({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });
  const { data: volunteers } = useQuery({
    queryKey: ["block-volunteers-list"],
    queryFn: () => blockAdminApi.volunteers({ isActive: "true" }),
  });
  const { data: nearbySchools } = useQuery({
    queryKey: ["block-nearby-schools"],
    queryFn: blockAdminApi.nearbySchools,
  });

  const assignMutation = useMutation({
    mutationFn: blockAdminApi.assignVolunteer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["block-volunteers-list"] });
      setOpen(false);
      setForm({ volunteerId: "", volunteerName: "", volunteerEmail: "", school: "", schoolId: "", availability: "weekday", notes: "" });
      toast({ title: "Volunteer assigned successfully" });
    },
    onError: (e: any) => toast({ title: e?.response?.data?.message || "Failed to assign volunteer", variant: "destructive" }),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => blockAdminApi.updateAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-assignments"] });
      toast({ title: "Assignment updated" });
    },
  });

  const handleVolunteerChange = (id: string) => {
    const v = volunteers?.find(x => x._id === id);
    if (v) setForm({ ...form, volunteerId: v._id, volunteerName: v.name, volunteerEmail: v.email });
  };
  const handleSchoolChange = (id: string) => {
    const s = nearbySchools?.find(x => x.schoolId === id);
    if (s) setForm({ ...form, school: s.school, schoolId: s.schoolId });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Volunteer Assignments"
        description="Assign volunteers to schools and track assignment progress"
        breadcrumbs={[{ label: "Assignments" }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="assignment_accepted">Accepted</SelectItem>
              <SelectItem value="slot_locked">Slot Locked</SelectItem>
              <SelectItem value="on_duty">On Duty</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Assignment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Volunteer to School</DialogTitle>
              <DialogDescription>Create a new assignment</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Volunteer</Label>
                <Select value={form.volunteerId} onValueChange={handleVolunteerChange}>
                  <SelectTrigger><SelectValue placeholder="Choose volunteer" /></SelectTrigger>
                  <SelectContent>
                    {volunteers?.filter(v => v.status === "available" || v.status === "offline").map((v) => (
                      <SelectItem key={v._id} value={v._id}>{v.name} ({v.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>School</Label>
                <Select value={form.schoolId} onValueChange={handleSchoolChange}>
                  <SelectTrigger><SelectValue placeholder="Choose school" /></SelectTrigger>
                  <SelectContent>
                    {nearbySchools?.map((s: any) => (
                      <SelectItem key={s.schoolId} value={s.schoolId}>{s.school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Availability</Label>
                <Select value={form.availability} onValueChange={(v) => setForm({ ...form, availability: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekday">Weekdays</SelectItem>
                    <SelectItem value="weekend">Weekends</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button
                className="w-full"
                disabled={!form.volunteerId || !form.schoolId}
                onClick={() => assignMutation.mutate(form)}
              >
                Create Assignment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assignments ({(assignments ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (assignments ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <UserPlus className="mx-auto mb-2 h-8 w-8" />
              <p>No assignments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Volunteer</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Stage</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Reliability</th>
                    <th className="pb-2 font-medium">Assigned</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments?.map((a) => (
                    <tr key={a._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{a.volunteerName}</td>
                      <td className="py-2">{a.school}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={stageColors[a.assignmentStage] || "border-gray-300"}>
                          {a.assignmentStage?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                          {a.status?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2">{a.reliabilityScore}%</td>
                      <td className="py-2 text-xs">{new Date(a.assignedAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        {a.status !== "completed" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => updateStageMutation.mutate({ id: a._id, data: { assignmentStage: "on_duty", status: "on_duty" } })}>
                              <CheckCircle2 className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => updateStageMutation.mutate({ id: a._id, data: { status: "completed" } })}>
                              Done
                            </Button>
                          </div>
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