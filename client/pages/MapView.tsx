import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import InteractiveMap from "@/components/map/InteractiveMap";
import { sampleComplaints } from "@/lib/data";
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from "@shared/api";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";

const categories: ComplaintCategory[] = ["pothole","garbage","streetlight","water","sewage","other"];
const statuses: ComplaintStatus[] = ["NEW","ACCEPTED","ASSIGNED","IN_PROGRESS","RESOLVED"];
const priorities: ComplaintPriority[] = ["LOW","MEDIUM","HIGH"];

export default function MapView() {
  const { user } = useAuth();
  const base = scopeComplaints(user!, sampleComplaints);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");

  const filtered = useMemo(()=>{
    return base.filter(c=>{
      if (q && !(`${c.title} ${c.description}`.toLowerCase().includes(q.toLowerCase()))) return false;
      if (category!=="all" && c.category!==category) return false;
      if (status!=="all" && c.status!==status) return false;
      if (priority!=="all" && c.priority!==priority) return false;
      return true;
    })
  },[base,q,category,status,priority]);

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="space-y-3 lg:col-span-1">
          <Card>
            <CardHeader className="pb-2"><CardTitle>Filters</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input placeholder="Search" value={q} onChange={(e)=>setQ(e.target.value)} />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(s=> <SelectItem key={s} value={s}>{s.replace("_"," ")}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {priorities.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle>Counts</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Total</div><div className="font-semibold">{filtered.length}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">High</div><div className="font-semibold">{filtered.filter(c=>c.priority==='HIGH').length}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Assigned</div><div className="font-semibold">{filtered.filter(c=>c.status==='ASSIGNED').length}</div></div>
              <div className="rounded-md border p-2"><div className="text-xs text-muted-foreground">Resolved</div><div className="font-semibold">{filtered.filter(c=>c.status==='RESOLVED').length}</div></div>
            </CardContent>
          </Card>
        </div>
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2"><CardTitle>Interactive Map</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[60vh]"><InteractiveMap complaints={filtered} /></div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
