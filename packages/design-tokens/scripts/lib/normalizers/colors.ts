import type { TokenMap, TokenValue } from "../resolver";
import { isHexColor, normalizeHexColor } from "../utils/color-math";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

const normalizeColorToken = (token: TokenValue): TokenValue => {
  if (token.$type !== "color" || typeof token.$value !== "string") {
    return token;
  }

  if (!isHexColor(token.$value)) {
    return token;
  }

  return {
    ...token,
    $value: normalizeHexColor(token.$value),
  };
};

const walkColors = (current: TokenMap): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    if (isTokenValue(value)) {
      normalized[key] = normalizeColorToken(value);
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkColors(value as TokenMap);
      continue;
    }

    normalized[key] = value as TokenValue;
  }

  return normalized;
};

export const normalizeColors = (tokens: TokenMap): TokenMap =>
  walkColors(tokens);
