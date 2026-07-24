import type { TokenMap, TokenValue } from "../resolver";
import { isHexColor, normalizeHexColor } from "../utils/color-math";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

interface ShadowLayer {
  blur?: unknown;
  color?: unknown;
  offsetX?: unknown;
  offsetY?: unknown;
  spread?: unknown;
}

const normalizeNumberLike = (value: unknown): unknown => {
  if (typeof value === "number") {
    return `${value}px`;
  }

  return value;
};

const normalizeLayer = (layer: ShadowLayer): ShadowLayer => ({
  ...layer,
  blur: normalizeNumberLike(layer.blur),
  color:
    typeof layer.color === "string" && isHexColor(layer.color)
      ? normalizeHexColor(layer.color)
      : layer.color,
  offsetX: normalizeNumberLike(layer.offsetX),
  offsetY: normalizeNumberLike(layer.offsetY),
  spread: normalizeNumberLike(layer.spread),
});

const normalizeShadowValue = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is ShadowLayer => isObjectRecord(entry))
      .map((entry) => normalizeLayer(entry));
  }

  if (isObjectRecord(value)) {
    return normalizeLayer(value as ShadowLayer);
  }

  return value;
};

const walkShadows = (current: TokenMap): TokenMap => {
  const normalized: TokenMap = {};

  for (const [key, value] of Object.entries(current)) {
    if (isTokenValue(value)) {
      normalized[key] =
        value.$type === "shadow"
          ? ({
              ...value,
              $value: normalizeShadowValue(value.$value),
            } as TokenValue)
          : value;
      continue;
    }

    if (isObjectRecord(value)) {
      normalized[key] = walkShadows(value as TokenMap);
      continue;
    }

    normalized[key] = value as TokenValue;
  }

  return normalized;
};

export const normalizeShadows = (tokens: TokenMap): TokenMap =>
  walkShadows(tokens);
