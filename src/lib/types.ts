/**
 * Domain types for the CalSense frontend.
 *
 * These mirror what a future backend is expected to return. The simulated
 * data source produces exactly these shapes, so swapping in a real API later
 * is a matter of reimplementing `DataSource` — no screen changes required.
 */

export type Foot = "left" | "right";

/** Lay-friendly plantar regions surfaced to users. */
export type RegionId =
  | "big_toe"
  | "toes"
  | "ball_inner"
  | "ball_outer"
  | "arch"
  | "heel";

export interface RegionMeta {
  id: RegionId;
  label: string;
  /** Normalised centroid within the foot viewBox (0..100 x, 0..260 y). */
  cx: number;
  cy: number;
}

export type TrendDirection = "up" | "down" | "flat";

export interface Profile {
  name: string;
  memberSince: string; // ISO date
  heightCm: number;
  weightKg: number;
  shoeSizeUk: number;
  footNote: string | null;
  consents: {
    cloudBackup: boolean;
    clinicianSharing: boolean;
    research: boolean;
  };
}

export interface DeviceStatus {
  model: string;
  firmware: string;
  connected: boolean;
  batteryPct: number;
  lastSync: string; // ISO datetime
  wearTimeTodayMin: number;
  calibration: {
    status: "good" | "check_soon" | "recalibrate";
    lastCalibrated: string; // ISO date
  };
  storageUsedMb: number;
}

/** One region's load picture for a day or session. */
export interface RegionLoad {
  region: RegionId;
  /** Peak plantar pressure, kPa. */
  peakKpa: number;
  /** Pressure–time integral for the period, kPa·s. */
  ptiKpaS: number;
  /** Percent vs the user's own 30-day baseline. +12 = 12% above normal. */
  vsBaselinePct: number;
}

export interface DaySummary {
  date: string; // ISO date
  steps: number;
  distanceKm: number;
  activeMinutes: number;
  timeOnFeetMin: number;
  standingMin: number;
  walkingMin: number;
  sittingMin: number;
  cadenceSpm: number;
  /** 0–100, higher = more even left/right use. */
  symmetryScore: number;
  /** 0–100 composite. */
  footHealthScore: number;
  balanceScore: number;
  regionLoads: RegionLoad[];
  leftLoadShare: number; // 0..1, share of total load taken by the left foot
  /** normalised (0..1) region pressure per foot, for the foot maps */
  footIntensity: Record<Foot, Record<RegionId, number>>;
}

export interface ScoreDriver {
  label: string;
  tone: "good" | "watch" | "alert";
  detail: string;
}

export interface TodaySummary {
  day: DaySummary;
  scoreDelta7d: number;
  drivers: ScoreDriver[];
  headlineInsightId: string;
}

export interface Insight {
  id: string;
  date: string; // ISO date
  severity: "info" | "watch" | "alert";
  title: string;
  /** what we saw */
  observation: string;
  /** what it means */
  meaning: string;
  /** what to try */
  action: string;
  region?: RegionId;
  foot?: Foot;
}

export interface WatchZone {
  foot: Foot;
  region: RegionId;
  severity: "watch" | "alert";
  /** days the zone has been flagged */
  daysActive: number;
  peakKpa: number;
  vsBaselinePct: number;
  /** last ~21 days of daily PTI for this zone */
  history: { date: string; ptiKpaS: number }[];
  note: string;
}

export type SessionKind = "walk" | "run" | "balance" | "daily";

export interface SessionSummary {
  id: string;
  kind: SessionKind;
  startedAt: string; // ISO datetime
  durationMin: number;
  steps: number;
  avgCadenceSpm: number;
  symmetryScore: number;
  /** center-of-pressure path points per foot, normalised to the foot viewBox */
  copPath: Record<Foot, { x: number; y: number }[]>;
  regionLoads: Record<Foot, RegionLoad[]>;
  note?: string;
}

/** A single sensor frame as the live view consumes it. */
export interface LiveFrame {
  t: number; // ms since stream start
  /** gait cycle phase per foot, 0..1 */
  phase: Record<Foot, number>;
  /** normalised pressure field samples per foot */
  field: Record<Foot, PressureSample[]>;
  /** live center of pressure per foot, foot viewBox coords */
  cop: Record<Foot, { x: number; y: number } | null>;
  cadenceSpm: number;
  symmetryScore: number;
  stepCount: number;
  /** total force per foot, 0..1 (share of bodyweight-ish) */
  load: Record<Foot, number>;
}

export interface PressureSample {
  x: number; // foot viewBox coords
  y: number;
  /** 0..1 normalised pressure */
  v: number;
}

export interface AssessmentResult {
  id: string;
  kind: "balance" | "walk";
  takenAt: string;
  /** headline 0–100 */
  score: number;
  metrics: { label: string; value: string; hint?: string }[];
  takeaway: string;
}
