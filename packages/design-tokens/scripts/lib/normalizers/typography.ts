import type { TokenMap } from "../resolver";
import { isObjectRecord, mapTokensOfType } from "../utils/token-tree";

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

const TYPOGRAPHY_FIELD_NORMALIZERS: Record<
  string,
  (value: unknown) => unknown
> = {
  fontWeight: normalizeFontWeight,
  letterSpacing: normalizeLetterSpacing,
};

const normalizeTypographyValue = (value: unknown): unknown => {
  if (!isObjectRecord(value)) {
    return value;
  }

  const normalized: NormalizedTypographyValue = { ...value };

  for (const [field, normalize] of Object.entries(
    TYPOGRAPHY_FIELD_NORMALIZERS
  )) {
    if (field in normalized) {
      normalized[field] = normalize(normalized[field]);
    }
  }

  return normalized;
};

export const normalizeTypography = (tokens: TokenMap): TokenMap =>
  mapTokensOfType(tokens, "typography", normalizeTypographyValue);
