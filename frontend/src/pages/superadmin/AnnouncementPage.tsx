import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Plus, Send, Edit, Calendar as CalendarIcon, Eye, EyeOff } from "lucide-react";
import { superadminApi } from "@/services/superadmin.service";
import type { IAnnouncement } from "@/types/superadmin";
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

export function AnnouncementPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<IAnnouncement | null>(null);
  const [preview, setPreview] = useState(false);
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ["superadmin-announcements"],
    queryFn: () => superadminApi.announcements(),
  });

  const createMutation = useMutation({
    mutationFn: superadminApi.createAnnouncement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-announcements"] });
      setCreateOpen(false);
      toast({ title: "Announcement created", variant: "success" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      superadminApi.updateAnnouncement(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["superadmin-announcements"] });
      setEditTarget(null);
      toast({ title: "Announcement updated", variant: "success" });
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const status = fd.get("status") as string;
    createMutation.mutate({
      title: fd.get("title"),
      content: fd.get("content"),
      type: fd.get("type"),
      status,
      sendEmail: fd.get("sendEmail") === "on",
      targetAudience: {
        allIndia: fd.get("allIndia") === "on",
      },
      scheduledAt:
        status === "scheduled"
          ? new Date(fd.get("scheduledAt") as string).toISOString()
          : null,
    });
  };

  const statusVariant = (status: string) => {
    if (status === "published") return "success" as const;
    if (status === "draft") return "secondary" as const;
    if (status === "scheduled") return "info" as const;
    if (status === "archived") return "outline" as const;
    return "default" as const;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Compose and broadcast announcements to specific audiences"
        breadcrumbs={[{ label: "Announcements" }]}
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {announcements
          .filter((a: IAnnouncement) => a.status === "published")
          .slice(0, 3)
          .map((a: IAnnouncement) => (
            <Card key={a._id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Badge variant={statusVariant(a.status)} className="capitalize">{a.type}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold">{a.title}</h3>
                <p className="mt-1 line-clamp-3 text-sm text-gray-600">
                  {a.content.slice(0, 150)}...
                </p>
                {a.targetAudience.allIndia && (
                  <Badge variant="info" className="mt-2">All India</Badge>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-8 text-center text-gray-500">Loading...</p>
          ) : announcements.length === 0 ? (
            <p className="py-8 text-center text-gray-500">No announcements yet</p>
          ) : (
            <div className="space-y-3">
              {announcements.map((a: IAnnouncement) => (
                <div key={a._id} className="rounded-lg border bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                        <Badge variant="outline">{a.type}</Badge>
                        {a.sendEmail && <Badge variant="info">Email</Badge>}
                      </div>
                      <h3 className="mt-2 font-semibold">{a.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">{a.content}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        Created {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditTarget(a)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {a.status === "draft" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            updateMutation.mutate({
                              id: a._id,
                              data: { status: "published" },
                            })
                          }
                        >
                          <Send className="mr-2 h-4 w-4" />
                          Publish
                        </Button>
                      )}
                    </div>
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
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Compose announcement with markdown support</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input name="title" required minLength={2} className="mt-1" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium">Type</label>
                <select name="type" required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="info">Info</option>
                  <option value="update">Update</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select name="status" required className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Publish Now</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Schedule (optional)</label>
                <Input name="scheduledAt" type="datetime-local" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content (Markdown)</label>
              <Textarea name="content" required rows={8} className="mt-1 font-mono text-sm" />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="allIndia" defaultChecked className="rounded" />
                Target All India
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="sendEmail" className="rounded" />
                Send Email Notification
              </label>
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Announcement</DialogTitle>
              <DialogDescription>{editTarget.title}</DialogDescription>
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
                  rows={14}
                  defaultValue={editTarget.content}
                  className="font-mono text-sm"
                  onChange={(e) => setEditTarget({ ...editTarget, content: e.target.value })}
                />
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: editTarget._id,
                    data: { content: editTarget.content, status: "draft" },
                  })
                }
              >
                Save as Draft
              </Button>
              <Button
                disabled={updateMutation.isPending}
                onClick={() =>
                  updateMutation.mutate({
                    id: editTarget._id,
                    data: { content: editTarget.content, status: "published" },
                  })
                }
              >
                <Send className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}