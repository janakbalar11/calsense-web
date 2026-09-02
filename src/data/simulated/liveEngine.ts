import type { Foot, LiveFrame } from "@/lib/types";
import { clamp } from "@/lib/rng";
import type { LiveHandle } from "../DataSource";
import { copForIntensities, phaseIntensities, regionField } from "./gait";
import { LEFT_SHAPE, RIGHT_SHAPE } from "./history";

/**
 * Simulated real-time sensor stream. Drives the Live view: two feet stepping
 * out of phase, a wandering cadence, an incrementing step count, and a live
 * centre-of-pressure point per foot.
 */
export function createLiveEngine(): LiveHandle {
  const subs = new Set<(f: LiveFrame) => void>();
  let raf = 0;
  let running = false;
  let startedAt = 0;
  let lastT = 0;

  let phaseL = 0;
  let phaseR = 0.5;
  let cadence = 112;
  let cadenceTarget = 112;
  let symmetry = 86;
  let steps = 0;

  function reset() {
    phaseL = 0;
    phaseR = 0.5;
    cadence = 112;
    cadenceTarget = 112;
    symmetry = 86;
    steps = 0;
  }

  function frameAt(now: number): LiveFrame {
    const dt = lastT ? Math.min((now - lastT) / 1000, 0.05) : 0.016;
    lastT = now;

    // cadence wanders slowly
    if (Math.random() < 0.01) cadenceTarget = 112 + (Math.random() - 0.5) * 10;
    cadence += (cadenceTarget - cadence) * 0.02;
    symmetry += ((85 + Math.sin(now / 9000) * 3) - symmetry) * 0.01;

    const strideSec = 120 / cadence; // one full cycle per foot = 2 steps
    const prevL = phaseL;
    const prevR = phaseR;
    phaseL = (phaseL + dt / strideSec) % 1;
    phaseR = (phaseR + dt / strideSec) % 1;
    if (phaseL < prevL) steps += 1;
    if (phaseR < prevR) steps += 1;

    const intL = phaseIntensities(phaseL, LEFT_SHAPE);
    const intR = phaseIntensities(phaseR, RIGHT_SHAPE);

    const loadOf = (o: Record<string, number>) =>
      clamp(Object.values(o).reduce((a, b) => a + b, 0) / 2.4, 0, 1);

    const field: Record<Foot, ReturnType<typeof regionField>> = {
      left: regionField(intL),
      right: regionField(intR),
    };

    return {
      t: now - startedAt,
      phase: { left: phaseL, right: phaseR },
      field,
      cop: { left: copForIntensities(intL), right: copForIntensities(intR) },
      cadenceSpm: Math.round(cadence),
      symmetryScore: Math.round(symmetry),
      stepCount: steps,
      load: { left: loadOf(intL), right: loadOf(intR) },
    };
  }

  function tick() {
    const now = performance.now();
    const frame = frameAt(now);
    subs.forEach((cb) => cb(frame));
    raf = requestAnimationFrame(tick);
  }

  return {
    subscribe(cb) {
      subs.add(cb);
      return () => subs.delete(cb);
    },
    start() {
      if (running) return;
      running = true;
      startedAt = performance.now();
      lastT = 0;
      raf = requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      cancelAnimationFrame(raf);
    },
    reset() {
      reset();
    },
    isRunning() {
      return running;
    },
  };
}
