import type {
  AssessmentResult,
  DaySummary,
  DeviceStatus,
  Foot,
  Insight,
  Profile,
  RegionId,
  RegionLoad,
  SessionSummary,
  TodaySummary,
  WatchZone,
} from "@/lib/types";
import { FOOT_REGIONS } from "@/lib/pressure";
import { clamp, lerp, makeRng } from "@/lib/rng";
import { copPath, stanceAverageIntensities, type GaitShape } from "./gait";
import { isoDaysAgo } from "@/lib/format";

const SEED = 20260901;
const HISTORY_DAYS = 90;

/** Persistent left/right gait character for this simulated user:
 *  a mild left-side overpronation pattern that has crept up recently. */
export const LEFT_SHAPE: GaitShape = {
  emphasis: { ball_inner: 1.34, big_toe: 1.2, arch: 1.14, heel: 0.94 },
};
export const RIGHT_SHAPE: GaitShape = {
  emphasis: { ball_outer: 1.08, heel: 1.04 },
};

const REGION_BIAS: Record<RegionId, number> = {
  big_toe: 6,
  toes: -8,
  ball_inner: 14,
  ball_outer: 8,
  arch: -22,
  heel: 18,
};

function isWeekend(iso: string) {
  const d = new Date(iso).getDay();
  return d === 0 || d === 6;
}

function buildDays(): DaySummary[] {
  const rng = makeRng(SEED);
  const days: DaySummary[] = [];

  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const date = isoDaysAgo(i);
    const progress = 1 - i / HISTORY_DAYS; // 0 (old) → 1 (recent)
    const recencyDrift = clamp((progress - 0.72) / 0.28, 0, 1); // ramps in over last ~25 days

    const restDay = rng.chance(0.06);
    const weekendBoost = isWeekend(date) ? rng.range(900, 2200) : 0;
    const steps = restDay
      ? Math.round(rng.range(1800, 3600))
      : Math.round(
          6600 + progress * 900 + weekendBoost + rng.gauss(0, 1) * 1400,
        );

    const cadence = clamp(110 + rng.gauss(0, 1) * 3.2 - recencyDrift * 1.5, 98, 122);
    const distanceKm = +(steps * (0.00073 + rng.range(-0.00003, 0.00003))).toFixed(2);
    const timeOnFeet = clamp(steps / 42 + rng.gauss(0, 1) * 22, 90, 460);
    const standing = clamp(timeOnFeet * rng.range(0.32, 0.44), 20, 260);
    const walking = clamp(timeOnFeet - standing, 30, 360);
    const activeMinutes = clamp(walking * rng.range(0.5, 0.72), 12, 220);
    const sitting = clamp(560 - timeOnFeet + rng.gauss(0, 1) * 30, 180, 620);

    const symmetry = clamp(
      90 - recencyDrift * 7 + rng.gauss(0, 1) * 2.4 - (restDay ? 0 : 0),
      70,
      97,
    );
    const balance = clamp(82 - recencyDrift * 3 + rng.gauss(0, 1) * 3.5, 66, 93);
    const footHealth = clamp(
      86 - recencyDrift * 9 + progress * 2 + rng.gauss(0, 1) * 2.2,
      68,
      94,
    );

    const leftShare = clamp(0.5 + 0.028 + recencyDrift * 0.02 + rng.gauss(0, 1) * 0.012, 0.44, 0.6);

    // combined region loads for the day
    const baseL = stanceAverageIntensities(LEFT_SHAPE);
    const baseR = stanceAverageIntensities(RIGHT_SHAPE);
    const loadIndex = steps / 7400;
    const regionLoads: RegionLoad[] = FOOT_REGIONS.map((r) => {
      let intensity = (baseL[r.id] * leftShare + baseR[r.id] * (1 - leftShare)) * 2;
      if (r.id === "ball_inner") intensity *= 1 + recencyDrift * 0.16;
      const peakKpa = clamp(
        intensity * 150 + REGION_BIAS[r.id] + rng.gauss(0, 1) * 7,
        18,
        315,
      );
      const ptiKpaS = clamp(peakKpa * lerp(0.08, 0.14, loadIndex) * (0.6 + loadIndex * 0.5), 2, 60);
      return { region: r.id, peakKpa: Math.round(peakKpa), ptiKpaS: +ptiKpaS.toFixed(1), vsBaselinePct: 0 };
    });

    days.push({
      date,
      steps,
      distanceKm,
      activeMinutes: Math.round(activeMinutes),
      timeOnFeetMin: Math.round(timeOnFeet),
      standingMin: Math.round(standing),
      walkingMin: Math.round(walking),
      sittingMin: Math.round(sitting),
      cadenceSpm: Math.round(cadence),
      symmetryScore: Math.round(symmetry),
      footHealthScore: Math.round(footHealth),
      balanceScore: Math.round(balance),
      regionLoads,
      leftLoadShare: +leftShare.toFixed(3),
      footIntensity: { left: {}, right: {} } as DaySummary["footIntensity"],
    });
  }

  // second pass: vsBaselinePct against each region's trailing 30-day mean
  for (let i = 0; i < days.length; i++) {
    const from = Math.max(0, i - 30);
    for (const rl of days[i].regionLoads) {
      const window = days.slice(from, i + 1).map((d) => d.regionLoads.find((x) => x.region === rl.region)!.ptiKpaS);
      const mean = window.reduce((a, b) => a + b, 0) / window.length || rl.ptiKpaS;
      rl.vsBaselinePct = Math.round(((rl.ptiKpaS - mean) / mean) * 100);
    }
  }

  // third pass: per-foot intensities for the foot maps
  for (const d of days) {
    d.footIntensity = {
      left: footIntensities(d, "left"),
      right: footIntensities(d, "right"),
    };
  }

  return days;
}

