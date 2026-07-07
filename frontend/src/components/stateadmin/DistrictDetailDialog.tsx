import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { X, Award, Users, Building2, School } from "lucide-react";
import { stateAdminApi } from "@/services/stateadmin.service";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface DistrictDetailDialogProps {
  district: string;
  onClose: () => void;
}

export function DistrictDetailDialog({ district, onClose }: DistrictDetailDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["stateadmin-district-detail", district],
    queryFn: () => stateAdminApi.districtById(district),
    enabled: !!district,
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {district} District
          </DialogTitle>
        </DialogHeader>

        {isLoading || !data ? (
          <p className="py-8 text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <School className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Schools</p>
                  <p className="text-2xl font-bold">{data.schools}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Teachers</p>
                  <p className="text-2xl font-bold">{data.teachers}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">Students</p>
                  <p className="text-2xl font-bold">{data.students}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Award className="h-4 w-4 text-gray-500" />
                  <p className="mt-2 text-xs text-gray-500">FLN Cert</p>
                  <p className="text-2xl font-bold">{data.flnCertification}%</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="schools">Schools</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Assessment Completion</p>
                    <p className="text-2xl font-bold text-blue-600">{data.assessmentCompletion}%</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Reading Score</p>
                    <p className="text-2xl font-bold text-green-600">{data.readingScore}%</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Math Score</p>
                    <p className="text-2xl font-bold text-purple-600">{data.mathScore}%</p>
                  </div>
                  <div className="rounded-lg border bg-white p-3">
                    <p className="text-xs text-gray-500">Volunteers</p>
                    <p className="text-2xl font-bold">{data.volunteers}</p>
                  </div>
                </div>
                {data.districtAdmin && (
                  <div className="rounded-lg border bg-gray-50 p-3 text-sm">
                    <p className="font-medium">District Admin</p>
                    <p>{data.districtAdmin.name} ({data.districtAdmin.email})</p>
                    <p className="text-xs text-gray-500">
                      Status: {data.districtAdmin.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="schools">
                <div className="max-h-96 space-y-2 overflow-y-auto">
                  {data.schools.map((s) => (
                    <div key={s.schoolId} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">ID: {s.schoolId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{s.completionStatus}</Badge>
                        <Badge variant={s.flnCertification >= 60 ? "success" : s.flnCertification >= 40 ? "warning" : "destructive"}>
                          {s.flnCertification}% FLN
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="performance">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Performing Schools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={data.topPerformers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-20} textAnchor="end" height={70} fontSize={11} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="certification" fill="#10B981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}