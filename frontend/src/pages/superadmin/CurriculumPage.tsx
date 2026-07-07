import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Plus, Edit, Save, X, History, Eye, EyeOff } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { ICurriculum } from "@/types/superadmin";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export function CurriculumPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ICurriculum | null>(null);
  const [preview, setPreview] = useState(false);
  const [historyTarget, setHistoryTarget] = useState<ICurriculum | null>(null);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: curricula = [], isLoading } = useQuery({
    queryKey: ["superadmin-curricula"],
    queryFn: () => superadminApi.curricula(),
  });

  const createMutation = useMutation({
    mutationFn: superadminApi.createCurriculum,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-curricula"] });
      setCreateOpen(false);
      toast({ title: "Curriculum created", variant: "success" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminApi.updateCurriculum(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-curricula"] });
      setEditTarget(null);
      toast({ title: "Curriculum updated", variant: "success" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: ({ id, version }: { id: string; version: number }) =>
      superadminApi.restoreVersion(id, version),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-curricula"] });
      toast({ title: "Version restored", variant: "success" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    createMutation.mutate({
      title: fd.get("title"),
      subject: fd.get("subject"),
      grade: fd.get("grade"),
      language: fd.get("language"),
      content: fd.get("content"),
      learningOutcomes: (fd.get("outcomes") as string).split("\n").filter(Boolean),
      competencies: (fd.get("competencies") as string).split("\n").filter(Boolean),
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Curriculum Management"
        description="Create, edit, and version national curriculum content"
        breadcrumbs={[{ label: "Curriculum" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Curriculum
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>All Curricula</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : curricula.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No curricula created yet</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {curricula.map((curr: ICurriculum) => (
                <div key={curr._id} className="rounded-lg border bg-white p-4 transition-shadow hover:shadow-md">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-semibold">{curr.title}</h3>
                    <Badge variant={curr.status === "published" ? "success" : curr.status === "archived" ? "secondary" : "info"}>
                      v{curr.currentVersion}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {curr.subject} · Grade {curr.grade} · {curr.language}
                  </p>
                  <p className="mt-2 line-clamp-2 text-xs text-gray-400">
                    {curr.content.replace(/[#*`]/g, "").slice(0, 100)}...
                  </p>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setHistoryTarget(curr)}>
                      <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditTarget(curr)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Curriculum</DialogTitle>
            <DialogDescription>Add new curriculum content with markdown</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input name="title" required className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input name="subject" required className="mt-1" placeholder="e.g. Mathematics" />
              </div>
              <div>
                <label className="text-sm font-medium">Grade</label>
                <Input name="grade" required className="mt-1" placeholder="e.g. 3" />
              </div>
              <div>
                <label className="text-sm font-medium">Language</label>
                <Input name="language" required className="mt-1" placeholder="e.g. English" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (Markdown)</label>
              <Textarea name="content" required rows={10} className="mt-1 font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Learning Outcomes (one per line)</label>
                <Textarea name="outcomes" rows={3} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Competencies (one per line)</label>
                <Textarea name="competencies" rows={3} className="mt-1" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {editTarget && (
        <Dialog open onOpenChange={() => setEditTarget(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Curriculum</DialogTitle>
              <DialogDescription>{editTarget.title} - Version {editTarget.currentVersion}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setPreview(!preview)}>
                  {preview ? <><EyeOff className="mr-2 h-4 w-4" />Edit</> : <><Eye className="mr-2 h-4 w-4" />Preview</>}
                </Button>
              </div>
              {preview ? (
                <div className="prose max-w-none rounded-lg border bg-gray-50 p-4">
                  <ReactMarkdown>{editTarget.content}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  rows={16}
                  defaultValue={editTarget.content}
                  className="font-mono text-sm"
                  onChange={(e) => setEditTarget({ ...editTarget, content: e.target.value })}
                />
              )}
              <div>
                <label className="text-sm font-medium">Version Notes (for new version)</label>
                <Input
                  placeholder="What changed in this version?"
                  className="mt-1"
                  id="versionNotes"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  defaultValue={editTarget.status}
                  className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    updateMutation.mutate({
                      id: editTarget._id,
                      data: { status: e.target.value },
                    });
                  }}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button
                onClick={() => {
                  const notes = (document.getElementById("versionNotes") as HTMLInputElement)?.value;
                  updateMutation.mutate({
                    id: editTarget._id,
                    data: { content: editTarget.content, versionNotes: notes },
                  });
                }}
                disabled={updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {historyTarget && (
        <Dialog open onOpenChange={() => setHistoryTarget(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Version History</DialogTitle>
              <DialogDescription>{historyTarget.title}</DialogDescription>
            </DialogHeader>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {historyTarget.versions.map((v) => (
                <div key={v.version} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">Version {v.version}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(v.createdAt).toLocaleString()}
                    </p>
                    {v.notes && <p className="text-xs text-gray-600">{v.notes}</p>}
                  </div>
                  {v.version !== historyTarget.currentVersion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        restoreMutation.mutate({ id: historyTarget._id, version: v.version })
                      }
                    >
                      Restore
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setHistoryTarget(null)}>
                <X className="mr-2 h-4 w-4" />
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}