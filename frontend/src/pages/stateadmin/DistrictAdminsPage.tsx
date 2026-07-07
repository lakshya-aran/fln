import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Power, KeyRound, Search, History } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import type { IDistrictAdmin } from "@/types/stateadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function DistrictAdminsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<IDistrictAdmin | null>(null);
  const [historyTarget, setHistoryTarget] = useState<IDistrictAdmin | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-district-admins", search, page],
    queryFn: () => stateAdminApi.districtAdmins({ search, page, limit: 20 }),
  });

  const { data: districts } = useQuery({
    queryKey: ["stateadmin-districts-list"],
    queryFn: () => stateAdminApi.districts({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: stateAdminApi.createDistrictAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stateadmin-district-admins"] });
      setCreateOpen(false);
      toast({ title: "District admin created", variant: "success" });
    },
    onError: (err: any) =>
      toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: stateAdminApi.deactivateDistrictAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stateadmin-district-admins"] });
      toast({ title: "Status updated", variant: "success" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      stateAdminApi.resetDistrictAdminPassword(id, password),
    onSuccess: () => {
      setResetTarget(null);
      setNewPassword("");
      toast({ title: "Password reset", variant: "success" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      assignedDistrict: fd.get("assignedDistrict") as string,
      employeeId: fd.get("employeeId") as string,
    });
  };

  const admins: IDistrictAdmin[] = data?.admins ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="District Admin Management"
        description="Create and manage district administrators in your state"
        breadcrumbs={[{ label: "District Admins" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create District Admin
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>District Admins ({data?.total ?? 0})</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search admins..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
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
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-gray-500">
                      No district admins found
                    </TableCell>
                  </TableRow>
                ) : admins.map((a) => (
                  <TableRow key={a._id}>
                    <TableCell className="font-medium">{a.name}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{a.district}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={a.isActive ? "success" : "destructive"}>
                        {a.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {a.lastLogin ? new Date(a.lastLogin).toLocaleString() : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setHistoryTarget(a)}
                          title="Login History"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deactivateMutation.mutate(a._id)}
                          title={a.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setResetTarget(a)}
                          title="Reset Password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create District Admin</DialogTitle>
            <DialogDescription>Add a new district administrator to your state</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input name="name" required minLength={2} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Employee ID</label>
              <Input name="employeeId" required className="mt-1" placeholder="e.g. DA001" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" required minLength={8} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Assign District</label>
              <select
                name="assignedDistrict"
                required
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select district...</option>
                {districts?.districts?.map((d: any) => (
                  <option key={d.district} value={d.district}>{d.district}</option>
                ))}
              </select>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {resetTarget && (
        <Dialog open onOpenChange={() => setResetTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>{resetTarget.name} ({resetTarget.email})</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="mt-1"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setResetTarget(null)}>Cancel</Button>
                <Button
                  disabled={newPassword.length < 8 || resetMutation.isPending}
                  onClick={() =>
                    resetMutation.mutate({ id: resetTarget._id, password: newPassword })
                  }
                >
                  Reset Password
                </Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {historyTarget && (
        <Dialog open onOpenChange={() => setHistoryTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login History</DialogTitle>
              <DialogDescription>{historyTarget.name}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="rounded-lg border bg-gray-50 p-3 text-sm">
                <p className="font-medium">Most Recent Login</p>
                <p className="text-gray-600">
                  {historyTarget.lastLogin ? new Date(historyTarget.lastLogin).toLocaleString() : "Never logged in"}
                </p>
              </div>
              <div className="rounded-lg border bg-gray-50 p-3 text-sm">
                <p className="font-medium">Current Status</p>
                <Badge variant={historyTarget.isActive ? "success" : "destructive"}>
                  {historyTarget.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                Detailed login history requires extended audit logging. Contact superadmin if needed.
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}