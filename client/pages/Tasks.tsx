import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { scopeComplaints } from "@/lib/scope";
import { sampleComplaints } from "@/lib/data";
import type { Complaint } from "@shared/api";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export default function TasksPage() {
  const { user } = useAuth();
  const base = scopeComplaints(user!, sampleComplaints);
  const my = useMemo(()=>{
    // Field staff: assigned only; Ward officer: ward list
    return base;
  },[base]);

  const [items, setItems] = useState<Complaint[]>(my);

  function updateStatus(id: string, status: Complaint["status"]) {
    setItems(prev=>prev.map(c=>c.id===id?{...c, status}:c));
    toast.success("Status updated");
  }

  async function attachProof(id: string, file?: File | null) {
    if (!file) return;
    const url = await fileToDataUrl(file);
    setItems(prev=>prev.map(c=>c.id===id?{...c, attachments: [...(c.attachments||[]), { type: file.type.startsWith("video")?"video":"image", url }]}:c));
    toast.success("Proof uploaded");
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <div className="divide-y rounded-md border">
          {items.map((c)=> (
            <div className="p-3 grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-3" key={c.id}>
              <img src={c.attachments?.[0]?.url||"/placeholder.svg"} className="h-16 w-16 rounded object-cover border" />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{c.title}</span>
                  <span className="text-xs rounded px-1.5 py-0.5 bg-secondary">{c.category}</span>
                  <span className="text-xs rounded px-1.5 py-0.5 bg-primary/10 text-primary">{c.priority}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                <div className="text-xs text-muted-foreground mt-1">{c.location.ward} • {c.location.zone}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="text-xs">Status: <span className="font-medium">{c.status.replace("_"," ")}</span></div>
                <div className="flex gap-2">
                  {(user!.role!=="FIELD_STAFF" || c.status==="NEW" || c.status==="ACCEPTED") && (
                    <Button size="sm" variant="secondary" onClick={()=>updateStatus(c.id,"IN_PROGRESS")}>Start</Button>
                  )}
                  <Button size="sm" onClick={()=>updateStatus(c.id,"RESOLVED")}>Resolve</Button>
                </div>
                <label className="text-xs border rounded px-2 py-1 cursor-pointer">
                  Upload Proof
                  <input type="file" accept="image/*,video/*" className="hidden" onChange={(e)=>attachProof(c.id, e.target.files?.[0])} />
                </label>
              </div>
              {c.attachments && c.attachments.slice(1).length>0 && (
                <div className="md:col-span-3 flex gap-2 flex-wrap">
                  {c.attachments.slice(1).map((a,i)=> (
                    <img key={i} src={a.url} className="h-12 w-12 rounded object-cover border" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject)=>{
    const r = new FileReader();
    r.onload = ()=>resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}
