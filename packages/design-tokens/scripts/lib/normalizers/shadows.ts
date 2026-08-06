import type { TokenMap } from "../resolver";
import { normalizeColorIfHex } from "../utils/color-math";
import {
  isObjectRecord,
  mapTokensOfType,
  toPxValue,
} from "../utils/token-tree";

interface ShadowLayer {
  blur?: unknown;
  color?: unknown;
  offsetX?: unknown;
  offsetY?: unknown;
  spread?: unknown;
}

const normalizeLayer = (layer: ShadowLayer): ShadowLayer => ({
  ...layer,
  blur: toPxValue(layer.blur),
  color: normalizeColorIfHex(layer.color),
  offsetX: toPxValue(layer.offsetX),
  offsetY: toPxValue(layer.offsetY),
  spread: toPxValue(layer.spread),
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

export const normalizeShadows = (tokens: TokenMap): TokenMap =>
  mapTokensOfType(tokens, "shadow", normalizeShadowValue);
