import AppLayout from "@/components/layout/AppLayout";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { sampleComplaints } from "@/lib/data";
import type { ComplaintStatus } from "@shared/api";
import SimpleCityMap from "@/components/map/SimpleCityMap";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";

const statusOrder: ComplaintStatus[] = ["NEW", "ACCEPTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];

function computeStats(list: typeof sampleComplaints) {
  const byStatus: Record<ComplaintStatus, number> = {
    NEW: 0,
    ACCEPTED: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
  };
  for (const c of list) byStatus[c.status]++;
  const total = list.length;
  const resolved = byStatus["RESOLVED"] || 0;
  const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
  return { byStatus, resolutionRate };
}

export default function Dashboard() {
  const { user } = useAuth();
  const scoped = scopeComplaints(user!, sampleComplaints);
  const { byStatus, resolutionRate } = computeStats(scoped);
  const chartData = statusOrder.map((s) => ({ status: s.replace("_", " "), count: byStatus[s] }));

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">City Operations Overview</h1>
            <p className="text-muted-foreground">Live snapshot of complaints and field activity</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Today</Badge>
            <Button>Export Report</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Open Complaints</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{scoped.filter(c=>c.status!=="RESOLVED").length}</div>
              <p className="text-xs text-muted-foreground">within your scope</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Resolution Rate</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{resolutionRate}%</div>
              <p className="text-xs text-muted-foreground">last 30 days</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">High Priority</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">{scoped.filter(c=>c.priority==="HIGH").length}</div>
              <p className="text-xs text-muted-foreground">requiring immediate action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Active Field Staff</CardTitle></CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">currently on duty</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Complaint Volume</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                    <Tooltip contentStyle={{ fontSize: 12 }} />
                    <Bar dataKey="count" radius={[4,4,0,0]} fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>City Map</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <Tabs defaultValue="markers">
                  <TabsList className="mb-3">
                    <TabsTrigger value="markers">Markers</TabsTrigger>
                    <TabsTrigger value="heat">Heatmap</TabsTrigger>
                  </TabsList>
                  <TabsContent value="markers" className="m-0">
                    <SimpleCityMap complaints={scoped} />
                  </TabsContent>
                  <TabsContent value="heat" className="m-0">
                    <SimpleCityMap complaints={scoped} showHeatmap />
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
