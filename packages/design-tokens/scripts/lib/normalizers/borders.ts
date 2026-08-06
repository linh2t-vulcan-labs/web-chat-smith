import type { TokenMap, TokenValue } from "../resolver";
import { normalizeColorIfHex } from "../utils/color-math";
import {
  isObjectRecord,
  mapTokensOfType,
  toPxValue,
} from "../utils/token-tree";

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
    color: normalizeColorIfHex(border.color),
    style:
      typeof border.style === "string"
        ? border.style.toLowerCase()
        : border.style,
    width: toPxValue(border.width),
  };
};

export const normalizeBorders = (tokens: TokenMap): TokenMap =>
  mapTokensOfType(tokens, "border", normalizeBorderValue);
