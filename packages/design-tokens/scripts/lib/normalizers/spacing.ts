import type { TokenMap, TokenValue } from "../resolver";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

const SPACING_PATH_REGEX =
  /(?<spacingKeyword>spacing|space|gap|inset|padding|margin)/iu;

const normalizeSpacingValue = (value: unknown): unknown => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

const normalizeSpacingToken = (token: TokenValue, path: string): TokenValue => {
  if (!SPACING_PATH_REGEX.test(path)) {
    return token;
  }

  if (token.$type !== "dimension") {
    return token;
  }

  return {
    ...token,
    $value: normalizeSpacingValue(token.$value) as TokenValue["$value"],
  };
};

const walkSpacing = (current: TokenMap, parentPath = ""): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    const path = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      normalized[key] = normalizeSpacingToken(value, path);
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkSpacing(value as TokenMap, path);
      continue;
    }

    normalized[key] = value as TokenValue;
  }

  return normalized;
};

export const normalizeSpacing = (tokens: TokenMap): TokenMap =>
  walkSpacing(tokens);
