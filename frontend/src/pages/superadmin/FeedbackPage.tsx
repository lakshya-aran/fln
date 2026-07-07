import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, MessageSquare } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IFeedback } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

export function FeedbackPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState<IFeedback | null>(null);
  const [resolution, setResolution] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-feedback", statusFilter, categoryFilter, priorityFilter, search],
    queryFn: () =>
      superadminApi.feedbacks({
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminApi.updateFeedback(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-feedback"] });
      setTarget(null);
      setResolution("");
      toast({ title: "Feedback updated", variant: "success" });
    },
  });

  const feedbacks: IFeedback[] = data?.feedbacks || [];

  const priorityVariant = (p: string) => {
    if (p === "urgent") return "destructive" as const;
    if (p === "high") return "warning" as const;
    if (p === "medium") return "info" as const;
    return "secondary" as const;
  };

  const statusVariant = (s: string) => {
    switch (s) {
      case "resolved": return "success" as const;
      case "in_progress": return "info" as const;
      case "open": return "warning" as const;
      case "rejected": return "destructive" as const;
      default: return "secondary" as const;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Feedback Management"
        description="Centralized feedback queue from across the platform"
        breadcrumbs={[{ label: "Feedback" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Feedback Queue ({data?.total ?? 0})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-48 pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="merged">Merged</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  <SelectItem value="curriculum">Curriculum</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="translation">Translation</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="suggestion">Suggestion</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-8 text-center text-gray-500">No feedback</TableCell></TableRow>
                ) : feedbacks.map((f) => (
                  <TableRow key={f._id}>
                    <TableCell className="max-w-xs">
                      <p className="line-clamp-1 font-medium">{f.title}</p>
                      <p className="line-clamp-1 text-xs text-gray-500">{f.description}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{f.category}</Badge>
                    </TableCell>
                    <TableCell className="capitalize">{f.sourceUser.role}</TableCell>
                    <TableCell>
                      <Badge variant={priorityVariant(f.priority)}>{f.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(f.status)}>{f.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(f.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => setTarget(f)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {target && (
        <Dialog open onOpenChange={() => setTarget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manage Feedback</DialogTitle>
              <DialogDescription>
                From {target.sourceUser.name} ({target.sourceUser.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{target.title}</h3>
                <p className="mt-1 text-sm text-gray-600">{target.description}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 text-sm">
                <div>
                  <p className="text-gray-500">Category</p>
                  <p className="font-medium capitalize">{target.category}</p>
                </div>
                <div>
                  <p className="text-gray-500">Priority</p>
                  <p className="font-medium capitalize">{target.priority}</p>
                </div>
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium">{new Date(target.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Update Status</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => updateMutation.mutate({ id: target._id, data: { status: "in_progress" } })}
                  >
                    In Progress
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      if (resolution.length > 0) {
                        updateMutation.mutate({
                          id: target._id,
                          data: { status: "resolved", resolution },
                        });
                      }
                    }}
                  >
                    Resolve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateMutation.mutate({ id: target._id, data: { status: "rejected" } })}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Resolution Notes</label>
                <Textarea
                  rows={3}
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Resolution details..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setTarget(null)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}