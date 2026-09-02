import { useHistory, useWatchZones } from "@/data/DataContext";
import { Card, CardTitle, Pill } from "@/components/ui/primitives";
import { FootMap } from "@/components/foot/FootMap";
import { PressureLegend } from "@/components/foot/PressureLegend";
import { TrendChart } from "@/components/ui/TrendChart";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { FOOT_REGIONS, REGION_LABEL } from "@/lib/pressure";
import { oneDp, signed } from "@/lib/format";

export function WatchZones() {
  const zones = useWatchZones();
  const hist = useHistory(1);

  if (zones.error) return <ErrorNote error={zones.error} />;
  if (!zones.data || !hist.data) return <PageLoader />;

  const today = hist.data[hist.data.length - 1];
  const flagged = new Set(zones.data.map((z) => `${z.foot}:${z.region}`));

  return (
    <div className="flex flex-col gap-4">
      {zones.data.length === 0 && (
        <Card className="animate-rise">
          <p className="text-[0.95rem] text-ink">No watch zones right now — every area of both feet is within your normal range.</p>
        </Card>
      )}

      {zones.data.map((zone) => (
        <Card key={`${zone.foot}-${zone.region}`} className="animate-rise">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <Pill tone={zone.severity}>{zone.severity === "watch" ? "Worth watching" : "Needs attention"}</Pill>
              <h3 className="mt-2 font-display text-[1.2rem] text-ink">
                {zone.foot === "left" ? "Left" : "Right"} foot · {REGION_LABEL[zone.region]}
              </h3>
              <p className="text-[0.8rem] text-ink-3">Flagged for {zone.daysActive} days</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[150px_1fr]">
            <div>
              <FootMap
                foot={zone.foot}
                intensities={today.footIntensity[zone.foot]}
                interactive
                selected={zone.region}
              />
              <div className="mt-3">
                <PressureLegend />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-3">
                <Metric label="Peak pressure" value={`${zone.peakKpa}`} unit="kPa" />
                <Metric label="vs your baseline" value={signed(zone.vsBaselinePct, "%")} tone="watch" />
                <Metric label="Trend" value="Rising" tone="watch" />
              </div>

              <div>
                <p className="mb-2 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-ink-3">
                  Daily load here · last 21 days
                </p>
                <TrendChart
                  data={zone.history.map((h) => ({ date: h.date, value: h.ptiKpaS }))}
                  height={150}
                  color="var(--c-watch)"
                  unit=" kPa·s"
                  format={oneDp}
                />
              </div>

              <div className="rounded-lg border border-line bg-surface-2 p-4">
                <p className="text-[0.86rem] leading-relaxed text-ink-2">{zone.note}</p>
                <ul className="mt-3 flex flex-col gap-1.5 text-[0.84rem] text-ink-2">
                  <li className="flex gap-2"><span className="text-accent-ink">→</span> Rotate to a different pair of shoes for a few days.</li>
                  <li className="flex gap-2"><span className="text-accent-ink">→</span> Check any insoles or orthotics are seated flat.</li>
                  <li className="flex gap-2"><span className="text-accent-ink">→</span> Glance at the skin here when you take your socks off.</li>
                  <li className="flex gap-2"><span className="text-accent-ink">→</span> If it keeps climbing next week, mention it to your clinician.</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      ))}

      <Card className="animate-rise">
        <CardTitle hint="Within your normal range">Everything else looks fine</CardTitle>
        <div className="flex flex-wrap gap-2">
          {(["left", "right"] as const).flatMap((foot) =>
            FOOT_REGIONS.filter((r) => !flagged.has(`${foot}:${r.id}`)).map((r) => (
              <span
                key={`${foot}-${r.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-[0.75rem] text-ink-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-good" />
                {foot === "left" ? "L" : "R"} · {r.label}
              </span>
            )),
          )}
        </div>
      </Card>
    </div>
  );
}

function Metric({
  label,
  value,
  unit,
  tone = "neutral",
}: {
  label: string;
  value: string;
  unit?: string;
  tone?: "neutral" | "watch";
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 p-3">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-3">{label}</p>
      <p
        className={`mt-1 font-display text-[1.3rem] tabular-nums ${
          tone === "watch" ? "text-watch" : "text-ink"
        }`}
      >
        {value}
        {unit && <span className="text-[0.7rem] text-ink-3"> {unit}</span>}
      </p>
    </div>
  );
}
