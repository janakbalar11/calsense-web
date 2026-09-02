export const nf = new Intl.NumberFormat("en-GB");

export const int = (n: number) => nf.format(Math.round(n));

export const oneDp = (n: number) =>
  new Intl.NumberFormat("en-GB", { maximumFractionDigits: 1 }).format(n);

export function signed(n: number, unit = ""): string {
  const r = Math.round(n);
  return `${r > 0 ? "+" : ""}${r}${unit}`;
}

export function durationMin(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

const DAY = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const TIME = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const MONTHDAY = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

export const fmtDate = (iso: string) => DAY.format(new Date(iso));
export const fmtMonthDay = (iso: string) => MONTHDAY.format(new Date(iso));
export const fmtTime = (iso: string) => TIME.format(new Date(iso));

export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}
