import { useEffect, useState } from "react";
import { useDevice } from "@/data/DataContext";
import { Card, CardTitle, Dot, Pill } from "@/components/ui/primitives";
import { PageLoader, ErrorNote } from "@/components/ui/PageLoader";
import { durationMin, fmtDate, relativeTime } from "@/lib/format";

const CAL_COPY: Record<string, { tone: "good" | "watch" | "alert"; label: string; note: string }> = {
  good: { tone: "good", label: "Good", note: "Your last calibration is holding well." },
  check_soon: { tone: "watch", label: "Check soon", note: "Worth recalibrating in the next few days for the sharpest readings." },
  recalibrate: { tone: "alert", label: "Recalibrate", note: "Readings may drift until you recalibrate — it takes about a minute." },
};

export function Device() {
  const device = useDevice();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  if (device.error) return <ErrorNote error={device.error} />;
  if (!device.data) return <PageLoader />;

  const d = device.data;
  const cal = CAL_COPY[d.calibration.status];

  return (
    <div className="flex flex-col gap-4">
      <Card className="animate-rise">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent/12 text-2xl">👣</span>
            <div>
              <h3 className="font-display text-[1.2rem] text-ink">{d.model}</h3>
              <p className="text-[0.82rem] text-ink-3">Firmware {d.firmware}</p>
            </div>
          </div>
          <Pill tone={d.connected ? "good" : "alert"}>
            <Dot tone={d.connected ? "good" : "alert"} />
            {d.connected ? "Connected" : "Disconnected"}
          </Pill>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="animate-rise">
          <CardTitle>Battery</CardTitle>
          <div className="flex items-end gap-3">
            <span className="font-display text-[2.4rem] leading-none text-ink tabular-nums">{d.batteryPct}%</span>
            <span className="pb-1 text-[0.8rem] text-ink-3">≈ {Math.round((d.batteryPct / 100) * 11)}h left</span>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full"
              style={{
                width: `${d.batteryPct}%`,
                background: d.batteryPct > 25 ? "var(--c-good)" : "var(--c-alert)",
              }}
            />
          </div>
        </Card>

        <Card className="animate-rise">
          <CardTitle>Worn today</CardTitle>
          <span className="font-display text-[2.4rem] leading-none text-ink tabular-nums">
            {durationMin(d.wearTimeTodayMin)}
          </span>
          <p className="mt-2 text-[0.8rem] text-ink-3">
            Aim for a consistent daily wear time so trends compare fairly.
          </p>
        </Card>

        <Card className="animate-rise">
          <CardTitle>Last sync</CardTitle>
          <span className="font-display text-[1.6rem] leading-none text-ink">{relativeTime(d.lastSync)}</span>
          <p className="mt-2 text-[0.8rem] text-ink-3">{d.storageUsedMb} MB of readings stored on the insole.</p>
        </Card>
      </div>

      <Card className="animate-rise">
        <CardTitle hint={`Last calibrated ${fmtDate(d.calibration.lastCalibrated)}`}>Calibration</CardTitle>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Pill tone={cal.tone}>{cal.label}</Pill>
            <p className="max-w-sm text-[0.85rem] text-ink-2">{cal.note}</p>
          </div>
          <button
            type="button"
            onClick={() => setToast("Calibration runs on the device — connect an insole to start.")}
            className="rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] font-medium text-ink transition-colors hover:bg-surface-2"
          >
            Recalibrate
          </button>
        </div>
      </Card>

      <Card className="animate-rise">
        <CardTitle>Maintenance</CardTitle>
        <ul className="flex flex-col divide-y divide-line">
          {[
            ["Check for firmware updates", "You’re on the latest version."],
            ["Forget this device", "Unpairs the insoles from this account."],
          ].map(([label, note]) => (
            <li key={label} className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-[0.9rem] text-ink">{label}</p>
                <p className="text-[0.78rem] text-ink-3">{note}</p>
              </div>
              <button
                type="button"
                onClick={() => setToast("This action needs the backend — coming soon.")}
                className="text-[0.82rem] text-accent-ink hover:underline"
              >
                Open
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full border border-line bg-surface px-4 py-2 text-[0.82rem] text-ink-2 shadow-lg lg:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}
