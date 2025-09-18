import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sampleComplaints } from "@/lib/data";
import type { Complaint, ComplaintStatus, Department } from "@shared/api";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";
import { useMemo } from "react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function ReportsPage() {
  const { user } = useAuth();
  const list = scopeComplaints(user!, sampleComplaints);

  const byDept = useMemo(()=>{
    const m = new Map<Department, number>();
    for (const c of list) m.set(c.department as Department, (m.get(c.department as Department)||0)+1);
    return Array.from(m.entries()).map(([department, count])=>({department, count}));
  },[list]);

  const byStatus = useMemo(()=>{
    const order: ComplaintStatus[] = ["NEW","ACCEPTED","ASSIGNED","IN_PROGRESS","RESOLVED"];
    const counts: Record<ComplaintStatus, number> = { NEW:0, ACCEPTED:0, ASSIGNED:0, IN_PROGRESS:0, RESOLVED:0 };
    for (const c of list) counts[c.status]++;
    return order.map(s=>({ status: s.replace("_"," "), count: counts[s] }));
  },[list]);

  const byDay = useMemo(()=>{
    const m = new Map<string, number>();
    for (const c of list) {
      const d = new Date(c.createdAt).toISOString().slice(0,10);
      m.set(d, (m.get(d)||0)+1);
    }
    return Array.from(m.entries()).sort((a,b)=>a[0]<b[0]? -1:1).map(([date, count])=>({ date, count }));
  },[list]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Complaints by Department</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDept}>
                  <XAxis dataKey="department" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]} fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle>Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byStatus}>
                  <XAxis dataKey="status" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="count" radius={[4,4,0,0]} fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-5">
          <CardHeader><CardTitle>Daily Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={byDay}>
                  <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Line dataKey="count" type="monotone" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
