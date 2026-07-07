import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload, RefreshCw, Image as ImageIcon } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IVisualAsset } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function VisualAssetsPage() {
  const [type, setType] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [replaceTarget, setReplaceTarget] = useState<IVisualAsset | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["superadmin-visual-assets", type],
    queryFn: () => superadminApi.visualAssets({ type: type || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: superadminApi.createVisualAsset,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-visual-assets"] });
      setCreateOpen(false);
      toast({ title: "Visual asset added", variant: "success" });
    },
  });

  const replaceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminApi.replaceVisualAsset(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-visual-assets"] });
      setReplaceTarget(null);
      toast({ title: "Asset replaced", variant: "success" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get("title"),
      description: fd.get("description"),
      url: fd.get("url"),
      type: fd.get("type"),
      tags: {
        subjects: (fd.get("subjects") as string).split(",").map(s => s.trim()).filter(Boolean),
        grades: (fd.get("grades") as string).split(",").map(s => s.trim()).filter(Boolean),
        languages: (fd.get("languages") as string).split(",").map(s => s.trim()).filter(Boolean),
      },
      mimeType: "image/png",
      fileSize: 0,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visual Content Library"
        description="Manage images, illustrations, and icons used in assessments"
        breadcrumbs={[{ label: "Visual Library" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Asset
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Asset Library ({assets.length})
            </CardTitle>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="illustration">Illustration</SelectItem>
                <SelectItem value="icon">Icon</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : assets.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No visual assets yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {assets.map((asset: IVisualAsset) => (
                <div key={asset._id} className="rounded-lg border bg-white p-3 transition-shadow hover:shadow-md">
                  <div className="mb-2 aspect-square overflow-hidden rounded-md bg-gray-100">
                    <img
                      src={asset.url}
                      alt={asset.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='%239ca3af' font-size='12'%3EAsset%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <h3 className="line-clamp-1 text-sm font-medium">{asset.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <Badge variant="outline" className="text-xs">{asset.type}</Badge>
                    <Badge variant="secondary" className="text-xs">v{asset.currentVersion}</Badge>
                  </div>
                  {asset.tags.subjects.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {asset.tags.subjects.slice(0, 2).join(", ")}
                    </p>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setReplaceTarget(asset)}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Replace
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Visual Asset</DialogTitle>
            <DialogDescription>Add a new image, illustration, or icon</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" required className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">URL</label>
              <Input name="url" type="url" required placeholder="https://..." className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select name="type" required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="image">Image</option>
                <option value="illustration">Illustration</option>
                <option value="icon">Icon</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" className="mt-1" rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium">Subjects (comma)</label>
                <Input name="subjects" placeholder="Math, Hindi" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Grades (comma)</label>
                <Input name="grades" placeholder="1, 2, 3" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Languages (comma)</label>
                <Input name="languages" placeholder="Hindi, English" className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                <Upload className="mr-2 h-4 w-4" />
                {createMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {replaceTarget && (
        <Dialog open onOpenChange={() => setReplaceTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Replace Asset</DialogTitle>
              <DialogDescription>{replaceTarget.title} (current v{replaceTarget.currentVersion})</DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                replaceMutation.mutate({
                  id: replaceTarget._id,
                  data: { url: fd.get("url") as string },
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-sm font-medium">New Asset URL</label>
                <Input name="url" type="url" required placeholder="https://..." className="mt-1" />
                <p className="mt-1 text-xs text-gray-500">
                  Current: {replaceTarget.url}
                </p>
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setReplaceTarget(null)}>Cancel</Button>
                <Button type="submit" disabled={replaceMutation.isPending}>
                  Replace
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}