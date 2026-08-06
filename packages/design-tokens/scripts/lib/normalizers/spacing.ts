import type { TokenMap } from "../resolver";
import { mapPathMatchedDimensionTokens } from "../utils/token-tree";

const SPACING_PATH_REGEX =
  /(?<spacingKeyword>spacing|space|gap|inset|padding|margin)/iu;

export const normalizeSpacing = (tokens: TokenMap): TokenMap =>
  mapPathMatchedDimensionTokens(tokens, (path) =>
    SPACING_PATH_REGEX.test(path)
  );
