import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Calendar as CalendarIcon, Lock } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IAssessmentCalendar } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const CYCLE_LABELS = {
  baseline: "Baseline Assessment",
  "mid-year": "Mid-Year Assessment",
  "end-of-year": "End-of-Year Assessment",
};

export function AssessmentCalendarPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IAssessmentCalendar | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: calendars = [], isLoading } = useQuery({
    queryKey: ["superadmin-calendars"],
    queryFn: superadminApi.calendars,
  });

  const createMutation = useMutation({
    mutationFn: superadminApi.createCalendar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-calendars"] });
      setCreateOpen(false);
      toast({ title: "Calendar created", variant: "success" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => superadminApi.updateCalendar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-calendars"] });
      setEditTarget(null);
      toast({ title: "Calendar updated", variant: "success" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      cycle: fd.get("cycle"),
      academicYear: fd.get("academicYear"),
      label: fd.get("label"),
      description: fd.get("description"),
      startDate: new Date(fd.get("startDate") as string).toISOString(),
      endDate: new Date(fd.get("endDate") as string).toISOString(),
      resultDate: new Date(fd.get("resultDate") as string).toISOString(),
    });
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "published": return "success" as const;
      case "locked": return "destructive" as const;
      case "archived": return "secondary" as const;
      default: return "info" as const;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessment Calendar"
        description="National assessment cycles: Baseline, Mid-Year, and End-of-Year"
        breadcrumbs={[{ label: "Calendar" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {(["baseline", "mid-year", "end-of-year"] as const).map((cycle) => {
          const cycleCalendars = calendars.filter((c: IAssessmentCalendar) => c.cycle === cycle);
          const latest = cycleCalendars[0];
          return (
            <Card key={cycle}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarIcon className="h-5 w-5 text-primary-600" />
                  {CYCLE_LABELS[cycle]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {latest ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <p className="font-medium">{latest.label}</p>
                      <p className="text-gray-500">{latest.academicYear}</p>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>Start: {new Date(latest.startDate).toLocaleDateString()}</p>
                      <p>End: {new Date(latest.endDate).toLocaleDateString()}</p>
                      <p>Results: {new Date(latest.resultDate).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={statusVariant(latest.status)} className="mt-2">
                      {latest.status}
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No assessment scheduled</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : calendars.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No assessments yet. Create your first one.</p>
          ) : (
            <div className="space-y-3">
              {calendars.map((cal: IAssessmentCalendar) => (
                <div key={cal._id} className="flex items-center justify-between rounded-lg border bg-white p-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{cal.label}</p>
                      <Badge variant={statusVariant(cal.status)}>{cal.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {CYCLE_LABELS[cal.cycle]} · {cal.academicYear}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(cal.startDate).toLocaleDateString()} → {new Date(cal.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setEditTarget(cal)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={cal.status === "locked"}
                      onClick={() =>
                        updateMutation.mutate({
                          id: cal._id,
                          data: { status: cal.status === "locked" ? "published" : "locked" },
                        })
                      }
                      title="Lock/Unlock"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Assessment</DialogTitle>
            <DialogDescription>Schedule a new national assessment cycle</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium">Label</label>
              <Input name="label" required minLength={2} className="mt-1" placeholder="e.g. Baseline 2026-27" />
            </div>
            <div>
              <label className="text-sm font-medium">Cycle</label>
              <select name="cycle" required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="baseline">Baseline</option>
                <option value="mid-year">Mid-Year</option>
                <option value="end-of-year">End-of-Year</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Academic Year</label>
              <Input name="academicYear" required placeholder="2026-27" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Input name="startDate" type="date" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Input name="endDate" type="date" required className="mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Result Date</label>
              <Input name="resultDate" type="date" required className="mt-1" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" className="mt-1" />
            </div>
            <DialogFooter className="col-span-2">
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Assessment"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {editTarget && (
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Assessment</DialogTitle>
              <DialogDescription>{editTarget.label}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  defaultValue={editTarget.status}
                  onValueChange={(v) =>
                    updateMutation.mutate({ id: editTarget._id, data: { status: v } })
                  }
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={() => setEditTarget(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}