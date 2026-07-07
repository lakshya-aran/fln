import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, Unlock, AlertTriangle } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function SchoolRecoveryPage() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [unlockTarget, setUnlockTarget] = useState<any | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: (q: string) => superadminApi.searchSchool(q),
    onSuccess: (data) => setResults(data || []),
  });

  const unlockMutation = useMutation({
    mutationFn: superadminApi.unlockSchool,
    onSuccess: () => {
      toast({ title: "School unlocked successfully", variant: "success" });
      setUnlockTarget(null);
      setReason("");
      setSearch("");
      setResults([]);
    },
    onError: (err: any) =>
      toast({
        title: "Failed to unlock",
        description: err?.response?.data?.message,
        variant: "destructive",
      }),
  });

  const handleUnlock = () => {
    if (unlockTarget && reason.length > 0) {
      unlockMutation.mutate({ email: unlockTarget.email, reason });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Recovery"
        description="Unlock locked schools and reset credentials"
        breadcrumbs={[{ label: "School Recovery" }]}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search School
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") searchMutation.mutate(search);
              }}
              className="flex-1"
            />
            <Button
              onClick={() => searchMutation.mutate(search)}
              disabled={!search || searchMutation.isPending}
            >
              <Search className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>

          {results.length > 0 && (
            <div className="mt-4 space-y-2">
              {results.map((school: any) => (
                <div key={school._id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-xs text-gray-500">
                      {school.email} · {school.employeeId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={school.isActive ? "success" : "destructive"}>
                      {school.isActive ? "Active" : "Locked"}
                    </Badge>
                    {!school.isActive && (
                      <Button
                        size="sm"
                        onClick={() => setUnlockTarget(school)}
                      >
                        <Unlock className="mr-2 h-4 w-4" />
                        Unlock
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchMutation.isPending && (
            <p className="mt-4 text-center text-sm text-gray-500">Searching...</p>
          )}
        </CardContent>
      </Card>

      {unlockTarget && (
        <Dialog open onOpenChange={() => setUnlockTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Unlock School
              </DialogTitle>
              <DialogDescription>
                {unlockTarget.name} ({unlockTarget.email})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-900">
                <p className="font-medium">Audit Required</p>
                <p>Your reason and details will be recorded in the audit log.</p>
              </div>
              <div>
                <label className="text-sm font-medium">Reason for unlock</label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Locked due to password attempts reset. Identity verified via phone."
                  rows={3}
                  required
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