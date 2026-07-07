import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Power, KeyRound, MoreHorizontal } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IAdmin } from "@/types/superadmin";
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

export function AdminManagementPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["superadmin-admins", page, search],
    queryFn: () => superadminApi.admins({ page, limit: 20, search }),
  });

  const createMutation = useMutation({
    mutationFn: superadminApi.createAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-admins"] });
      setCreateOpen(false);
      toast({ title: "Admin created", variant: "success" });
    },
    onError: (err: any) =>
      toast({ title: "Failed", description: err?.response?.data?.message, variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: superadminApi.deactivateAdmin,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-admins"] });
      toast({ title: "Admin status updated", variant: "success" });
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      superadminApi.resetPassword(id, password),
    onSuccess: () => {
      setResetOpen(null);
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
      role: fd.get("role") as string,
    });
  };

  const admins: IAdmin[] = data?.admins || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Management"
        description="Create, manage, and monitor platform administrators"
        breadcrumbs={[{ label: "Admin Management" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Admin
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Administrators ({data?.total ?? 0})</CardTitle>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : admins.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-500">No admins found</TableCell></TableRow>
              ) : admins.map((admin) => (
                <TableRow key={admin._id}>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {admin.role.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={admin.isActive ? "success" : "destructive"}>
                      {admin.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(admin.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deactivateMutation.mutate(admin._id)}
                        title={admin.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setResetOpen(admin._id)}
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
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Admin</DialogTitle>
            <DialogDescription>Add a new administrator to the platform</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input name="name" required minLength={2} className="mt-1" />
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
              <label className="text-sm font-medium">Role</label>
              <select name="role" required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select role...</option>
                <option value="state_admin">State Admin</option>
                <option value="district_officer">District Officer</option>
                <option value="block_officer">Block Officer</option>
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

      <Dialog open={!!resetOpen} onOpenChange={() => setResetOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Set a new password for this admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setResetOpen(null)}>Cancel</Button>
              <Button
                disabled={newPassword.length < 8 || resetMutation.isPending}
                onClick={() => resetOpen && resetMutation.mutate({ id: resetOpen, password: newPassword })}
              >
                Reset Password
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}