import { useCountUp } from "./primitives";

export function scoreBand(v: number): { label: string; color: string } {
  if (v >= 85) return { label: "Strong", color: "var(--c-good)" };
  if (v >= 70) return { label: "Steady", color: "var(--c-accent)" };
  if (v >= 55) return { label: "Watch", color: "var(--c-watch)" };
  return { label: "Needs care", color: "var(--c-alert)" };
}

export function ScoreRing({
  value,
  size = 168,
  stroke = 12,
  label = "Foot Health",
  sublabel,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sublabel?: string;
}) {
  const shown = useCountUp(value, 900);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, shown)) / 100;
  const band = scoreBand(value);

  return (
    <div
      className="relative inline-grid place-items-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--c-line)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={band.color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-display text-[2.5rem] leading-none text-ink tabular-nums">
            {Math.round(shown)}
          </div>
          <div className="mt-1 font-mono text-[0.64rem] uppercase tracking-[0.14em] text-ink-3">
            {label}
          </div>
          <div
            className="mt-1 text-[0.78rem] font-medium"
            style={{ color: band.color }}
          >
            {sublabel ?? band.label}
          </div>
        </div>
      </div>
    </div>
  );
}
