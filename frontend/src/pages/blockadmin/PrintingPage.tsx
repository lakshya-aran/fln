import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Printer, Filter, Truck, CheckCircle2 } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const statusFlow = ["pending", "in_progress", "ready", "delivered", "collected"];
const statusColors: Record<string, string> = {
  pending: "border-yellow-300 bg-yellow-50 text-yellow-700",
  in_progress: "border-blue-300 bg-blue-50 text-blue-700",
  ready: "border-purple-300 bg-purple-50 text-purple-700",
  delivered: "border-green-300 bg-green-50 text-green-700",
  collected: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

export function PrintingPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["block-print-requests", statusFilter],
    queryFn: () => blockAdminApi.printRequests({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      blockAdminApi.updatePrintStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-print-requests"] });
      toast({ title: "Print status updated" });
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Print Requests"
        description="Track question paper printing and delivery to schools"
        breadcrumbs={[{ label: "Print Requests" }]}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statusFlow.map((status, i) => {
          const count = (data ?? []).filter((p) => p.status === status).length;
          return (
            <Card key={status}>
              <CardContent className="p-3 text-center">
                <p className="text-xs text-gray-500 capitalize">{status.replace(/_/g, " ")}</p>
                <p className="text-2xl font-bold">{count}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {statusFlow.map(s => <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Print Requests ({(data ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (data ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Printer className="mx-auto mb-2 h-8 w-8" />
              <p>No print requests</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Paper Code</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Copies</th>
                    <th className="pb-2 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Update</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((p) => (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs">{p.paperCode}</td>
                      <td className="py-2">{p.school}</td>
                      <td className="py-2">{p.copies}</td>
                      <td className="py-2 text-xs">{p.reason}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={statusColors[p.status] || "border-gray-300"}>
                          {p.status?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {p.status !== "collected" && (
                          <Select onValueChange={(v) => updateStatus.mutate({ id: p._id, status: v })}>
                            <SelectTrigger className="h-7 w-32 text-xs"><SelectValue placeholder="Set" /></SelectTrigger>
                            <SelectContent>
                              {statusFlow.filter(s => s !== p.status).map(s => (
                                <SelectItem key={s} value={s}>{s.replace(/_/g, " ")}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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