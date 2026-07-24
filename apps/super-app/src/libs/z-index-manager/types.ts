/**
 * Types for z-index management system
 */

export type OverlayType =
  | "modal"
  | "tooltip"
  | "context-menu"
  | "dropdown"
  | "popover";

export type OverlayPriority = "normal" | "high" | "critical";

export type OverlayId = string;

export interface OverlayRegistration {
  id: OverlayId;
  type: OverlayType;
  priority: OverlayPriority;
  zIndex: number;
  registeredAt: number;
}

export interface ZIndexManagerState {
  overlays: Map<OverlayId, OverlayRegistration>;
  counters: Record<OverlayType, Record<OverlayPriority, number>>;
}

export interface UseZIndexOptions {
  type: OverlayType;
  priority?: OverlayPriority;
  baseZIndex?: number;
  enabled?: boolean;
}

export interface ZIndexRanges {
  tooltip: { min: number; max: number };
  dropdown: { min: number; max: number };
  "context-menu": { min: number; max: number };
  popover: { min: number; max: number };
  modal: {
    normal: { min: number; max: number };
    high: { min: number; max: number };
    critical: { min: number; max: number };
  };
}
