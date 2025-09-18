import { normalizeToBounds } from "@/lib/data";
import type { Complaint } from "@shared/api";

export default function SimpleCityMap({
  complaints,
  showHeatmap = false,
}: {
  complaints: Complaint[];
  showHeatmap?: boolean;
}) {
  return (
    <div className="relative w-full h-full rounded-md border overflow-hidden bg-[linear-gradient(0deg,transparent_24%,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.04)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)_76%,transparent_77%),linear-gradient(90deg,transparent_24%,rgba(0,0,0,0.04)_25%,rgba(0,0,0,0.04)_26%,transparent_27%,transparent_74%,rgba(0,0,0,0.04)_75%,rgba(0,0,0,0.04)_76%,transparent_77%)] bg-[size:50px_50px]">
      {showHeatmap && (
        <div className="absolute inset-0">
          {complaints.map((c) => {
            const { x, y } = normalizeToBounds(c.location.lat, c.location.lng);
            return (
              <div
                key={`h-${c.id}`}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className="w-40 h-40 -ml-20 -mt-20 rounded-full bg-primary/20 blur-xl" />
              </div>
            );
          })}
        </div>
      )}
      {!showHeatmap && (
        <>
          {complaints.map((c) => {
            const { x, y } = normalizeToBounds(c.location.lat, c.location.lng);
            const color =
              c.priority === "HIGH" ? "bg-red-600" : c.priority === "MEDIUM" ? "bg-amber-500" : "bg-emerald-600";
            return (
              <div
                key={c.id}
                title={`${c.title} (${c.category})`}
                style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2"
              >
                <div className={`w-3 h-3 rounded-full ring-2 ring-white shadow ${color}`} />
              </div>
            );
          })}
        </>
      )}
      <div className="absolute bottom-2 right-2 text-[10px] px-2 py-1 rounded bg-background/80 border">Demo map</div>
    </div>
  );
}
