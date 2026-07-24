import type { TokenMap, TokenValue } from "../resolver";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

const RADIUS_PATH_REGEX = /(?<radiusType>radius|rounded|corner)/iu;

const normalizeRadiusValue = (value: unknown): unknown => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

const normalizeRadiusToken = (token: TokenValue, path: string): TokenValue => {
  if (!RADIUS_PATH_REGEX.test(path)) {
    return token;
  }

  if (token.$type !== "dimension") {
    return token;
  }

  return {
    ...token,
    $value: normalizeRadiusValue(token.$value) as TokenValue["$value"],
  };
};

const walkRadius = (current: TokenMap, parentPath = ""): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    const path = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      normalized[key] = normalizeRadiusToken(value, path);
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkRadius(value as TokenMap, path);
      continue;
    }

    normalized[key] = value as TokenValue;
  }

  return normalized;
};

export const normalizeRadius = (tokens: TokenMap): TokenMap =>
  walkRadius(tokens);