function footIntensities(day: DaySummary, foot: Foot): Record<RegionId, number> {
  const shape = foot === "left" ? LEFT_SHAPE : RIGHT_SHAPE;
  const share = foot === "left" ? day.leftLoadShare : 1 - day.leftLoadShare;
  const activity = clamp(day.steps / 8200, 0.55, 1.15);
  const base = stanceAverageIntensities(shape);
  const out = {} as Record<RegionId, number>;
  for (const r of FOOT_REGIONS) {
    let v = base[r.id] * (0.8 + share) * activity;
    if (foot === "left" && r.id === "ball_inner") {
      const drift = day.regionLoads.find((x) => x.region === "ball_inner")!.vsBaselinePct;
      v *= 1 + clamp(drift / 100, 0, 0.3);
    }
    out[r.id] = +clamp(v, 0, 1).toFixed(3);
  }
  return out;
}

const DAYS = buildDays();

export function getHistory(days: number): DaySummary[] {
  return DAYS.slice(Math.max(0, DAYS.length - days));
}


export function getToday(): TodaySummary {
  const day = DAYS[DAYS.length - 1];
  const weekAgo = DAYS[DAYS.length - 8] ?? DAYS[0];
  const ballInner = day.regionLoads.find((r) => r.region === "ball_inner")!;
  const heel = day.regionLoads.find((r) => r.region === "heel")!;

  return {
    day,
    scoreDelta7d: day.footHealthScore - weekAgo.footHealthScore,
    drivers: [
      {
        label: "Left inner ball load rising",
        tone: "watch",
        detail: `Pressure under the ball of your left foot is ${ballInner.vsBaselinePct > 0 ? ballInner.vsBaselinePct : 12}% above your usual and has been climbing for two weeks.`,
      },
      {
        label: "Even heel strike",
        tone: "good",
        detail: `Both heels are landing with similar force (${heel.peakKpa} kPa) — a sign of a controlled, symmetric stride.`,
      },
      {
        label: "Consistent activity",
        tone: "good",
        detail: `${Math.round(day.steps / 100) * 100} steps today, close to your 7-day average. Steady daily load helps your feet adapt.`,
      },
    ],
    headlineInsightId: "ins-001",
  };
}

export const PROFILE: Profile = {
  name: "Janak",
  memberSince: isoDaysAgo(118),
  heightCm: 178,
  weightKg: 74,
  shoeSizeUk: 9,
  footNote: "Mild left-foot overpronation noted at fitting",
  consents: { cloudBackup: true, clinicianSharing: false, research: true },
};

export const DEVICE: DeviceStatus = {
  model: "CalSense Insole · Gen 1",
  firmware: "1.4.2",
  connected: true,
  batteryPct: 82,
  lastSync: new Date(Date.now() - 14 * 60000).toISOString(),
  wearTimeTodayMin: 386,
  calibration: { status: "good", lastCalibrated: isoDaysAgo(6) },
  storageUsedMb: 47,
};

