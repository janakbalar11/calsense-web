import { Outlet, NavLink } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { IconLive, IconToday, IconTrends, IconInsights, IconZones } from "@/components/icons";

const MOBILE_NAV = [
  { to: "/", label: "Today", Icon: IconToday, end: true },
  { to: "/live", label: "Live", Icon: IconLive },
  { to: "/trends", label: "Trends", Icon: IconTrends },
  { to: "/insights", label: "Insights", Icon: IconInsights },
  { to: "/zones", label: "Zones", Icon: IconZones },
];

export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-6 pb-24 sm:px-8 lg:pb-10">
          <Outlet />
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-line bg-surface/95 backdrop-blur-md lg:hidden">
          {MOBILE_NAV.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.62rem] ${
                  isActive ? "text-accent-ink" : "text-ink-3"
                }`
              }
            >
              <Icon width={19} height={19} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
