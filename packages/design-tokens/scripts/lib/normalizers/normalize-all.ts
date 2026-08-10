import type { TokenMap } from "../resolver";
import { normalizeBorders } from "./borders";
import { normalizeColors } from "./colors";
import { normalizeRadius } from "./radius";
import { normalizeShadows } from "./shadows";
import { normalizeSpacing } from "./spacing";
import { normalizeTypography } from "./typography";

/** The full normalization pipeline every resolved token tree goes through
 * before it's usable — shared by `build` (CSS output) and `preview` (HTML
 * gallery) so both see identical values. */
export const normalizeAll = (tokens: TokenMap): TokenMap => {
  const step1 = normalizeColors(tokens);
  const step2 = normalizeSpacing(step1);
  const step3 = normalizeRadius(step2);
  const step4 = normalizeBorders(step3);
  const step5 = normalizeShadows(step4);
  return normalizeTypography(step5);
};
