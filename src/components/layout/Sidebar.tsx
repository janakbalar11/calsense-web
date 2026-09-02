import { NavLink } from "react-router-dom";
import {
  IconAssess,
  IconDevice,
  IconFoot,
  IconInsights,
  IconLive,
  IconProfile,
  IconToday,
  IconTrends,
  IconZones,
} from "@/components/icons";

const NAV = [
  { to: "/", label: "Today", Icon: IconToday, end: true },
  { to: "/live", label: "Live view", Icon: IconLive },
  { to: "/trends", label: "Trends", Icon: IconTrends },
  { to: "/insights", label: "Insights", Icon: IconInsights },
  { to: "/zones", label: "Watch zones", Icon: IconZones },
  { to: "/assessments", label: "Assessments", Icon: IconAssess },
];

const NAV_SECONDARY = [
  { to: "/device", label: "Device", Icon: IconDevice },
  { to: "/profile", label: "Profile & data", Icon: IconProfile },
];

function Item({ to, label, Icon, end }: (typeof NAV)[number]) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-2 text-[0.9rem] transition-colors ${
          isActive
            ? "bg-accent/12 text-ink font-medium"
            : "text-ink-3 hover:bg-surface-2 hover:text-ink-2"
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={isActive ? "text-accent-ink" : ""} />
          {label}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface/60 px-3 py-5 lg:flex">
      <div className="flex items-center gap-2.5 px-2 pb-6">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent-ink">
          <IconFoot />
        </span>
        <span className="font-display text-[1.15rem] tracking-tight text-ink">CalSense</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </nav>

      <div className="my-4 h-px bg-line" />

      <nav className="flex flex-col gap-0.5">
        {NAV_SECONDARY.map((n) => (
          <Item key={n.to} {...n} />
        ))}
      </nav>

      <div className="mt-auto px-2 pt-4">
        <p className="font-mono text-[0.62rem] leading-relaxed text-ink-3">
          Preview build · simulated data.
          <br />
          No sensor connected.
        </p>
      </div>
    </aside>
  );
}
