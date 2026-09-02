import { useHistory, useInsights, useToday } from "@/data/DataContext";
import { Card, CardTitle, Eyebrow, Pill } from "@/components/ui/primitives";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { Sparkline } from "@/components/ui/Sparkline";
import { ScoreMeter, SplitMeter } from "@/components/ui/Meter";
import { FootMap } from "@/components/foot/FootMap";
import { PressureLegend } from "@/components/foot/PressureLegend";
import { InsightCard } from "@/components/InsightCard";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { durationMin, int, oneDp, signed } from "@/lib/format";

export function Today() {
  const today = useToday();
  const hist = useHistory(14);
  const insights = useInsights();

  if (today.error) return <ErrorNote error={today.error} />;
  if (!today.data || !hist.data) return <PageLoader />;

  const { day, scoreDelta7d, drivers, headlineInsightId } = today.data;
  const h = hist.data;
  const headline = insights.data?.find((i) => i.id === headlineInsightId);

  const posture = [
    { label: "Standing", min: day.standingMin, color: "var(--c-accent)" },
    { label: "Walking", min: day.walkingMin, color: "var(--c-plum)" },
    { label: "Sitting", min: day.sittingMin, color: "var(--c-ink-3)" },
  ];
  const postureTotal = posture.reduce((s, p) => s + p.min, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Foot health score + drivers */}
        <Card className="animate-rise lg:col-span-2">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="flex flex-col items-center gap-2">
              <ScoreRing value={day.footHealthScore} />
              <Pill tone={scoreDelta7d >= 0 ? "good" : "watch"}>
                {signed(scoreDelta7d)} in 7 days
              </Pill>
            </div>
            <div className="flex-1">
              <Eyebrow>What’s shaping today’s score</Eyebrow>
              <ul className="mt-3 flex flex-col gap-3">
                {drivers.map((d) => (
                  <li key={d.label} className="flex gap-3">
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{
                        background:
                          d.tone === "good"
                            ? "var(--c-good)"
                            : d.tone === "watch"
                              ? "var(--c-watch)"
                              : "var(--c-alert)",
                      }}
                    />
                    <div>
                      <p className="text-[0.9rem] font-medium text-ink">{d.label}</p>
                      <p className="text-[0.83rem] leading-relaxed text-ink-3">{d.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* Foot map */}
        <Card className="animate-rise">
          <CardTitle hint="Average pressure across today’s steps">Pressure map</CardTitle>
          <div className="flex items-end justify-center gap-6">
            <div className="w-24">
              <FootMap foot="left" intensities={day.footIntensity.left} />
              <p className="mt-1 text-center font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">
                Left
              </p>
            </div>
            <div className="w-24">
              <FootMap foot="right" intensities={day.footIntensity.right} />
              <p className="mt-1 text-center font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">
                Right
              </p>
            </div>
          </div>
          <div className="mt-4">
            <PressureLegend />
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Activity */}
        <Card className="animate-rise lg:col-span-2">
          <CardTitle hint="Today, with the last 14 days for context">Activity</CardTitle>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <StatWithSpark label="Steps" value={day.steps} series={h.map((d) => d.steps)} fmt={int} />
            <StatWithSpark
              label="Distance"
              value={day.distanceKm}
              unit="km"
              series={h.map((d) => d.distanceKm)}
              fmt={oneDp}
            />
            <StatWithSpark
              label="Time on feet"
              value={day.timeOnFeetMin}
              series={h.map((d) => d.timeOnFeetMin)}
              fmt={(v) => durationMin(v)}
            />
            <StatWithSpark
              label="Cadence"
              value={day.cadenceSpm}
              unit="spm"
              series={h.map((d) => d.cadenceSpm)}
              fmt={int}
            />
          </div>
        </Card>

        {/* Balance & load */}
        <Card className="animate-rise">
          <CardTitle hint="How evenly you’re loading">Balance &amp; load</CardTitle>
          <div className="flex flex-col gap-5">
            <ScoreMeter value={day.balanceScore} label="Standing steadiness" />
            <SplitMeter leftPct={day.leftLoadShare * 100} />
            <p className="text-[0.8rem] leading-relaxed text-ink-3">
              A little more weight is going through your left foot than your right — worth keeping an
              eye on alongside the forefoot trend.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Posture mix */}
        <Card className="animate-rise">
          <CardTitle hint={`${durationMin(day.activeMinutes)} of it active`}>Your day</CardTitle>
          <div className="flex h-3 overflow-hidden rounded-full">
            {posture.map((p) => (
              <div
                key={p.label}
                style={{ width: `${(p.min / postureTotal) * 100}%`, background: p.color }}
              />
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-1.5">
            {posture.map((p) => (
              <li key={p.label} className="flex items-center justify-between text-[0.83rem]">
                <span className="flex items-center gap-2 text-ink-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                  {p.label}
                </span>
                <span className="font-mono text-ink-3">{durationMin(p.min)}</span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Headline insight */}
        <div className="lg:col-span-2">
          {headline ? (
            <InsightCard insight={headline} />
          ) : (
            <Card className="h-full">
              <p className="text-[0.9rem] text-ink-3">No new insights today.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function StatWithSpark({
  label,
  value,
  unit,
  series,
  fmt,
}: {
  label: string;
  value: number;
  unit?: string;
  series: number[];
  fmt: (v: number) => string;
}) {
  const prev = series.length > 1 ? series[series.length - 2] : value;
  const delta = value - prev;
  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-[0.66rem] uppercase tracking-[0.1em] text-ink-3">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-[1.55rem] leading-none text-ink tabular-nums">{fmt(value)}</span>
        {unit && <span className="text-[0.78rem] text-ink-3">{unit}</span>}
      </div>
      <Sparkline data={series} width={110} height={26} />
      <span
        className={`font-mono text-[0.68rem] ${
          Math.abs(delta) < 0.01 ? "text-ink-3" : delta > 0 ? "text-good" : "text-ink-3"
        }`}
      >
        {delta >= 0 ? "▲" : "▼"} {fmt(Math.abs(delta))} vs yesterday
      </span>
    </div>
  );
}
