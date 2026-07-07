import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Users, Search } from "lucide-react";
import { districtAdminApi } from "@/services/districtadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export function BlockAdminsPage() {
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", employeeId: "", password: "", block: "Haveli", assignedBlocks: "" });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["district-block-admins", blockFilter],
    queryFn: () => districtAdminApi.blockAdmins({
      block: blockFilter !== "all" ? blockFilter : undefined,
    }),
  });

  const createMutation = useMutation({
    mutationFn: districtAdminApi.createBlockAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-block-admins"] });
      setOpen(false);
      setForm({ name: "", email: "", employeeId: "", password: "", block: "Haveli", assignedBlocks: "" });
      toast({ title: "Block admin created" });
    },
    onError: () => toast({ title: "Failed to create block admin", variant: "destructive" }),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => districtAdminApi.deactivateBlockAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["district-block-admins"] });
      toast({ title: "Block admin deactivated" });
    },
  });

  const filtered = (data ?? []).filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Block Admins"
        description="Manage block education officers in your district"
        breadcrumbs={[{ label: "Block Admins" }]}
      />

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={blockFilter} onValueChange={setBlockFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Block" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blocks</SelectItem>
            <SelectItem value="Haveli">Haveli</SelectItem>
            <SelectItem value="Mulshi">Mulshi</SelectItem>
            <SelectItem value="Khed">Khed</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Block Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Block Admin</DialogTitle>
              <DialogDescription>Add a new block education officer</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Employee ID</Label>
                <Input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} />
              </div>
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
              <div>
                <Label>Block</Label>
                <Select value={form.block} onValueChange={(v) => setForm({ ...form, block: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Haveli">Haveli</SelectItem>
                    <SelectItem value="Mulshi">Mulshi</SelectItem>
                    <SelectItem value="Khed">Khed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate({ ...form, assignedBlocks: [form.block] })}
                disabled={!form.name || !form.email || !form.employeeId || !form.password}
              >
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block Admins ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <Users className="mx-auto mb-2 h-8 w-8" />
              <p>No block admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Name</th>
                    <th className="pb-2 font-medium">Email</th>
                    <th className="pb-2 font-medium">Block</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Last Login</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-medium">{a.name}</td>
                      <td className="py-2">{a.email}</td>
                      <td className="py-2">{a.block || (a.assignedBlocks ?? []).join(", ")}</td>
                      <td className="py-2">
                        <Badge variant="outline" className={a.isActive ? "border-green-300 bg-green-50 text-green-700" : "border-red-300 bg-red-50 text-red-700"}>
                          {a.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-2">{a.lastLogin ? new Date(a.lastLogin).toLocaleDateString() : "Never"}</td>
                      <td className="py-2">
                        {a.isActive && (
                          <Button variant="destructive" size="sm" onClick={() => deactivateMutation.mutate(a._id)}>
                            Deactivate
                          </Button>
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