export const INSIGHTS: Insight[] = [
  {
    id: "ins-001",
    date: isoDaysAgo(0),
    severity: "watch",
    title: "Load is shifting onto your left forefoot",
    observation:
      "Over the last 14 days, pressure under the ball of your left foot (near the big-toe joint) has risen about 18% above your personal baseline, while the right foot is unchanged.",
    meaning:
      "This is the classic signature of the foot rolling slightly inward as you push off. On its own it is not a problem, but a steady climb is worth keeping an eye on — repeated high load in one small area is what leads to hot spots and calluses.",
    action:
      "Rotate to a different pair of shoes for the next few days and see if the pattern eases. If you use orthotics, check they are still seated correctly. Mention it at your next check-up if it keeps rising.",
    region: "ball_inner",
    foot: "left",
  },
  {
    id: "ins-002",
    date: isoDaysAgo(3),
    severity: "info",
    title: "Your walking rhythm is very consistent",
    observation:
      "Your cadence has stayed within a tight 108–114 steps-per-minute band all week, across both short walks and longer ones.",
    meaning:
      "A stable cadence usually means a relaxed, efficient stride. It also makes every other metric easier to read, because we are comparing like with like day to day.",
    action: "Nothing to change — this is a good baseline to keep.",
  },
  {
    id: "ins-003",
    date: isoDaysAgo(6),
    severity: "info",
    title: "Balance improved after your Tuesday session",
    observation:
      "Your standing-balance score went from 74 to 82 in the week after you started the short daily balance drill.",
    meaning:
      "Less sway when standing still is linked to better control of the small muscles in the foot and ankle.",
    action: "Keep the drill going — the gain tends to fade within a couple of weeks if you stop.",
  },
  {
    id: "ins-004",
    date: isoDaysAgo(9),
    severity: "info",
    title: "Longer time on your feet on weekends",
    observation:
      "Saturday and Sunday averaged 5h 40m on your feet versus 4h 10m on weekdays.",
    meaning:
      "Weekend activity is fine, but a big swing between rest and load days gives your feet less chance to adapt gradually.",
    action: "If weekends feel heavy, a short walk on quieter days can smooth the load out.",
  },
  {
    id: "ins-005",
    date: isoDaysAgo(13),
    severity: "watch",
    title: "Slight drop in left/right evenness",
    observation:
      "Your symmetry score eased from the low 90s to the mid 80s over the last two weeks, mostly driven by a longer stance time on the right foot.",
    meaning:
      "Small asymmetries are normal and often come and go with footwear or minor niggles. A sustained drift is the thing to watch.",
    action:
      "Have a look at wear on your shoe soles — uneven wear often explains a gradual symmetry shift.",
  },
  {
    id: "ins-006",
    date: isoDaysAgo(18),
    severity: "info",
    title: "Heel strike is well controlled",
    observation:
      "Your loading rate at heel contact sits comfortably in the typical range and has not spiked on any run this month.",
    meaning: "A gentle heel strike means less impact travelling up through the leg.",
    action: "No action needed.",
  },
];

function makeSession(
  id: string,
  kind: SessionSummary["kind"],
  daysAgo: number,
  hour: number,
  durationMin: number,
  note?: string,
): SessionSummary {
  const rng = makeRng(SEED + daysAgo * 17 + id.length);
  const started = new Date(isoDaysAgo(daysAgo) + `T${String(hour).padStart(2, "0")}:12:00`);
  const cadence = Math.round(clamp(112 + rng.gauss(0, 1) * 4, 96, 124));
  const steps = kind === "balance" ? 0 : Math.round((durationMin * cadence) / (kind === "run" ? 1 : 1.9));
  const regionLoads = {
    left: FOOT_REGIONS.map((r) => rl(r.id, LEFT_SHAPE, rng, kind)),
    right: FOOT_REGIONS.map((r) => rl(r.id, RIGHT_SHAPE, rng, kind)),
  } as Record<Foot, RegionLoad[]>;
  return {
    id,
    kind,
    startedAt: started.toISOString(),
    durationMin,
    steps,
    avgCadenceSpm: cadence,
    symmetryScore: Math.round(clamp(88 - daysAgo * 0.15 + rng.gauss(0, 1) * 2.5, 72, 96)),
    copPath: { left: copPath(LEFT_SHAPE), right: copPath(RIGHT_SHAPE) },
    regionLoads,
    note,
  };
}

