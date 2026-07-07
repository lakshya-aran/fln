import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IAuditLog } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const [resource, setResource] = useState("");
  const [startDate, setStartDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-audit", page, action, resource, startDate],
    queryFn: () =>
      superadminApi.auditLogs({
        page,
        limit: 50,
        action: action || undefined,
        resource: resource || undefined,
        startDate: startDate || undefined,
      }),
  });

  const logs: IAuditLog[] = data?.logs || [];

  const actionColor = (a: string) => {
    if (a.includes("CREATE")) return "success" as const;
    if (a.includes("DELETE") || a.includes("DEACTIVATE")) return "destructive" as const;
    if (a.includes("UPDATE")) return "info" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Immutable record of all administrative actions"
        breadcrumbs={[{ label: "Audit Logs" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Audit Trail ({data?.total ?? 0})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={action} onValueChange={(v) => { setAction(v); setPage(1); }}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  <SelectItem value="CREATE_ADMIN">Create Admin</SelectItem>
                  <SelectItem value="UPDATE_ADMIN">Update Admin</SelectItem>
                  <SelectItem value="DEACTIVATE_ADMIN">Deactivate Admin</SelectItem>
                  <SelectItem value="RESET_ADMIN_PASSWORD">Reset Password</SelectItem>
                  <SelectItem value="CREATE_CALENDAR">Create Calendar</SelectItem>
                  <SelectItem value="UPDATE_CALENDAR">Update Calendar</SelectItem>
                  <SelectItem value="CREATE_CURRICULUM">Create Curriculum</SelectItem>
                  <SelectItem value="UPDATE_CURRICULUM">Update Curriculum</SelectItem>
                  <SelectItem value="RESTORE_CURRICULUM_VERSION">Restore Version</SelectItem>
                  <SelectItem value="CREATE_VISUAL_ASSET">Create Visual Asset</SelectItem>
                  <SelectItem value="REPLACE_VISUAL_ASSET">Replace Visual Asset</SelectItem>
                  <SelectItem value="UPDATE_QUESTION_REVIEW">Question Review</SelectItem>
                  <SelectItem value="UPDATE_FEEDBACK">Update Feedback</SelectItem>
                  <SelectItem value="CREATE_ANNOUNCEMENT">Create Announcement</SelectItem>
                  <SelectItem value="UPDATE_ANNOUNCEMENT">Update Announcement</SelectItem>
                  <SelectItem value="UNLOCK_SCHOOL">Unlock School</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{log.user}</p>
                      <p className="text-xs text-gray-500 capitalize">{log.userRole.replace(/_/g, " ")}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{log.resource}</p>
                      {log.resourceId && (
                        <p className="text-xs text-gray-400">{log.resourceId.slice(-8)}</p>
                      )}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">{log.description}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ip || "—"}</TableCell>
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
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {data.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}