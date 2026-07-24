// PRNG constants for the seeded shuffle (mulberry32). All values are fixed by the algorithm — do not
// change them or the generated sequence stops matching the canonical mulberry32.

// Odd increment added to the PRNG state each step — mulberry32's defining constant.
export const MULBERRY32_INCREMENT = 0x6d_2b_79_f5;
// 2^32: normalizes a uint32 result to a float in [0, 1).
export const UINT32_RANGE = 2 ** 32;
// Right-shift amounts used by the three xor-shift mixing (avalanche) steps, in order of use.
export const MULBERRY32_SHIFT_1 = 15;
export const MULBERRY32_SHIFT_2 = 7;
export const MULBERRY32_SHIFT_3 = 14;
// OR masks that force an odd multiplier in each of the two Math.imul mixing steps.
export const MULBERRY32_OR_MASK_1 = 1;
export const MULBERRY32_OR_MASK_2 = 61;