function rl(region: RegionId, shape: GaitShape, rng: ReturnType<typeof makeRng>, kind: SessionSummary["kind"]): RegionLoad {
  const base = stanceAverageIntensities(shape)[region];
  const k = kind === "run" ? 1.5 : kind === "balance" ? 0.6 : 1;
  const peak = clamp(base * 240 * k + REGION_BIAS[region] + rng.gauss(0, 1) * 8, 16, 340);
  return {
    region,
    peakKpa: Math.round(peak),
    ptiKpaS: +(peak * 0.12).toFixed(1),
    vsBaselinePct: Math.round(rng.gauss(0, 1) * 8 + (region === "ball_inner" && shape === LEFT_SHAPE ? 16 : 0)),
  };
}

export const SESSIONS: SessionSummary[] = [
  makeSession("sess-06", "walk", 0, 8, 22, "Morning walk to the station"),
  makeSession("sess-05", "run", 2, 18, 34, "Evening 5k"),
  makeSession("sess-04", "balance", 4, 7, 2, "Daily balance drill"),
  makeSession("sess-03", "walk", 5, 13, 46, "Lunch loop"),
  makeSession("sess-02", "walk", 8, 9, 18),
  makeSession("sess-01", "run", 11, 18, 28, "Tempo run"),
];

export function getWatchZones(): WatchZone[] {
  const last21 = getHistory(21);
  const history = last21.map((d) => ({
    date: d.date,
    ptiKpaS: d.regionLoads.find((r) => r.region === "ball_inner")!.ptiKpaS * 1.08,
  }));
  const latest = last21[last21.length - 1].regionLoads.find((r) => r.region === "ball_inner")!;
  return [
    {
      foot: "left",
      region: "ball_inner",
      severity: "watch",
      daysActive: 14,
      peakKpa: Math.min(312, latest.peakKpa + 22),
      vsBaselinePct: Math.max(15, latest.vsBaselinePct),
      history,
      note: "Load here has climbed steadily for two weeks. Not high enough to be a concern yet, but the trend is the thing to watch. Rotating footwear often resets it.",
    },
  ];
}

export const ASSESSMENTS: AssessmentResult[] = [
  {
    id: "asr-04",
    kind: "balance",
    takenAt: new Date(isoDaysAgo(1) + "T07:20:00").toISOString(),
    score: 82,
    metrics: [
      { label: "Sway area", value: "3.1 cm²", hint: "95% of your movement stayed within this" },
      { label: "Sway speed", value: "1.4 cm/s" },
      { label: "Left / right weight", value: "53 / 47", hint: "Slightly more on the left" },
      { label: "Front / back weight", value: "42 / 58" },
    ],
    takeaway: "Steadier than last week. Your weight sits a little toward the left and the heels — gentle calf and arch work can help even it out.",
  },
  {
    id: "asr-03",
    kind: "walk",
    takenAt: new Date(isoDaysAgo(5) + "T13:05:00").toISOString(),
    score: 79,
    metrics: [
      { label: "Cadence", value: "111 spm" },
      { label: "Stance symmetry", value: "86 / 100" },
      { label: "Push-off (left)", value: "Slightly inward" },
      { label: "Contact time", value: "0.63 s" },
    ],
    takeaway: "A smooth, even walk overall. The left foot rolls in a touch at push-off — the same pattern flagged in your insights.",
  },
  {
    id: "asr-02",
    kind: "balance",
    takenAt: new Date(isoDaysAgo(12) + "T07:15:00").toISOString(),
    score: 74,
    metrics: [
      { label: "Sway area", value: "4.0 cm²" },
      { label: "Sway speed", value: "1.8 cm/s" },
      { label: "Left / right weight", value: "55 / 45" },
      { label: "Front / back weight", value: "40 / 60" },
    ],
    takeaway: "A reasonable baseline. Standing with your weight more evenly spread front-to-back is the main thing to work on.",
  },
  {
    id: "asr-01",
    kind: "balance",
    takenAt: new Date(isoDaysAgo(19) + "T08:02:00").toISOString(),
    score: 72,
    metrics: [
      { label: "Sway area", value: "4.3 cm²" },
      { label: "Sway speed", value: "1.9 cm/s" },
      { label: "Left / right weight", value: "56 / 44" },
      { label: "Front / back weight", value: "39 / 61" },
    ],
    takeaway: "Your first balance test — this is the number to improve on. Try it at the same time each day for a fair comparison.",
  },
];
