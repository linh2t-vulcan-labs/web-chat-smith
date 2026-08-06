import type { TokenMap } from "../resolver";
import { mapPathMatchedDimensionTokens } from "../utils/token-tree";

const RADIUS_PATH_REGEX = /(?<radiusType>radius|rounded|corner)/iu;

export const normalizeRadius = (tokens: TokenMap): TokenMap =>
  mapPathMatchedDimensionTokens(tokens, (path) => RADIUS_PATH_REGEX.test(path));
