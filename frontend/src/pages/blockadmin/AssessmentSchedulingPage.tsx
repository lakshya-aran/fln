import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, Lock, Filter } from "lucide-react";
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

const statusColors: Record<string, string> = {
  scheduled: "border-blue-300 bg-blue-50 text-blue-700",
  confirmed: "border-green-300 bg-green-50 text-green-700",
  completed: "border-emerald-300 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-300 bg-red-50 text-red-700",
};

export function AssessmentSchedulingPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    schoolId: "", school: "",
    subject: "math" as "english" | "hindi" | "math" | "regional",
    grade: 2, scheduledDate: "", session: "morning" as "morning" | "afternoon" | "full_day",
    volunteerId: "", notes: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["block-schedules", statusFilter],
    queryFn: () => blockAdminApi.schedules({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });
  const { data: schools } = useQuery({
    queryKey: ["block-schools-list"],
    queryFn: () => blockAdminApi.schools(),
  });
  const { data: volunteers } = useQuery({
    queryKey: ["block-volunteers-list"],
    queryFn: () => blockAdminApi.volunteers({ isActive: "true" }),
  });

  const scheduleMutation = useMutation({
    mutationFn: blockAdminApi.scheduleAssessment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-schedules"] });
      setOpen(false);
      setForm({ schoolId: "", school: "", subject: "math", grade: 2, scheduledDate: "", session: "morning", volunteerId: "", notes: "" });
      toast({ title: "Assessment scheduled and locked" });
    },
    onError: (e: any) => toast({ title: e?.response?.data?.message || "Failed to schedule", variant: "destructive" }),
  });

  const handleSchoolChange = (id: string) => {
    const s = schools?.find((x: any) => x.schoolId === id);
    if (s) setForm({ ...form, schoolId: s.schoolId, school: s.school });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Scheduling"
        description="Schedule assessments and lock the calendar"
        breadcrumbs={[{ label: "Assessment Schedule" }]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Schedule Assessment</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule Assessment</DialogTitle>
              <DialogDescription>Schedule will be locked once created</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>School</Label>
                <Select value={form.schoolId} onValueChange={handleSchoolChange}>
                  <SelectTrigger><SelectValue placeholder="Choose school" /></SelectTrigger>
                  <SelectContent>
                    {schools?.map((s: any) => (
                      <SelectItem key={s.schoolId} value={s.schoolId}>{s.school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={(v: any) => setForm({ ...form, subject: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Input type="number" min={1} max={8} value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} />
                </div>
                <div>
                  <Label>Session</Label>
                  <Select value={form.session} onValueChange={(v: any) => setForm({ ...form, session: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="full_day">Full Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Volunteer (optional)</Label>
                <Select value={form.volunteerId} onValueChange={(v) => setForm({ ...form, volunteerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {volunteers?.map(v => (
                      <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button
                className="w-full"
                disabled={!form.schoolId || !form.scheduledDate}
                onClick={() => scheduleMutation.mutate(form)}
              >
                Schedule & Lock
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedules ({(data ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (data ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Calendar className="mx-auto mb-2 h-8 w-8" />
              <p>No schedules yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Subject/Grade</th>
                    <th className="pb-2 font-medium">Session</th>
                    <th className="pb-2 font-medium">Volunteer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Locked</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 text-xs">{new Date(s.scheduledDate).toLocaleDateString()}</td>
                      <td className="py-2">{s.school}</td>
                      <td className="py-2 capitalize">{s.subject} G{s.grade}</td>
                      <td className="py-2 capitalize">{s.session?.replace(/_/g, " ")}</td>
                      <td className="py-2 text-xs">{s.volunteerName || "-"}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={statusColors[s.status] || "border-gray-300"}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {s.locked && <Lock className="h-4 w-4 text-red-500" />}
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