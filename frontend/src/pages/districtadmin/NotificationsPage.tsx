import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const severityIcons = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const severityColors: Record<string, string> = {
  critical: "border-red-300 bg-red-50",
  warning: "border-yellow-300 bg-yellow-50",
  info: "border-blue-300 bg-blue-50",
};

export function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["district-notifications", typeFilter, severityFilter],
    queryFn: () => districtAdminApi.notifications({
      type: typeFilter !== "all" ? typeFilter : undefined,
      severity: severityFilter !== "all" ? severityFilter : undefined,
    }),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => districtAdminApi.markNotificationRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["district-notifications"] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: districtAdminApi.markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Alerts and updates for your district"
        breadcrumbs={[{ label: "Notifications" }]}
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bottleneck">Bottleneck</SelectItem>
              <SelectItem value="milestone">Milestone</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {data?.unreadCount ?? 0} unread
          </span>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => markAllReadMutation.mutate()}>
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : data?.notifications?.length === 0 ? (
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
                    className={`flex items-start justify-between rounded-md border p-4 ${n.read ? "opacity-60" : ""} ${severityColors[n.severity] || ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <SevIcon className={`mt-0.5 h-5 w-5 ${n.severity === "critical" ? "text-red-500" : n.severity === "warning" ? "text-yellow-500" : "text-blue-500"}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{n.title}</p>
                          <Badge variant="outline" className="text-xs">{n.type}</Badge>
                          <Badge variant="outline" className={`text-xs ${n.severity === "critical" ? "border-red-300 text-red-700" : n.severity === "warning" ? "border-yellow-300 text-yellow-700" : "border-blue-300 text-blue-700"}`}>
                            {n.severity}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{n.message}</p>
                        <p className="mt-1 text-xs text-gray-400">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {!n.read && (
                      <Button variant="ghost" size="sm" onClick={() => markReadMutation.mutate(n._id)}>
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
