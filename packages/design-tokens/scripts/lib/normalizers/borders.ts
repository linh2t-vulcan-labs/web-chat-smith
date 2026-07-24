import type { TokenMap, TokenValue } from "../resolver";
import { isHexColor, normalizeHexColor } from "../utils/color-math";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

interface BorderValue {
  color?: unknown;
  style?: unknown;
  width?: unknown;
}

const normalizeBorderValue = (value: unknown): TokenValue["$value"] => {
  if (!isObjectRecord(value)) {
    return value as TokenValue["$value"];
  }

  const border = value as BorderValue;
  return {
    ...border,
    color:
      typeof border.color === "string" && isHexColor(border.color)
        ? normalizeHexColor(border.color)
        : border.color,
    style:
      typeof border.style === "string"
        ? border.style.toLowerCase()
        : border.style,
    width:
      typeof border.width === "number" ? `${border.width}px` : border.width,
  };
};

const walkBorders = (current: TokenMap): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    if (isTokenValue(value)) {
      normalized[key] =
        value.$type === "border"
          ? {
              ...value,
              $value: normalizeBorderValue(value.$value),
            }
          : value;
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkBorders(value as TokenMap);
      continue;
    }

    normalized[key] = value as TokenMap;
  }

  return normalized;
};

export const normalizeBorders = (tokens: TokenMap): TokenMap =>
  walkBorders(tokens);
