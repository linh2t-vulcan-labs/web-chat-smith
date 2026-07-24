import {
  MULBERRY32_INCREMENT,
  MULBERRY32_OR_MASK_1,
  MULBERRY32_OR_MASK_2,
  MULBERRY32_SHIFT_1,
  MULBERRY32_SHIFT_2,
  MULBERRY32_SHIFT_3,
  UINT32_RANGE,
} from "@/features/suite/utils/constants/prng";

// mulberry32 — canonical public-domain seedable PRNG, implemented verbatim. All constants come from
// ./constants/prng (fixed by the algorithm).
const mulberry32 = (seed: number): (() => number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + MULBERRY32_INCREMENT) | 0;
    let t = Math.imul(a ^ (a >>> MULBERRY32_SHIFT_1), MULBERRY32_OR_MASK_1 | a);
    t ^=
      t + Math.imul(t ^ (t >>> MULBERRY32_SHIFT_2), MULBERRY32_OR_MASK_2 | t);
    return ((t ^ (t >>> MULBERRY32_SHIFT_3)) >>> 0) / UINT32_RANGE;
  };
};

// Deterministic Fisher–Yates shuffle from a seed. Same seed → same permutation, so server SSR and
// client hydration agree (no flash). Unlike a hash-sort it produces a uniform shuffle — similar ids
// (e.g. template-10 / template-11) don't cluster next to each other.
export const orderBySeed = <T>(items: T[], seed: number): T[] => {
  const rng = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const itemAtI = result[i];
    const itemAtJ = result[j];
    if (itemAtI === undefined || itemAtJ === undefined) {
      throw new Error("orderBySeed: swap index out of bounds");
    }
    result[i] = itemAtJ;
    result[j] = itemAtI;
  }
  return result;
};
