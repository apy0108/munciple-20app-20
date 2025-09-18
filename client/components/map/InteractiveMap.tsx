import { useMemo, useRef, useState } from "react";
import type { Complaint } from "@shared/api";
import { normalizeToBounds } from "@/lib/data";

export default function InteractiveMap({ complaints }: { complaints: Complaint[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY;
    const factor = delta > 0 ? 1.1 : 0.9;
    const next = Math.min(4, Math.max(0.5, scale * factor));
    setScale(next);
  }

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    setStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || !start) return;
    setOffset({ x: e.clientX - start.x, y: e.clientY - start.y });
  }
  function onPointerUp(e: React.PointerEvent) {
    setDragging(false);
    (e.target as Element).releasePointerCapture?.(e.pointerId);
  }

  const markerData = useMemo(() =>
    complaints.map((c) => ({ c, pos: normalizeToBounds(c.location.lat, c.location.lng) })), [complaints]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-md border bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.04)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.04)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)_76%,transparent_77%)] bg-[size:50px_50px] cursor-grab"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: "0 0" }}
      >
        {markerData.map(({ c, pos }) => (
          <button
            key={c.id}
            title={`${c.title} (${c.category})`}
            onClick={() => setActiveId(c.id)}
            style={{ left: `${pos.x * 100}%`, top: `${(pos.y * 100)}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
          >
            <div className={`w-3 h-3 rounded-full ring-2 ring-white shadow ${c.priority === "HIGH" ? "bg-red-600" : c.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-600"}`} />
          </button>
        ))}
      </div>

      {activeId && (
        <div className="absolute bottom-2 left-2 max-w-sm rounded-md border bg-background/95 p-3 shadow">
          {(() => {
            const c = complaints.find((x) => x.id === activeId)!;
            return (
              <div className="flex gap-3">
                <img src={c.attachments?.[0]?.url || "/placeholder.svg"} className="h-12 w-12 rounded object-cover border" />
                <div className="min-w-0">
                  <div className="font-medium truncate">{c.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{c.location.ward} • {c.location.zone}</div>
                  <div className="text-xs mt-1">
                    <span className="rounded px-1.5 py-0.5 bg-secondary mr-1">{c.category}</span>
                    <span className="rounded px-1.5 py-0.5 bg-primary/10 text-primary">{c.priority}</span>
                  </div>
                </div>
              </div>
            );
          })()}
          <div className="mt-2 flex justify-end">
            <button onClick={()=>setActiveId(null)} className="text-xs underline text-muted-foreground">Close</button>
          </div>
        </div>
      )}

      <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded bg-background/80 border">Drag to pan • Scroll to zoom</div>
    </div>
  );
}
