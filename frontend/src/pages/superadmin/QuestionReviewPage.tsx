import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Filter, CheckCircle, AlertCircle, X } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IQuestionReview } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function QuestionReviewPage() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");
  const [reviewTarget, setReviewTarget] = useState<IQuestionReview | null>(null);
  const [action, setAction] = useState("");
  const [notes, setNotes] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-question-review", statusFilter, subjectFilter, gradeFilter],
    queryFn: () =>
      superadminApi.questionReviews({
        status: statusFilter || undefined,
        subject: subjectFilter || undefined,
        grade: gradeFilter || undefined,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminApi.updateQuestionReview(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-question-review"] });
      setReviewTarget(null);
      setNotes("");
      toast({ title: "Question updated", variant: "success" });
    },
  });

  const handleAction = () => {
    if (!reviewTarget || !action) return;
    updateMutation.mutate({
      id: reviewTarget._id,
      data: { status: action, notes },
    });
  };

  const reviews: IQuestionReview[] = data?.reviews || [];

  const statusVariant = (status: string) => {
    switch (status) {
      case "approved": return "success" as const;
      case "pending": return "warning" as const;
      case "edited": return "info" as const;
      case "replaced": return "default" as const;
      case "archived": return "secondary" as const;
      default: return "default" as const;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Review Dashboard"
        description="Questions where more than 50% of students answered an EASY question incorrectly"
        breadcrumbs={[{ label: "Question Review" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Flagged Questions ({data?.total ?? 0})
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="edited">Edited</SelectItem>
                  <SelectItem value="replaced">Replaced</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Subject"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-32"
              />
              <Input
                placeholder="Grade"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="w-24"
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
                  <TableHead>Question</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Failure %</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-gray-500">
                      No flagged questions
                    </TableCell>
                  </TableRow>
                ) : reviews.map((r) => (
                  <TableRow key={r._id}>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 font-medium">{r.questionText}</p>
                    </TableCell>
                    <TableCell>{r.subject}</TableCell>
                    <TableCell>{r.grade}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.difficulty}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-red-600">
                        {r.failureRate.toFixed(1)}%
                      </span>
                    </TableCell>
                    <TableCell>{r.totalAttempts}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReviewTarget(r);
                          setAction("");
                        }}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {reviewTarget && (
        <Dialog open onOpenChange={() => setReviewTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Question Review</DialogTitle>
              <DialogDescription>{reviewTarget.subject} · Grade {reviewTarget.grade}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-3 text-sm">
                <p>{reviewTarget.questionText}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-yellow-50 p-3 text-sm">
                <div>
                  <p className="text-gray-500">Failure Rate</p>
                  <p className="text-lg font-bold text-red-600">
                    {reviewTarget.failureRate.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Total Attempts</p>
                  <p className="text-lg font-bold">{reviewTarget.totalAttempts}</p>
                </div>
              </div>
              {reviewTarget.recommendation && (
                <div className="rounded-lg bg-blue-50 p-3 text-sm">
                  <p className="text-xs font-medium text-blue-900">Recommendation</p>
                  <p className="text-sm">{reviewTarget.recommendation}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select value={action} onValueChange={setAction}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select action..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Approve</SelectItem>
                    <SelectItem value="edited">Edit Question</SelectItem>
                    <SelectItem value="replaced">Replace</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Reviewer Notes</label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setReviewTarget(null)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                disabled={!action || updateMutation.isPending}
                onClick={handleAction}
              >
                {updateMutation.isPending ? "Saving..." : (
                  <>
                    {action === "approved" ? <CheckCircle className="mr-2 h-4 w-4" /> : <AlertCircle className="mr-2 h-4 w-4" />}
                    Save Review
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}