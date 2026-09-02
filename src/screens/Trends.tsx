import { useMemo, useState } from "react";
import { useHistory } from "@/data/DataContext";
import type { DaySummary } from "@/lib/types";
import { Card, Segmented } from "@/components/ui/primitives";
import { TrendChart, type TrendPoint } from "@/components/ui/TrendChart";
import { Sparkline } from "@/components/ui/Sparkline";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { int, oneDp, signed } from "@/lib/format";

type MetricKey = "footHealth" | "steps" | "cadence" | "symmetry" | "balance" | "forefootLoad";

interface MetricDef {
  key: MetricKey;
  label: string;
  color: string;
  unit: string;
  get: (d: DaySummary) => number;
  fmt: (v: number) => string;
  band?: boolean;
}

const METRICS: MetricDef[] = [
  { key: "footHealth", label: "Foot Health Score", color: "var(--c-good)", unit: "", get: (d) => d.footHealthScore, fmt: (v) => Math.round(v).toString(), band: true },
  { key: "steps", label: "Steps", color: "var(--c-accent)", unit: "", get: (d) => d.steps, fmt: int, band: true },
  { key: "cadence", label: "Cadence", color: "var(--c-plum)", unit: " spm", get: (d) => d.cadenceSpm, fmt: (v) => Math.round(v).toString(), band: true },
  { key: "symmetry", label: "Gait symmetry", color: "var(--c-accent)", unit: "", get: (d) => d.symmetryScore, fmt: (v) => Math.round(v).toString(), band: true },
  { key: "balance", label: "Standing steadiness", color: "var(--c-good)", unit: "", get: (d) => d.balanceScore, fmt: (v) => Math.round(v).toString(), band: true },
  { key: "forefootLoad", label: "Left forefoot load", color: "var(--c-watch)", unit: " kPa·s", get: (d) => d.regionLoads.find((r) => r.region === "ball_inner")!.ptiKpaS, fmt: oneDp, band: false },
];

const RANGES = [
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
] as const;

function withBand(values: number[], on: boolean): { lo: number; hi: number }[] {
  if (!on) return values.map(() => ({ lo: NaN, hi: NaN }));
  return values.map((_, i) => {
    const from = Math.max(0, i - 10);
    const w = values.slice(from, i + 1);
    const mean = w.reduce((a, b) => a + b, 0) / w.length;
    const sd = Math.sqrt(w.reduce((a, b) => a + (b - mean) ** 2, 0) / w.length) || mean * 0.05;
    return { lo: mean - sd * 1.1, hi: mean + sd * 1.1 };
  });
}

export function Trends() {
  const [range, setRange] = useState<string>("30");
  const [metricKey, setMetricKey] = useState<MetricKey>("footHealth");
  const hist = useHistory(90);

  const days = Number(range);
  const metric = METRICS.find((m) => m.key === metricKey)!;

  const points: TrendPoint[] = useMemo(() => {
    if (!hist.data) return [];
    const slice = hist.data.slice(-days);
    const values = slice.map(metric.get);
    const bands = withBand(values, !!metric.band);
    return slice.map((d, i) => ({
      date: d.date,
      value: values[i],
      bandLo: metric.band ? bands[i].lo : undefined,
      bandHi: metric.band ? bands[i].hi : undefined,
    }));
  }, [hist.data, days, metric]);

  if (hist.error) return <ErrorNote error={hist.error} />;
  if (!hist.data) return <PageLoader />;

  const slice = hist.data.slice(-days);
  const cur = metric.get(slice[slice.length - 1]);
  const first = metric.get(slice[0]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMetricKey(m.key)}
                className={`rounded-full border px-3 py-1 text-[0.78rem] transition-colors ${
                  m.key === metricKey
                    ? "border-accent/40 bg-accent/10 text-ink"
                    : "border-line text-ink-3 hover:text-ink-2"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <Segmented
            value={range}
            onChange={setRange}
            options={RANGES.map((r) => ({ value: r.value as string, label: r.label }))}
          />
        </div>

        <div className="mb-1 flex items-baseline gap-3">
          <span className="font-display text-[2rem] leading-none text-ink tabular-nums">
            {metric.fmt(cur)}
            <span className="text-[0.9rem] text-ink-3">{metric.unit}</span>
          </span>
          <span className={`text-[0.82rem] font-medium ${cur - first >= 0 ? "text-good" : "text-alert"}`}>
            {signed(cur - first)} over {days} days
          </span>
        </div>
        {metric.band && (
          <p className="mb-3 flex items-center gap-2 text-[0.75rem] text-ink-3">
            <span className="inline-block h-2 w-4 rounded-sm bg-ink-3/15" /> shaded band = your typical range
          </p>
        )}

        <TrendChart data={points} color={metric.color} unit={metric.unit} format={metric.fmt} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.filter((m) => m.key !== metricKey).map((m) => {
          const vals = slice.map(m.get);
          const d = vals[vals.length - 1] - vals[0];
          return (
            <Card key={m.key} padded={false} className="animate-rise">
              <button
                type="button"
                onClick={() => setMetricKey(m.key)}
                className="w-full rounded-[var(--radius-card)] p-5 text-left transition-colors hover:bg-surface-2"
              >
                <p className="mb-3 font-display text-[1.02rem] text-ink">{m.label}</p>
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <span className="font-display text-[1.5rem] text-ink tabular-nums">
                      {m.fmt(vals[vals.length - 1])}
                    </span>
                    <span className="text-[0.78rem] text-ink-3">{m.unit}</span>
                    <p className={`text-[0.75rem] ${d >= 0 ? "text-good" : "text-alert"}`}>
                      {signed(d)} · {days}d
                    </p>
                  </div>
                  <Sparkline data={vals} color={m.color} width={110} height={34} />
                </div>
              </button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
