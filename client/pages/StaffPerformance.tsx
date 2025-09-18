import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleComplaints } from "@/lib/data";
import { staff as staffAll } from "@/lib/data";
import { computeOverdue } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";
import type { StaffUser } from "@shared/api";
import { useMemo } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function StaffPerformancePage() {
  const { user } = useAuth();
  const scopedComplaints = scopeComplaints(user!, sampleComplaints);

  const scopedStaff = useMemo(() => {
    if (user?.role === "SUPER_ADMIN") return staffAll;
    if (user?.role === "DEPT_ADMIN") return staffAll.filter(s => s.department === user.department);
    if (user?.role === "WARD_OFFICER") return staffAll.filter(s => s.ward === user.ward);
    return [];
  }, [user]);

  const metrics = useMemo(() => {
    return scopedStaff.map((s) => {
      const assigned = scopedComplaints.filter(c => c.assignedTo === s.id);
      const resolved = assigned.filter(c => c.status === "RESOLVED");
      const overdue = assigned.filter(c => computeOverdue(c)).length;
      const compliance = assigned.length ? Math.round(((assigned.length - overdue) / assigned.length) * 100) : 100;
      return { id: s.id, name: s.name, department: s.department, ward: s.ward, assigned: assigned.length, resolved: resolved.length, compliance };
    }).sort((a,b)=> b.resolved - a.resolved);
  }, [scopedStaff, scopedComplaints]);

  const chartData = metrics.slice(0,5).map(m => ({ name: m.name, resolved: m.resolved }));

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Leaderboard</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="p-2">Name</th>
                    <th className="p-2">Department</th>
                    <th className="p-2">Ward</th>
                    <th className="p-2">Assigned</th>
                    <th className="p-2">Resolved</th>
                    <th className="p-2">SLA %</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m)=> (
                    <tr key={m.id} className="border-t">
                      <td className="p-2 font-medium">{m.name}</td>
                      <td className="p-2">{m.department}</td>
                      <td className="p-2">{m.ward}</td>
                      <td className="p-2">{m.assigned}</td>
                      <td className="p-2">{m.resolved}</td>
                      <td className="p-2">{m.compliance}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Top 5 Resolvers</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} hide={false} interval={0} angle={-20} textAnchor="end" />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="resolved" radius={[4,4,0,0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
