import { useLocation } from "react-router-dom";
import { useDevice } from "@/data/DataContext";
import { useTheme } from "@/lib/theme";
import { relativeTime } from "@/lib/format";
import { IconMoon, IconSun } from "@/components/icons";
import { Dot } from "@/components/ui/primitives";

const TITLES: Record<string, string> = {
  "/": "Today",
  "/live": "Live view",
  "/trends": "Trends",
  "/insights": "Insights",
  "/zones": "Watch zones",
  "/assessments": "Assessments",
  "/device": "Device",
  "/profile": "Profile & data",
};

const SUBTITLES: Record<string, string> = {
  "/": "A one-glance picture of how your feet are doing",
  "/live": "Real-time pressure while you walk",
  "/trends": "How your metrics move over time",
  "/insights": "What we noticed, what it means, what to try",
  "/zones": "Spots that are carrying more load than usual",
  "/assessments": "Guided balance and walk tests",
  "/device": "Your insoles, battery and calibration",
  "/profile": "Your details, consents and data",
};

export function Topbar() {
  const { pathname } = useLocation();
  const { theme, toggle } = useTheme();
  const device = useDevice();

  const now = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 px-5 py-3.5 backdrop-blur-md sm:px-8">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.3rem] leading-tight text-ink">
            {TITLES[pathname] ?? "CalSense"}
          </h1>
          <p className="text-[0.8rem] text-ink-3">{SUBTITLES[pathname] ?? now}</p>
        </div>

        <div className="flex items-center gap-2.5">
          {device.data && (
            <span className="hidden items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.75rem] text-ink-2 sm:flex">
              <Dot tone={device.data.connected ? "good" : "alert"} />
              {device.data.connected ? "Insoles connected" : "Disconnected"}
              <span className="text-ink-3">·</span>
              <span className="tabular-nums">{device.data.batteryPct}%</span>
              <span className="text-ink-3">·</span>
              <span className="text-ink-3">synced {relativeTime(device.data.lastSync)}</span>
            </span>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle colour theme"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-ink-2 transition-colors hover:text-ink"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </div>
    </header>
  );
}
