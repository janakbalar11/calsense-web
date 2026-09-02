import { scoreBand } from "./ScoreRing";

/** A 0–100 score shown as a track with a moving marker and a band label. */
export function ScoreMeter({
  value,
  label,
  typicalLo = 70,
  typicalHi = 92,
}: {
  value: number;
  label: string;
  typicalLo?: number;
  typicalHi?: number;
}) {
  const band = scoreBand(value);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-3">{label}</span>
        <span className="font-display text-[1.05rem] text-ink tabular-nums">{Math.round(value)}</span>
      </div>
      <div className="relative h-2 rounded-full bg-surface-2">
        <div
          className="absolute inset-y-0 rounded-full bg-ink-3/15"
          style={{ left: `${typicalLo}%`, width: `${typicalHi - typicalLo}%` }}
        />
        <div
          className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface"
          style={{ left: `${Math.max(2, Math.min(98, value))}%`, background: band.color }}
        />
      </div>
    </div>
  );
}

/** Left/right (or fore/aft) split bar. */
export function SplitMeter({
  leftPct,
  leftLabel = "Left",
  rightLabel = "Right",
  neutralLo = 46,
  neutralHi = 54,
}: {
  leftPct: number;
  leftLabel?: string;
  rightLabel?: string;
  neutralLo?: number;
  neutralHi?: number;
}) {
  const rightPct = 100 - leftPct;
  const even = leftPct >= neutralLo && leftPct <= neutralHi;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between font-mono text-[0.7rem] text-ink-3">
        <span>
          {leftLabel} <span className="text-ink-2">{Math.round(leftPct)}%</span>
        </span>
        <span>
          <span className="text-ink-2">{Math.round(rightPct)}%</span> {rightLabel}
        </span>
      </div>
      <div className="relative flex h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full transition-[width] duration-500"
          style={{ width: `${leftPct}%`, background: even ? "var(--c-good)" : "var(--c-accent)" }}
        />
        <div className="h-full flex-1" style={{ background: "var(--c-plum)", opacity: 0.5 }} />
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-surface" />
      </div>
    </div>
  );
}
