import type { TokenMap } from "../resolver";
import { validateContrast } from "./contrast";
import { validateRefs } from "./refs";
import { validateSchema } from "./schema";
import { validateSSRSafety } from "./ssr-safety";

/** Structural shape shared by every validator's result, regardless of its concrete error type. */
interface ValidationOutcome {
  errors: unknown[];
  isValid: boolean;
}

interface LightDarkValidation {
  contrast: ValidationOutcome;
  darkContrast: ValidationOutcome;
  darkRefs: ValidationOutcome;
  darkSchema: ValidationOutcome;
  darkSsrSafety: ValidationOutcome;
  refs: ValidationOutcome;
  schema: ValidationOutcome;
  ssrSafety: ValidationOutcome;
}

/**
 * Runs the full validator suite (schema, refs, contrast, SSR safety) against
 * a light/dark token pair. Build, version, and validate commands all need
 * this same light+dark validation bundle before deciding pass/fail.
 */
export const validateLightDarkTokens = (
  tokens: TokenMap,
  darkTokens: TokenMap
): LightDarkValidation => ({
  contrast: validateContrast(tokens),
  darkContrast: validateContrast(darkTokens),
  darkRefs: validateRefs(darkTokens),
  darkSchema: validateSchema(darkTokens),
  darkSsrSafety: validateSSRSafety(darkTokens),
  refs: validateRefs(tokens),
  schema: validateSchema(tokens),
  ssrSafety: validateSSRSafety(tokens),
});

/** Sums every validator's error count, plus any additional counts (e.g. resolver errors). */
export const countValidationErrors = (
  validation: LightDarkValidation,
  ...extraErrorCounts: number[]
): number =>
  validation.schema.errors.length +
  validation.refs.errors.length +
  validation.contrast.errors.length +
  validation.ssrSafety.errors.length +
  validation.darkSchema.errors.length +
  validation.darkRefs.errors.length +
  validation.darkContrast.errors.length +
  validation.darkSsrSafety.errors.length +
  extraErrorCounts.reduce((sum, count) => sum + count, 0);
