import { useQuery } from "@tanstack/react-query";
import { X, Users, Building2, Award } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface SchoolDetailDialogProps {
  schoolId: string;
  onClose: () => void;
}

export function SchoolDetailDialog({ schoolId, onClose }: SchoolDetailDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-school-detail", schoolId],
    queryFn: () => stateAdminApi.schoolById(schoolId),
    enabled: !!schoolId,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {data?.school?.name || "School Details"}
          </DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <p className="py-8 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Students</p>
                  <p className="text-2xl font-bold">{data.school.students}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Teachers</p>
                  <p className="text-2xl font-bold">{data.school.teachers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Volunteers</p>
                  <p className="text-2xl font-bold">{data.school.volunteers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Award className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">FLN %</p>
                  <p className="text-2xl font-bold">{data.school.flnCertification}%</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="principal">Principal</TabsTrigger>
                <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">District</p>
                    <p className="font-medium">{data.school.district}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Block</p>
                    <p className="font-medium">{data.school.block}</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Assessment Completion</p>
                    <p className="text-lg font-bold">{data.school.assessmentCompletion}%</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-gray-500">Reading / Math</p>
                    <p className="text-lg font-bold">{data.school.readingScore}% / {data.school.mathScore}%</p>
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-gray-500">Status</p>
                  <Badge variant={data.school.completionStatus === "complete" ? "success" : data.school.completionStatus === "locked" ? "destructive" : "info"}>
                    {data.school.completionStatus}
                  </Badge>
                </div>
              </TabsContent>

              <TabsContent value="principal">
                {data.principal ? (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="font-medium">{data.principal.name}</p>
                    <p className="text-sm text-gray-600">{data.principal.email}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant={data.principal.isActive ? "success" : "destructive"}>
                        {data.principal.isActive ? "Active" : "Inactive/Locked"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        Last login: {data.principal.lastLogin ? new Date(data.principal.lastLogin).toLocaleString() : "Never"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="py-4 text-center text-gray-500">No principal assigned</p>
                )}
              </TabsContent>

              <TabsContent value="infrastructure">
                {data.infrastructureRequests.length === 0 ? (
                  <p className="py-4 text-center text-gray-500">No infrastructure requests</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.infrastructureRequests.map((r: any) => (
                        <TableRow key={r._id}>
                          <TableCell>{r.title}</TableCell>
                          <TableCell className="capitalize">{r.category}</TableCell>
                          <TableCell>
                            <Badge variant={r.priority === "urgent" ? "destructive" : r.priority === "high" ? "warning" : "secondary"}>
                              {r.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{r.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}