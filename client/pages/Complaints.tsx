import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import SimpleCityMap from "@/components/map/SimpleCityMap";
import { sampleComplaints, staff, routeDepartment, nearestStaff, computeOverdue } from "@/lib/data";
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@shared/api";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";

const categories: ComplaintCategory[] = ["pothole", "garbage", "streetlight", "water", "sewage", "other"];
const statuses: ComplaintStatus[] = ["NEW", "ACCEPTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"];
const priorities: ComplaintPriority[] = ["LOW", "MEDIUM", "HIGH"];

export default function ComplaintsPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<Complaint[]>(scopeComplaints(user!, sampleComplaints));
  const allowedStaff = useMemo(()=>{
    if (!user) return staff;
    if (user.role === "DEPT_ADMIN") return staff.filter(s=>s.department===user.department);
    if (user.role === "WARD_OFFICER") return staff.filter(s=>s.ward===user.ward);
    return staff;
  }, [user]);

  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (q && !(`${c.title} ${c.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (category !== "all" && c.category !== category) return false;
      if (status !== "all" && c.status !== status) return false;
      if (priority !== "all" && c.priority !== priority) return false;
      return true;
    });
  }, [q, category, status, priority, items]);

  function bulkAssignNearest() {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (!ids.length) return toast.warning("Select complaints to assign");
    setItems((prev) =>
      prev.map((c) => {
        if (!ids.includes(c.id)) return c;
        const dept = routeDepartment(c.category);
        const nearest = nearestStaff(dept, c.location);
        return { ...c, status: "ASSIGNED", assignedTo: nearest?.id };
      }),
    );
    toast.success("Auto-assigned to nearest staff");
    setSelected({});
  }

  return (
    <AppLayout>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Complaint Feed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c)=>(<SelectItem key={c} value={c}>{c}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statuses.map((s)=>(<SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((p)=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={bulkAssignNearest}>Auto-assign nearest</Button>
                <Button variant="outline" onClick={()=>setSelected({})}>Clear selection</Button>
              </div>

              <div className="divide-y rounded-md border">
                {filtered.map((c)=>{
                  const overdue = computeOverdue(c);
                  const isSel = !!selected[c.id];
                  return (
                    <div key={c.id} className={`flex items-start gap-3 p-3 ${isSel?"bg-accent/50":""}`}>
                      <input type="checkbox" className="mt-1" checked={isSel} onChange={(e)=>setSelected((s)=>({...s, [c.id]: e.target.checked}))} />
                      <img src={c.attachments?.[0]?.url||"/placeholder.svg"} className="h-12 w-12 rounded object-cover border" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">{c.title}</span>
                          <Badge variant="secondary">{c.category}</Badge>
                          <Badge>{c.priority}</Badge>
                          <Badge variant={c.status==="RESOLVED"?"secondary":"default"}>{c.status.replace("_"," ")}</Badge>
                          {overdue && <Badge className="bg-red-600">SLA Overdue</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                        <div className="text-xs text-muted-foreground mt-1">{c.location.ward} • {c.location.zone} • {new Date(c.createdAt).toLocaleString()}</div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground min-w-24">
                        {c.assignedTo ? <span>Assigned: {c.assignedTo}</span> : <span>Unassigned</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle>Live Map</CardTitle></CardHeader>
            <CardContent>
              <div className="h-80"><SimpleCityMap complaints={filtered} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Category Report</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              {categories.map((cat)=>{
                const count = filtered.filter(c=>c.category===cat).length;
                return <div key={cat} className="rounded-md border p-2 flex items-center justify-between"><span className="text-xs text-muted-foreground">{cat}</span><span className="font-semibold">{count}</span></div>
              })}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Assignment</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Select complaints and use auto-assign, or choose a staff:</p>
              <div className="flex gap-2">
                <Select onValueChange={(id)=>{
                  const ids = Object.keys(selected).filter((i)=>selected[i]);
                  if (!ids.length) return toast.warning("Select complaints first");
                  setItems((prev)=>prev.map((c)=>ids.includes(c.id)?{...c, status: "ASSIGNED", assignedTo: id }:c));
                  setSelected({});
                  toast.success("Assigned to staff");
                }}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>
                    {allowedStaff.map((s)=>(<SelectItem key={s.id} value={s.id}>{s.name} • {s.department}</SelectItem>))}
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={()=>toast.info("Notifications sent (demo)")}>Notify</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
