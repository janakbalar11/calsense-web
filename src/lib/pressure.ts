import type { RegionId, RegionLoad, RegionMeta } from "./types";
import { clamp, lerp } from "./rng";

/** Foot artwork coordinate space. Toes at the top, heel at the bottom. */
export const FOOT_VB = { w: 100, h: 260 };

/**
 * Right-foot/shoe-insole outline: rounded heel, a pulled-in medial arch, a
 * wide ball of the foot, and a tapered toe box (big toe protruding) — a
 * pedobarography-style silhouette rather than an abstract pill shape. The
 * left foot is drawn by mirroring on X.
 */
export const FOOT_OUTLINE =
  "M72,6 C82,7 90,12 90,20 C93,32 94,42 94,50 C95,68 94,82 92,95 " +
  "C89,118 78,130 74,145 C70,162 80,180 85,195 C88,212 83,225 78,235 " +
  "C68,248 60,254 50,256 C40,254 32,248 22,235 C17,225 15,212 15,195 " +
  "C13,180 12,165 12,150 C11,135 10,115 10,100 C10,85 11,70 12,55 " +
  "C13,42 15,30 18,22 C22,14 28,9 35,6 C45,4 60,4 72,6 Z";

export const FOOT_REGIONS: RegionMeta[] = [
  { id: "big_toe", label: "Big toe", cx: 66, cy: 22 },
  { id: "toes", label: "Toes", cx: 36, cy: 26 },
  { id: "ball_inner", label: "Inner ball", cx: 63, cy: 92 },
  { id: "ball_outer", label: "Outer ball", cx: 33, cy: 96 },
  { id: "arch", label: "Arch", cx: 45, cy: 150 },
  { id: "heel", label: "Heel", cx: 47, cy: 210 },
];

export const REGION_LABEL: Record<RegionId, string> = Object.fromEntries(
  FOOT_REGIONS.map((r) => [r.id, r.label]),
) as Record<RegionId, string>;

export function regionMeta(id: RegionId): RegionMeta {
  return FOOT_REGIONS.find((r) => r.id === id)!;
}

/** Normalise a list of region loads (kPa) into 0..1 intensities for the map. */
export function loadsToIntensities(loads: RegionLoad[]): Record<RegionId, number> {
  const out = {} as Record<RegionId, number>;
  for (const r of FOOT_REGIONS) out[r.id] = 0;
  for (const l of loads) {
    out[l.region] = clamp(l.peakKpa / PRESSURE_SCALE_MAX_KPA, 0, 1);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 *  Colour ramps
 * ------------------------------------------------------------------ */

type Stop = { t: number; rgb: [number, number, number] };

/** Perceptually-ordered single-hue-ish sequential ramp: indigo → amber. */
const SEQ_STOPS: Stop[] = [
  { t: 0.0, rgb: [27, 26, 58] },
  { t: 0.22, rgb: [58, 33, 118] },
  { t: 0.44, rgb: [107, 43, 143] },
  { t: 0.63, rgb: [178, 50, 126] },
  { t: 0.82, rgb: [224, 92, 66] },
  { t: 1.0, rgb: [244, 174, 62] },
];

function sampleStops(stops: Stop[], t: number): string {
  const x = clamp(t, 0, 1);
  for (let i = 1; i < stops.length; i++) {
    if (x <= stops[i].t) {
      const a = stops[i - 1];
      const b = stops[i];
      const k = (x - a.t) / (b.t - a.t || 1);
      const r = Math.round(lerp(a.rgb[0], b.rgb[0], k));
      const g = Math.round(lerp(a.rgb[1], b.rgb[1], k));
      const bl = Math.round(lerp(a.rgb[2], b.rgb[2], k));
      return `rgb(${r} ${g} ${bl})`;
    }
  }
  const last = stops[stops.length - 1].rgb;
  return `rgb(${last[0]} ${last[1]} ${last[2]})`;
}

/** Absolute pressure colour. `t` is 0..1 (share of the fixed scale). */
export function pressureColor(t: number): string {
  return sampleStops(SEQ_STOPS, t);
}

export const PRESSURE_SCALE_MAX_KPA = 320;

export function kpaToColor(kpa: number): string {
  return pressureColor(kpa / PRESSURE_SCALE_MAX_KPA);
}

/** CSS gradient string for the legend bar. */
export const PRESSURE_GRADIENT = `linear-gradient(90deg, ${SEQ_STOPS.map(
  (s) => `${sampleStops(SEQ_STOPS, s.t)} ${Math.round(s.t * 100)}%`,
).join(", ")})`;

/** Diverging colour for "vs your baseline". pct is roughly -40..+40. */
export function baselineColor(pct: number): string {
  const x = clamp(pct / 35, -1, 1);
  if (Math.abs(x) < 0.06) return "rgb(138 132 150 / 0.55)";
  if (x < 0) {
    const k = -x;
    return `rgb(${Math.round(lerp(138, 47, k))} ${Math.round(
      lerp(132, 158, k),
    )} ${Math.round(lerp(150, 143, k))})`;
  }
  const k = x;
  return `rgb(${Math.round(lerp(138, 224, k))} ${Math.round(
    lerp(132, 122, k),
  )} ${Math.round(lerp(150, 31, k))})`;
}

export const BASELINE_GRADIENT =
  "linear-gradient(90deg, rgb(47 158 143) 0%, rgb(138 132 150) 50%, rgb(224 122 31) 100%)";
