/** Small deterministic PRNG so the simulated demo is stable but varied. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function makeRng(seed: number) {
  const r = mulberry32(seed);
  return {
    next: r,
    range: (min: number, max: number) => min + r() * (max - min),
    int: (min: number, max: number) => Math.floor(min + r() * (max - min + 1)),
    /** roughly gaussian via central limit */
    gauss: (mean = 0, sd = 1) => {
      const s = r() + r() + r() + r() + r() + r();
      return mean + ((s - 3) / 3) * 3 * sd * 0.5;
    },
    pick: <T>(arr: readonly T[]) => arr[Math.floor(r() * arr.length)],
    chance: (p: number) => r() < p,
  };
}

export type Rng = ReturnType<typeof makeRng>;

export const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
