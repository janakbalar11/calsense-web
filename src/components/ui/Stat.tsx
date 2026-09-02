import type { ReactNode } from "react";
import { useCountUp } from "./primitives";

function fmt(n: number, decimals: number) {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);
}

export function StatTile({
  label,
  value,
  unit,
  decimals = 0,
  delta,
  deltaLabel,
  footnote,
  countUp = true,
}: {
  label: string;
  value: number;
  unit?: string;
  decimals?: number;
  delta?: number;
  deltaLabel?: string;
  footnote?: ReactNode;
  countUp?: boolean;
}) {
  const shown = useCountUp(countUp ? value : value);
  const display = fmt(countUp ? shown : value, decimals);
  const deltaTone =
    delta === undefined || Math.abs(delta) < 0.5
      ? "text-ink-3"
      : delta > 0
        ? "text-good"
        : "text-alert";

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-3">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5">
        <span className="font-display text-[1.9rem] leading-none text-ink tabular-nums">
          {display}
        </span>
        {unit && <span className="text-[0.85rem] text-ink-3">{unit}</span>}
      </div>
      {(delta !== undefined || footnote) && (
        <div className="flex items-center gap-2 text-[0.78rem]">
          {delta !== undefined && (
            <span className={`font-medium tabular-nums ${deltaTone}`}>
              {delta > 0 ? "▲" : delta < 0 ? "▼" : "–"} {fmt(Math.abs(delta), decimals)}
              {deltaLabel ? ` ${deltaLabel}` : ""}
            </span>
          )}
          {footnote && <span className="text-ink-3">{footnote}</span>}
        </div>
      )}
    </div>
  );
}
