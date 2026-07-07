import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, UserCheck, CheckCircle2, XCircle, Filter } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const typeColors: Record<string, string> = {
  dropout: "border-red-300 bg-red-50 text-red-700",
  new_admission: "border-green-300 bg-green-50 text-green-700",
  missing_records: "border-yellow-300 bg-yellow-50 text-yellow-700",
};
const statusColors: Record<string, string> = {
  pending: "border-orange-300 bg-orange-50 text-orange-700",
  approved: "border-green-300 bg-green-50 text-green-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
};

export function StudentRegistrationsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    schoolId: "", school: "",
    registrationType: "new_admission" as "dropout" | "new_admission" | "missing_records",
    volunteerId: "", volunteerName: "",
    studentName: "", guardianName: "", guardianPhone: "",
    grade: 1, classSection: "", address: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["block-registrations", statusFilter, typeFilter],
    queryFn: () => blockAdminApi.registrations({
      status: statusFilter !== "all" ? statusFilter : undefined,
      registrationType: typeFilter !== "all" ? typeFilter : undefined,
    }),
  });
  const { data: schools } = useQuery({
    queryKey: ["block-schools-list"],
    queryFn: () => blockAdminApi.schools(),
  });
  const { data: volunteers } = useQuery({
    queryKey: ["block-volunteers-list"],
    queryFn: () => blockAdminApi.volunteers({ isActive: "true" }),
  });

  const createMutation = useMutation({
    mutationFn: blockAdminApi.createRegistration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-registrations"] });
      setOpen(false);
      toast({ title: "Student registration submitted" });
    },
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "approved" | "rejected" }) =>
      blockAdminApi.updateRegistration(id, {
        status: action,
        verificationStatus: action === "approved" ? "verified" : "rejected",
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["block-registrations"] });
      toast({ title: `Registration ${vars.action}` });
    },
  });

  const handleSchoolChange = (id: string) => {
    const s = schools?.find((x: any) => x.schoolId === id);
    if (s) setForm({ ...form, schoolId: s.schoolId, school: s.school });
  };
  const handleVolunteerChange = (id: string) => {
    const v = volunteers?.find(x => x._id === id);
    if (v) setForm({ ...form, volunteerId: v._id, volunteerName: v.name });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Registrations"
        description="Approve student registrations submitted by volunteers"
        breadcrumbs={[{ label: "Student Registrations" }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="dropout">Dropout</SelectItem>
              <SelectItem value="new_admission">New Admission</SelectItem>
              <SelectItem value="missing_records">Missing Records</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Registration</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Student Registration</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>School</Label>
                  <Select value={form.schoolId} onValueChange={handleSchoolChange}>
                    <SelectTrigger><SelectValue placeholder="School" /></SelectTrigger>
                    <SelectContent>
                      {schools?.map((s: any) => (
                        <SelectItem key={s.schoolId} value={s.schoolId}>{s.school}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={form.registrationType} onValueChange={(v: any) => setForm({ ...form, registrationType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dropout">Dropout</SelectItem>
                      <SelectItem value="new_admission">New Admission</SelectItem>
                      <SelectItem value="missing_records">Missing Records</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Volunteer</Label>
                <Select value={form.volunteerId} onValueChange={handleVolunteerChange}>
                  <SelectTrigger><SelectValue placeholder="Volunteer" /></SelectTrigger>
                  <SelectContent>
                    {volunteers?.map(v => (
                      <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Student Name</Label>
                  <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} />
                </div>
                <div>
                  <Label>Guardian Name</Label>
                  <Input value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>Grade</Label>
                  <Input type="number" min={1} max={8} value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Class</Label>
                  <Input value={form.classSection} onChange={(e) => setForm({ ...form, classSection: e.target.value })} />
                </div>
                <div>
                  <Label>Guardian Phone</Label>
                  <Input value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>
              <Button
                className="w-full"
                disabled={!form.schoolId || !form.studentName || !form.guardianName || !form.volunteerId}
                onClick={() => createMutation.mutate(form)}
              >
                Submit Registration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrations ({(data ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-gray-500">Loading...</p> : (data ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <UserCheck className="mx-auto mb-2 h-8 w-8" />
              <p>No registrations found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Student</th>
                    <th className="pb-2 font-medium">Type</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Grade</th>
                    <th className="pb-2 font-medium">Volunteer</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((r) => (
                    <tr key={r._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2">
                        <p className="font-medium">{r.studentName}</p>
                        <p className="text-xs text-gray-500">{r.guardianName}</p>
                      </td>
                      <td className="py-2">
                        <Badge variant="outline" className={typeColors[r.registrationType]}>
                          {r.registrationType?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs">{r.school}</td>
                      <td className="py-2">G{r.grade}-{r.classSection}</td>
                      <td className="py-2 text-xs">{r.volunteerName}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={statusColors[r.status]}>
                          {r.status}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {r.status === "pending" && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => approveMutation.mutate({ id: r._id, action: "approved" })}>
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => approveMutation.mutate({ id: r._id, action: "rejected" })}>
                              <XCircle className="h-3 w-3 text-red-600" />
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