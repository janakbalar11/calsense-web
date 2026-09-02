import { useId, useMemo, useState } from "react";
import { fmtMonthDay } from "@/lib/format";

export interface TrendPoint {
  date: string;
  value: number;
  bandLo?: number;
  bandHi?: number;
}

/**
 * Hand-rolled line + area chart with an optional "typical range" band,
 * a faint grid, an emphasised endpoint, and a crosshair tooltip on hover.
 */
export function TrendChart({
  data,
  height = 220,
  color = "var(--c-accent)",
  unit = "",
  format = (v: number) => Math.round(v).toString(),
  yDomain,
}: {
  data: TrendPoint[];
  height?: number;
  color?: string;
  unit?: string;
  format?: (v: number) => string;
  yDomain?: [number, number];
}) {
  const uid = useId().replace(/:/g, "");
  const [hover, setHover] = useState<number | null>(null);

  const W = 720;
  const H = height;
  const padL = 40;
  const padR = 14;
  const padT = 14;
  const padB = 26;

  const { min, max } = useMemo(() => {
    const vals = data.flatMap((d) => [d.value, d.bandLo ?? d.value, d.bandHi ?? d.value]);
    let lo = yDomain ? yDomain[0] : Math.min(...vals);
    let hi = yDomain ? yDomain[1] : Math.max(...vals);
    if (!yDomain) {
      const pad = (hi - lo) * 0.12 || 1;
      lo -= pad;
      hi += pad;
    }
    return { min: lo, max: hi };
  }, [data, yDomain]);

  const x = (i: number) => padL + (i / (data.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - min) / (max - min || 1)) * (H - padT - padB);

  const linePath = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${x(data.length - 1).toFixed(1)},${y(min)} L${x(0).toFixed(1)},${y(min)} Z`;

  const hasBand = data.some((d) => d.bandLo !== undefined && d.bandHi !== undefined);
  const bandPath = hasBand
    ? `${data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.bandHi ?? d.value).toFixed(1)}`).join(" ")} ` +
      `${data.map((_, i) => `L${x(data.length - 1 - i).toFixed(1)},${y(data[data.length - 1 - i].bandLo ?? data[data.length - 1 - i].value).toFixed(1)}`).join(" ")} Z`
    : "";

  const ticks = 4;
  const gridVals = Array.from({ length: ticks + 1 }, (_, i) => min + (i / ticks) * (max - min));

  const labelEvery = Math.max(1, Math.floor(data.length / 6));

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full min-w-[520px]"
        style={{ height: H }}
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = ((e.clientX - rect.left) / rect.width) * W;
          const i = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1));
          setHover(Math.max(0, Math.min(data.length - 1, i)));
        }}
      >
        <defs>
          <linearGradient id={`area-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridVals.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} stroke="var(--c-line)" strokeWidth="1" />
            <text x={padL - 8} y={y(v) + 3.5} textAnchor="end" className="fill-ink-3 font-mono" fontSize="9">
              {format(v)}
            </text>
          </g>
        ))}

        {hasBand && <path d={bandPath} fill="var(--c-ink-3)" opacity="0.1" />}
        <path d={areaPath} fill={`url(#area-${uid})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

        {data.map((d, i) =>
          i % labelEvery === 0 || i === data.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle" className="fill-ink-3 font-mono" fontSize="9">
              {fmtMonthDay(d.date)}
            </text>
          ) : null,
        )}

        <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].value)} r="3.5" fill={color} />

        {hover !== null && (
          <g>
            <line x1={x(hover)} y1={padT} x2={x(hover)} y2={H - padB} stroke="var(--c-line-strong)" strokeWidth="1" />
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4" fill={color} stroke="var(--c-surface)" strokeWidth="2" />
            <g transform={`translate(${Math.min(x(hover) + 10, W - 120)}, ${padT + 6})`}>
              <rect width="112" height="40" rx="6" fill="var(--c-surface)" stroke="var(--c-line-strong)" />
              <text x="8" y="15" className="fill-ink-3 font-mono" fontSize="8.5">
                {fmtMonthDay(data[hover].date)}
              </text>
              <text x="8" y="31" className="fill-ink font-semibold" fontSize="12">
                {format(data[hover].value)}
                {unit}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
