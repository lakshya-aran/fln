import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Unlock, Lock, AlertTriangle } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import type { ILockedSchool } from "@/types/stateadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function LockedSchoolsPage() {
  const [search, setSearch] = useState("");
  const [unlockTarget, setUnlockTarget] = useState<ILockedSchool | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-locked-schools", search],
    queryFn: () => stateAdminApi.lockedSchools(search),
  });

  const unlockMutation = useMutation({
    mutationFn: stateAdminApi.unlockSchool,
    onSuccess: () => {
      toast({ title: "School unlocked successfully", variant: "success" });
      qc.invalidateQueries({ queryKey: ["stateadmin-locked-schools"] });
      qc.invalidateQueries({ queryKey: ["stateadmin-schools"] });
      qc.invalidateQueries({ queryKey: ["stateadmin-dashboard"] });
      setUnlockTarget(null);
      setReason("");
    },
    onError: (err: any) =>
      toast({ title: "Unlock failed", description: err?.response?.data?.message, variant: "destructive" }),
  });

  const handleUnlock = () => {
    if (unlockTarget && reason.length >= 5) {
      unlockMutation.mutate({ email: unlockTarget.email, reason });
    }
  };

  const schools: ILockedSchool[] = data?.schools ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locked School Recovery"
        description="Unlock blocked school accounts and reset access"
        breadcrumbs={[{ label: "Locked Schools" }]}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-500" />
              Locked Schools ({data?.total ?? 0})
            </CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by name, email, school..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : schools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <Lock className="mb-2 h-8 w-8 text-gray-400" />
              <p>No locked schools in your state</p>
              <p className="text-xs">All principals have active access</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>District / Block</TableHead>
                  <TableHead>Lock Reason</TableHead>
                  <TableHead>Failed Attempts</TableHead>
                  <TableHead>Locked At</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schools.map((s) => (
                  <TableRow key={s._id}>
                    <TableCell className="font-medium">
                      <div>
                        <p>{s.school}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>
                      <p className="text-sm">{s.district}</p>
                      <p className="text-xs text-gray-500">{s.block}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">{s.lockReason || "Locked"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="warning">{s.failedLoginAttempts}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {s.lockedAt ? new Date(s.lockedAt).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => setUnlockTarget(s)}>
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {unlockTarget && (
        <Dialog open onOpenChange={() => setUnlockTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Confirm Unlock
              </DialogTitle>
              <DialogDescription>
                {unlockTarget.school} - {unlockTarget.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                <p className="font-medium">Audit Required</p>
                <p className="text-xs">Your action and reason will be permanently recorded.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Reason for unlock (required, min 5 chars)</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Identity verified via phone. Principal reported credential loss."
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setUnlockTarget(null)}>Cancel</Button>
              <Button
                disabled={reason.length < 5 || unlockMutation.isPending}
                onClick={handleUnlock}
              >
                {unlockMutation.isPending ? "Unlocking..." : "Confirm Unlock"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}