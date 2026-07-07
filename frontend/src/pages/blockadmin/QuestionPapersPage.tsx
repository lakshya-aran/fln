import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Plus, Lock, Download, Printer, AlertCircle } from "lucide-react";
import { blockAdminApi } from "@/services/blockadmin.service";
import { PageHeader } from "@/components/superadmin/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

export function QuestionPapersPage() {
  const [genOpen, setGenOpen] = useState(false);
  const [form, setForm] = useState({
    schoolId: "", school: "",
    subject: "math" as "english" | "hindi" | "math" | "regional",
    grade: 2, language: "english", version: 1, reason: "manual" as const,
    questionsCount: 20, volunteerId: "",
  });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["block-question-papers"],
    queryFn: () => blockAdminApi.questionPapers(),
  });
  const { data: schools } = useQuery({
    queryKey: ["block-schools-list"],
    queryFn: () => blockAdminApi.schools(),
  });
  const { data: volunteers } = useQuery({
    queryKey: ["block-volunteers-list"],
    queryFn: () => blockAdminApi.volunteers({ isActive: "true" }),
  });

  const generateMutation = useMutation({
    mutationFn: blockAdminApi.generatePaper,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-question-papers"] });
      setGenOpen(false);
      toast({ title: "Question paper generated and locked" });
    },
    onError: (e: any) => toast({ title: e?.response?.data?.message || "Failed to generate paper", variant: "destructive" }),
  });

  const printMutation = useMutation({
    mutationFn: (data: { paperCode: string; copies: number; reason: string; volunteerId?: string }) =>
      blockAdminApi.printPaper(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["block-question-papers"] });
      queryClient.invalidateQueries({ queryKey: ["block-print-requests"] });
      toast({ title: "Print request created" });
    },
  });

  const handleSchoolChange = (id: string) => {
    const s = schools?.find((x: any) => x.schoolId === id);
    if (s) setForm({ ...form, schoolId: s.schoolId, school: s.school });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Question Paper Management"
        description="Generate and print question papers for low-resource schools"
        breadcrumbs={[{ label: "Question Papers" }]}
      />

      <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
        <AlertCircle className="mr-2 inline h-4 w-4" />
        Question papers are auto-locked after generation to prevent duplicates. Only for low-strength, no-internet, or locked schools.
      </div>

      <div className="flex justify-end">
        <Dialog open={genOpen} onOpenChange={setGenOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> Generate Paper</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate Question Paper</DialogTitle>
              <DialogDescription>Paper will be locked upon generation</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>School</Label>
                <Select value={form.schoolId} onValueChange={handleSchoolChange}>
                  <SelectTrigger><SelectValue placeholder="Choose school" /></SelectTrigger>
                  <SelectContent>
                    {schools?.map((s: any) => (
                      <SelectItem key={s.schoolId} value={s.schoolId}>{s.school}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Subject</Label>
                  <Select value={form.subject} onValueChange={(v: any) => setForm({ ...form, subject: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="math">Math</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="regional">Regional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Grade</Label>
                  <Input type="number" min={1} max={8} value={form.grade} onChange={(e) => setForm({ ...form, grade: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Language</Label>
                  <Select value={form.language} onValueChange={(v) => setForm({ ...form, language: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="marathi">Marathi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Version</Label>
                  <Input type="number" min={1} max={20} value={form.version} onChange={(e) => setForm({ ...form, version: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <Label>Reason</Label>
                <Select value={form.reason} onValueChange={(v: any) => setForm({ ...form, reason: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low_strength">Low Strength</SelectItem>
                    <SelectItem value="no_internet">No Internet</SelectItem>
                    <SelectItem value="locked_school">Locked School</SelectItem>
                    <SelectItem value="manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assign Volunteer (optional)</Label>
                <Select value={form.volunteerId} onValueChange={(v) => setForm({ ...form, volunteerId: v })}>
                  <SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger>
                  <SelectContent>
                    {volunteers?.map((v) => (
                      <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Questions</Label>
                <Input type="number" min={5} max={100} value={form.questionsCount} onChange={(e) => setForm({ ...form, questionsCount: Number(e.target.value) })} />
              </div>
              <Button
                className="w-full"
                disabled={!form.schoolId}
                onClick={() => generateMutation.mutate(form)}
              >
                Generate & Lock
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generated Papers ({(data ?? []).length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (data ?? []).length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <FileText className="mx-auto mb-2 h-8 w-8" />
              <p>No question papers generated yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-2 font-medium">Paper Code</th>
                    <th className="pb-2 font-medium">School</th>
                    <th className="pb-2 font-medium">Subject/Grade</th>
                    <th className="pb-2 font-medium">Reason</th>
                    <th className="pb-2 font-medium">Status</th>
                    <th className="pb-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.map((p) => (
                    <tr key={p._id} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-2 font-mono text-xs">{p.paperCode}</td>
                      <td className="py-2">{p.school}</td>
                      <td className="py-2 capitalize">{p.subject} G{p.grade} V{p.version}</td>
                      <td className="py-2">
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                          {p.reason?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="py-2">
                        {p.locked && (
                          <Badge variant="outline" className="border-red-300 bg-red-50 text-red-700">
                            <Lock className="mr-1 h-3 w-3" /> Locked
                          </Badge>
                        )}
                        {p.printedAt && (
                          <Badge variant="outline" className="ml-1 border-green-300 bg-green-50 text-green-700">
                            Printed
                          </Badge>
                        )}
                      </td>
                      <td className="py-2">
                        <div className="flex gap-1">
                          {!p.printedAt && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => printMutation.mutate({ paperCode: p.paperCode, copies: 30, reason: `Printing for ${p.school}` })}
                            >
                              <Printer className="h-3 w-3" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Download className="h-3 w-3" />
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
    </div>
  );
}