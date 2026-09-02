import { useEffect, useRef, useState } from "react";
import { useLive } from "@/data/DataContext";
import type { Foot, LiveFrame } from "@/lib/types";
import { Card, CardTitle, Eyebrow, Pill } from "@/components/ui/primitives";
import { FootField } from "@/components/foot/FootField";
import { PressureLegend } from "@/components/foot/PressureLegend";
import { regionField } from "@/data/simulated/gait";
import { IconPlay, IconReset, IconStop } from "@/components/icons";
import { int } from "@/lib/format";

const REST_FIELD = regionField({
  big_toe: 0,
  toes: 0,
  ball_inner: 0.04,
  ball_outer: 0.04,
  arch: 0.02,
  heel: 0.05,
});

function useCopTrails(frame: LiveFrame | null) {
  const trails = useRef<Record<Foot, { x: number; y: number }[]>>({ left: [], right: [] });
  const lastPhase = useRef<Record<Foot, number>>({ left: 0, right: 0 });

  if (frame) {
    (["left", "right"] as Foot[]).forEach((foot) => {
      const ph = frame.phase[foot];
      if (ph < lastPhase.current[foot]) trails.current[foot] = [];
      lastPhase.current[foot] = ph;
      const cop = frame.cop[foot];
      if (cop) {
        trails.current[foot].push(cop);
        if (trails.current[foot].length > 44) trails.current[foot].shift();
      }
    });
  }
  return trails.current;
}

export function Live() {
  const { frame, running, start, stop, reset } = useLive();
  const trails = useCopTrails(frame);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const cadence = frame?.cadenceSpm ?? 0;
  const symmetry = frame?.symmetryScore ?? 0;
  const steps = frame?.stepCount ?? 0;
  const loadL = frame?.load.left ?? 0;
  const loadR = frame?.load.right ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className={`h-2.5 w-2.5 rounded-full ${running ? "bg-good animate-pulse" : "bg-ink-3"}`} />
            <span className="font-mono text-[0.8rem] text-ink-2">
              {running ? "Streaming · simulated sensor" : "Idle"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!running ? (
              <button
                type="button"
                onClick={start}
                className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[0.85rem] font-medium text-[#1b1206] transition-opacity hover:opacity-90"
              >
                <IconPlay width={16} height={16} /> Start walking
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[0.85rem] font-medium text-ink transition-colors hover:bg-surface-2"
              >
                <IconStop width={16} height={16} /> Stop
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 hover:text-ink"
              aria-label="Reset step count"
            >
              <IconReset width={16} height={16} />
            </button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="animate-rise lg:col-span-2">
          <CardTitle hint="Live pressure with the centre-of-pressure line tracing each step">
            Pressure &amp; gait line
          </CardTitle>
          <div className="flex items-end justify-center gap-10 py-2">
            {(["left", "right"] as Foot[]).map((foot) => (
              <div key={foot} className="w-36 sm:w-44">
                <FootField
                  field={frame ? frame.field[foot] : REST_FIELD}
                  foot={foot}
                  cop={frame?.cop[foot] ?? null}
                  trail={trails[foot]}
                  grid
                  animate={running}
                />
                <p className="mt-2 text-center font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-3">
                  {foot}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 max-w-sm">
            <PressureLegend />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="animate-rise">
            <Eyebrow>This session</Eyebrow>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-display text-[3rem] leading-none text-ink tabular-nums">
                {int(steps)}
              </span>
              <span className="text-[0.85rem] text-ink-3">steps</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-3">Cadence</p>
                <p className="font-display text-[1.4rem] text-ink tabular-nums">
                  {int(cadence)} <span className="text-[0.7rem] text-ink-3">spm</span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[0.64rem] uppercase tracking-[0.12em] text-ink-3">Symmetry</p>
                <p className="font-display text-[1.4rem] text-ink tabular-nums">{int(symmetry)}</p>
              </div>
            </div>
          </Card>

          <Card className="animate-rise">
            <Eyebrow>Load right now</Eyebrow>
            <div className="mt-3 flex flex-col gap-3">
              <LoadBar label="Left" value={loadL} />
              <LoadBar label="Right" value={loadR} />
            </div>
            <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-3">
              Each bar is the total force under that foot at this instant — they trade off as you
              step.
            </p>
          </Card>

          <button
            type="button"
            onClick={() => setToast("Recording needs the backend — coming soon.")}
            className="rounded-full border border-dashed border-line-strong px-4 py-2.5 text-[0.82rem] text-ink-3 transition-colors hover:text-ink-2"
          >
            Record 30-second session
          </button>
        </div>
      </div>

      <Card className="animate-rise">
        <div className="flex items-start gap-3">
          <Pill tone="accent">How to read this</Pill>
          <p className="text-[0.86rem] leading-relaxed text-ink-2">
            The glowing patch is where pressure is highest. The amber line is your{" "}
            <strong className="text-ink">centre of pressure</strong> — the single point your weight
            acts through — tracing from heel to toe on every step. A smooth, even line on both feet is
            the goal; a line that veers sharply inward or outward is what we flag in Insights.
          </p>
        </div>
      </Card>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] text-ink-2 shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

function LoadBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 font-mono text-[0.7rem] text-ink-3">{label}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.min(100, value * 100)}%`,
            background: "linear-gradient(90deg, var(--c-plum), var(--c-accent))",
          }}
        />
      </div>
    </div>
  );
}
