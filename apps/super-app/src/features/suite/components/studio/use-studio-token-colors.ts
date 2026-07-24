"use client";

import { useMemo } from "react";

import { resolveCssTokenColor } from "@/features/suite/utils/resolve-css-token-color";

import { STUDIO_TOKEN_COLORS } from "./constants";
import type { StudioTokenColorKey } from "./constants";

/**
 * Resolve every STUDIO_TOKEN_COLORS entry from its CSS variable to a literal color for canvas use.
 * Resolved once per mount, synchronously in render (via useMemo) so the first Konva paint is already
 * correct — no flash. Returns a flat `{ key: "rgba(...)" }` map.
 */
export function useStudioTokenColors(): Record<StudioTokenColorKey, string> {
  return useMemo(() => {
    const resolved = {} as Record<StudioTokenColorKey, string>;
    for (const key of Object.keys(
      STUDIO_TOKEN_COLORS
    ) as StudioTokenColorKey[]) {
      const { cssVar, fallback } = STUDIO_TOKEN_COLORS[key];
      resolved[key] = resolveCssTokenColor(cssVar, fallback);
    }
    return resolved;
  }, []);
}
