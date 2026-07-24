import type { TokenMap, TokenValue } from "../resolver";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

const FONT_WEIGHT_MAP: Record<string, number> = {
  black: 900,
  bold: 700,
  medium: 500,
  normal: 400,
  regular: 400,
  semibold: 600,
};

type NormalizedTypographyValue = Record<string, unknown>;

const normalizeFontWeight = (value: unknown): unknown => {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  return FONT_WEIGHT_MAP[normalized] ?? value;
};

const normalizeLetterSpacing = (value: unknown): unknown => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

const normalizeTypographyToken = (token: TokenValue): TokenValue => {
  if (token.$type !== "typography" || !isObjectRecord(token.$value)) {
    return token;
  }

  const normalized: NormalizedTypographyValue = { ...token.$value };

  if ("fontWeight" in normalized) {
    normalized.fontWeight = normalizeFontWeight(normalized.fontWeight);
  }

  if ("letterSpacing" in normalized) {
    normalized.letterSpacing = normalizeLetterSpacing(normalized.letterSpacing);
  }

  return {
    ...token,
    $value: normalized,
  };
};

const walkTypography = (current: TokenMap): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    if (isTokenValue(value)) {
      normalized[key] = normalizeTypographyToken(value);
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkTypography(value as TokenMap);
      continue;
    }

    normalized[key] = value as TokenValue;
  }

  return normalized;
};

export const normalizeTypography = (tokens: TokenMap): TokenMap =>
  walkTypography(tokens);
