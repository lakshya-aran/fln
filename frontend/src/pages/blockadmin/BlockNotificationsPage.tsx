import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, CheckCheck, Info, AlertTriangle, AlertCircle, Filter } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const severityIcons = { critical: AlertCircle, warning: AlertTriangle, info: Info };
const severityBg: Record<string, string> = {
  critical: "border-red-300 bg-red-50",
  warning: "border-yellow-300 bg-yellow-50",
  info: "border-blue-300 bg-blue-50",
};

export function BlockNotificationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    type: "reminder" as "reminder" | "assessment" | "printing_ready" | "assignment" | "emergency" | "milestone" | "system",
    targetRole: "all" as "schools" | "teachers" | "volunteers" | "principals" | "all",
    title: "", message: "", severity: "info" as "info" | "warning" | "critical",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["block-notifications", typeFilter, severityFilter],
    queryFn: () => blockAdminApi.notifications({
      type: typeFilter !== "all" ? typeFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: blockAdminApi.createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-notifications"] });
      setOpen(false);
      setForm({ type: "reminder", targetRole: "all", title: "", message: "", severity: "info" });
      toast({ title: "Notification sent" });
    },
  });

  const markRead = useMutation({
    mutationFn: (id: string) => blockAdminApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["block-notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: blockAdminApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-notifications"] });
      toast({ title: "All marked as read" });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Send alerts and view history"
        breadcrumbs={[{ label: "Notifications" }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="assessment">Assessment</SelectItem>
              <SelectItem value="printing_ready">Printing Ready</SelectItem>
              <SelectItem value="assignment">Assignment</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">{data?.unreadCount ?? 0} unread</span>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllRead.mutate()}>
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2"><Plus className="h-4 w-4" /> Send</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reminder">Reminder</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="printing_ready">Printing Ready</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                      <SelectItem value="milestone">Milestone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target</Label>
                  <Select value={form.targetRole} onValueChange={(v: any) => setForm({ ...form, targetRole: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="schools">Schools</SelectItem>
                      <SelectItem value="teachers">Teachers</SelectItem>
                      <SelectItem value="volunteers">Volunteers</SelectItem>
                      <SelectItem value="principals">Principals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div>
                  <Label>Message</Label>
                  <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v: any) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  disabled={!form.title || !form.message}
                  onClick={() => createMutation.mutate(form)}
                >
                  Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-gray-500">Loading...</p> : (data?.notifications ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Bell className="mx-auto mb-2 h-8 w-8" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data?.notifications?.map((n) => {
                const SevIcon = severityIcons[n.severity] || Info;
                return (
                  <div
                    key={n._id}
                    className={`flex items-start justify-between rounded-md border p-4 ${n.read ? "opacity-60" : ""} ${severityBg[n.severity] || ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <SevIcon className={`mt-0.5 h-5 w-5 ${n.severity === "critical" ? "text-red-500" : n.severity === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{n.title}</p>
                          <Badge variant="outline" className="text-xs">{n.type}</Badge>
                          <Badge variant="outline" className="text-xs">{n.targetRole}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                        <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markRead.mutate(n._id)}>
                        <CheckCheck className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}