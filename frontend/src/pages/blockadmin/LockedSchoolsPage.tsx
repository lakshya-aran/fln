import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, AlertCircle, Eye, KeyRound, Unlock, ShieldAlert, Search } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export function LockedSchoolsPage() {
  const [search, setSearch] = useState("");
  const [actionDialog, setActionDialog] = useState<{ email: string; action: string } | null>(null);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["block-locked-schools", search],
    queryFn: () => blockAdminApi.lockedSchools(search || undefined),
  });
  const { data: history } = useQuery({
    queryKey: ["block-recovery-history"],
    queryFn: blockAdminApi.recoveryHistory,
  });

  const filtered = (data ?? []).filter(s =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.school.toLowerCase().includes(search.toLowerCase())
  );

  const handleAction = async () => {
    if (!actionDialog || !reason.trim()) {
      toast({ title: "Please provide a reason", variant: "destructive" });
      return;
    }
    try {
      switch (actionDialog.action) {
        case "view":
          await blockAdminApi.viewLockReason(actionDialog.email);
          toast({ title: "Lock reason retrieved" });
          break;
        case "temporary":
          await blockAdminApi.temporaryAccess(actionDialog.email, reason);
          toast({ title: "Temporary access granted (audited)" });
          break;
        case "reset":
          await blockAdminApi.resetLogin(actionDialog.email, reason);
          toast({ title: "Login attempts reset" });
          break;
        case "unlock":
          await blockAdminApi.unlockSchool(actionDialog.email, reason, "unlocked");
          toast({ title: "School dashboard unlocked" });
          break;
      }
      refetch();
      setActionDialog(null);
      setReason("");
    } catch (e: any) {
      toast({ title: e?.response?.data?.message || "Action failed", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locked School Recovery"
        description="Restore school dashboard access — every action is audited"
        breadcrumbs={[{ label: "Locked Schools" }]}
      />

      <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
        <ShieldAlert className="mr-2 inline h-4 w-4" />
        All actions performed here are logged in the audit trail for compliance.
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search locked schools..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Locked Schools ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-gray-500">Loading...</p> : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Lock className="mx-auto mb-2 h-8 w-8" />
              <p>No locked schools</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Principal</th>
                    <th className="pb-2 font-medium">Lock Reason</th>
                    <th className="pb-2 font-medium">Attempts</th>
                    <th className="pb-2 font-medium">Locked</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{s.school}</td>
                      <td className="py-2 text-xs">{s.email}</td>
                      <td className="py-2 text-xs max-w-[200px] truncate">{s.lockReason || "—"}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                          {s.failedLoginAttempts}
                        </Badge>
                      </td>
                      <td className="py-2 text-xs">{s.lockedAt ? new Date(s.lockedAt).toLocaleDateString() : "-"}</td>
                      <td className="py-2">
                        <div className="flex flex-wrap gap-1">
                          <Button size="sm" variant="outline" onClick={() => setActionDialog({ email: s.email, action: "view" })}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActionDialog({ email: s.email, action: "temporary" })}>
                            <KeyRound className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setActionDialog({ email: s.email, action: "reset" })}>
                            Reset
                          </Button>
                          <Button size="sm" onClick={() => setActionDialog({ email: s.email, action: "unlock" })} className="bg-green-600 hover:bg-green-700">
                            <Unlock className="h-3 w-3" /> Unlock
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recovery History ({(history ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {(history ?? []).length === 0 ? (
            <p className="text-gray-500">No recovery actions yet</p>
          ) : (
            <div className="space-y-2">
              {history?.slice(0, 10).map((h) => (
                <div key={h._id} className="rounded-md border bg-gray-50 p-2 text-sm">
                  <div className="flex justify-between">
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                      {h.action?.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="mt-1">{h.reason}</p>
                  <p className="text-xs text-gray-500">By {h.performedBy} • {h.school}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!actionDialog} onOpenChange={(o) => { if (!o) { setActionDialog(null); setReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog?.action === "view" && "View Lock Reason"}
              {actionDialog?.action === "temporary" && "Grant Temporary Access"}
              {actionDialog?.action === "reset" && "Reset Login Attempts"}
              {actionDialog?.action === "unlock" && "Unlock School Dashboard"}
            </DialogTitle>
            <DialogDescription>This action will be audited</DialogDescription>
          </DialogHeader>
          {actionDialog?.action !== "view" && (
            <div className="space-y-3">
              <div>
                <Label>Reason (required, min 5 chars)</Label>
                <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
              <Button
                className="w-full"
                onClick={handleAction}
                disabled={reason.length < 5}
              >
                Confirm Action
              </Button>
            </div>
          )}
          {actionDialog?.action === "view" && (
            <Button onClick={handleAction}>View Lock Reason</Button>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}