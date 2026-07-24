// const ONE_THOUSAND = 1000;
// const ONE_HUNDRED = 100;
// const TEN_THOUSANDS = 10_000;
// const ONE_MILLION = 1_000_000;
// const ONE_HUNDRED_THOUSAND = 100_000;
const PERCENTAGE_BASE = 100;
const CURRENCY_MINOR_UNIT_MULTIPLIER = 100;

/**
 * Formats a number into a compact human-readable string using `k` (thousands) and `M` (millions)
 * with optional secondary digits for precision.
 *
 * Formatting rules:
 * - < 1,000 → returns the full number (e.g., `950` → `"950"`).
 * - 1,000 ≤ n < 10,000 → returns `"xk"` or `"xkY"` where Y is the hundreds digit
 *   (e.g., `1,230` → `"1k2"`, `2,000` → `"2k"`).
 * - 10,000 ≤ n < 1,000,000 → rounds to the nearest thousand and returns `"xxk"`
 *   (e.g., `124,495` → `"125k"`).
 * - ≥ 1,000,000 → returns `"xM"` or `"xMY"` where Y is the hundred-thousands digit
 *   (e.g., `1,050,495` → `"1M"`, `1,400,000` → `"1M4"`).
 *
 * Rounding behavior:
 * - Numbers in the thousands range are rounded to the nearest hundred before formatting.
 * - Numbers in the millions range are rounded to the nearest hundred-thousand before formatting.
 *
 * @param {number} num - The number to format.
 * @returns {string} The formatted number string.
 */

// function formatCompactNumber(num: number): string {
//   if (num < ONE_THOUSAND) {
//     return num.toString();
//   }

//   // Under 1 million
//   if (num < ONE_MILLION) {
//     const rounded = Math.round(num / ONE_HUNDRED) * ONE_HUNDRED;

//     if (rounded < TEN_THOUSANDS) {
//       // Show like 1k2
//       const thousands = Math.floor(rounded / ONE_THOUSAND);
//       const hundreds = Math.floor((rounded % ONE_THOUSAND) / ONE_HUNDRED);
//       return hundreds === 0 ? `${thousands}K` : `${thousands}K${hundreds}`;
//     }

//     // 10k and above
//     return `${Math.round(rounded / ONE_THOUSAND)}K`;
//   }

//   // Millions and above
//   const rounded = Math.round(num / ONE_HUNDRED_THOUSAND) * ONE_HUNDRED_THOUSAND;
//   const millions = Math.floor(rounded / ONE_MILLION);
//   const hundredThousands = Math.floor(
//     (rounded % ONE_MILLION) / ONE_HUNDRED_THOUSAND
//   );

//   return hundredThousands === 0
//     ? `${millions}M`
//     : `${millions}M${hundredThousands}`;
// }

/**
 * Calculates the percentage of a partial value relative to a whole, truncating the result to the
 * desired number of decimal places instead of rounding. Values are first converted to their minor
 * units (e.g. cents) to limit floating-point drift and avoid overstating the final percentage.
 *
 * When the whole value is zero or falsy, the function returns 0 to prevent division errors.
 *
 * @param part - The partial value (e.g. the tax amount).
 * @param whole - The base value to compare against (e.g. the subtotal).
 * @param decimalPlaces - How many decimals to keep in the truncated result. Defaults to 2.
 * @returns The truncated percentage value.
 */
function calculateTruncatedPercentage(
  part: number,
  whole: number,
  decimalPlaces = 2
): number {
  if (!Number.isFinite(part) || !Number.isFinite(whole)) {
    return 0;
  }

  const wholeMinor = Math.round(whole * CURRENCY_MINOR_UNIT_MULTIPLIER);

  if (wholeMinor <= 0) {
    return 0;
  }

  const partMinor = Math.round(part * CURRENCY_MINOR_UNIT_MULTIPLIER);
  const percentage = (partMinor * PERCENTAGE_BASE) / wholeMinor;
  const factor = 10 ** decimalPlaces;

  return Math.floor(percentage * factor) / factor;
}

export { calculateTruncatedPercentage };
