import { BASELINE_GRADIENT, PRESSURE_GRADIENT, PRESSURE_SCALE_MAX_KPA } from "@/lib/pressure";

export function PressureLegend({ mode = "absolute" }: { mode?: "absolute" | "baseline" }) {
  if (mode === "baseline") {
    return (
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">
          vs your baseline
        </span>
        <div className="h-2 w-full rounded-full border border-line" style={{ background: BASELINE_GRADIENT }} />
        <div className="flex justify-between font-mono text-[0.62rem] text-ink-3">
          <span>less load</span>
          <span>usual</span>
          <span>more load</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-3">Pressure</span>
      <div className="h-2 w-full rounded-full border border-line" style={{ background: PRESSURE_GRADIENT }} />
      <div className="flex justify-between font-mono text-[0.62rem] text-ink-3">
        <span>0</span>
        <span>{Math.round(PRESSURE_SCALE_MAX_KPA / 2)}</span>
        <span>{PRESSURE_SCALE_MAX_KPA} kPa</span>
      </div>
    </div>
  );
}
