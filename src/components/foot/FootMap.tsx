import type { Foot, RegionId } from "@/lib/types";
import { FOOT_REGIONS, FOOT_VB } from "@/lib/pressure";
import { regionField } from "@/data/simulated/gait";
import { FootField } from "./FootField";

export function FootMap({
  foot,
  intensities,
  cop = null,
  trail,
  grid = false,
  interactive = false,
  selected = null,
  onSelect,
  className = "",
}: {
  foot: Foot;
  intensities: Record<RegionId, number>;
  cop?: { x: number; y: number } | null;
  trail?: { x: number; y: number }[];
  grid?: boolean;
  interactive?: boolean;
  selected?: RegionId | null;
  onSelect?: (r: RegionId) => void;
  className?: string;
}) {
  const field = regionField(intensities);

  return (
    <div className={`relative ${className}`} style={{ aspectRatio: `${FOOT_VB.w} / ${FOOT_VB.h}` }}>
      <FootField field={field} foot={foot} cop={cop} trail={trail} grid={grid} className="absolute inset-0" />

      {interactive && (
        <div className="absolute inset-0">
          {FOOT_REGIONS.map((r) => {
            const leftPct = (foot === "right" ? FOOT_VB.w - r.cx : r.cx) / FOOT_VB.w;
            const topPct = r.cy / FOOT_VB.h;
            const isSel = selected === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onSelect?.(r.id)}
                aria-pressed={isSel}
                aria-label={`${r.label}, pressure ${Math.round(intensities[r.id] * 100)}% of scale`}
                className="group absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                style={{ left: `${leftPct * 100}%`, top: `${topPct * 100}%` }}
              >
                <span
                  className={`h-5 w-5 rounded-full border transition-all ${
                    isSel
                      ? "border-accent bg-accent/25 scale-110"
                      : "border-ink-3/40 bg-surface/40 group-hover:border-accent/60"
                  }`}
                />
                <span
                  className={`pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[0.62rem] text-ink-2 transition-opacity ${
                    isSel ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
