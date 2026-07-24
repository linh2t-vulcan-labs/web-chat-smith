/**
 * Z-Index Manager Library
 *
 * Centralized system for managing z-index values across all overlays.
 * Exports the manager, hooks, provider, and types.
 */

export { useZIndex } from "./hooks/use-z-index";
export type {
  OverlayId,
  OverlayPriority,
  OverlayRegistration,
  OverlayType,
  UseZIndexOptions,
  ZIndexRanges,
} from "./types";
