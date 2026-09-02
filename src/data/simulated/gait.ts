import type { RegionId } from "@/lib/types";
import { FOOT_REGIONS } from "@/lib/pressure";
import { clamp } from "@/lib/rng";

/**
 * A compact plantar-pressure model of one gait cycle.
 *
 * `phase` runs 0→1 over a full stride: roughly 0–0.62 is stance (foot on the
 * ground, load rolling heel → arch → ball → toe), 0.62–1 is swing (foot in the
 * air, ~zero load). Each region gets a gaussian "bump" in the cycle.
 */

type Bump = { mu: number; sigma: number; amp: number };

const MODEL: Record<RegionId, Bump> = {
  heel: { mu: 0.09, sigma: 0.09, amp: 1.0 },
  arch: { mu: 0.3, sigma: 0.16, amp: 0.5 },
  ball_outer: { mu: 0.42, sigma: 0.12, amp: 0.82 },
  ball_inner: { mu: 0.5, sigma: 0.12, amp: 1.0 },
  toes: { mu: 0.55, sigma: 0.09, amp: 0.46 },
  big_toe: { mu: 0.6, sigma: 0.1, amp: 0.88 },
};

const STANCE_END = 0.63;

function bump(p: number, b: Bump): number {
  const d = p - b.mu;
  return b.amp * Math.exp(-(d * d) / (2 * b.sigma * b.sigma));
}

export interface GaitShape {
  /** per-region emphasis multipliers, 1 = neutral */
  emphasis?: Partial<Record<RegionId, number>>;
  /** overall load scaling (e.g. lighter foot) */
  scale?: number;
}

/** Region intensities (0..1) for a given cycle phase. */
export function phaseIntensities(
  phase: number,
  shape: GaitShape = {},
): Record<RegionId, number> {
  const p = ((phase % 1) + 1) % 1;
  const swing = p > STANCE_END ? clamp(1 - (p - STANCE_END) / 0.12, 0, 1) : 1;
  const scale = shape.scale ?? 1;
  const out = {} as Record<RegionId, number>;
  for (const r of FOOT_REGIONS) {
    const e = shape.emphasis?.[r.id] ?? 1;
    out[r.id] = clamp(bump(p, MODEL[r.id]) * swing * e * scale, 0, 1);
  }
  return out;
}

/** Average region intensities across a whole stance — used for static maps. */
export function stanceAverageIntensities(shape: GaitShape = {}): Record<RegionId, number> {
  const acc = {} as Record<RegionId, number>;
  for (const r of FOOT_REGIONS) acc[r.id] = 0;
  const N = 48;
  for (let i = 0; i < N; i++) {
    const inst = phaseIntensities((i / N) * STANCE_END, shape);
    for (const r of FOOT_REGIONS) acc[r.id] += inst[r.id];
  }
  for (const r of FOOT_REGIONS) acc[r.id] = clamp((acc[r.id] / N) * 2.4, 0, 1);
  return acc;
}

/** Weighted centroid of region centroids → the live centre of pressure. */
export function copForIntensities(
  intensities: Record<RegionId, number>,
): { x: number; y: number } | null {
  let sx = 0;
  let sy = 0;
  let sw = 0;
  for (const r of FOOT_REGIONS) {
    const w = intensities[r.id] ** 1.5;
    sx += r.cx * w;
    sy += r.cy * w;
    sw += w;
  }
  if (sw < 0.02) return null;
  return { x: sx / sw, y: sy / sw };
}

/** A full-stance CoP path (heel → toe) for session/replay drawing. */
export function copPath(shape: GaitShape = {}, points = 26): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [];
  for (let i = 0; i < points; i++) {
    const phase = 0.03 + (i / (points - 1)) * (STANCE_END - 0.06);
    const c = copForIntensities(phaseIntensities(phase, shape));
    if (c) path.push(c);
  }
  return path;
}

/** Region intensities as positioned field samples for the foot renderer. */
export function regionField(
  intensities: Record<RegionId, number>,
): { x: number; y: number; v: number }[] {
  return FOOT_REGIONS.map((r) => ({ x: r.cx, y: r.cy, v: intensities[r.id] }));
}

export const GAIT_STANCE_END = STANCE_END;
