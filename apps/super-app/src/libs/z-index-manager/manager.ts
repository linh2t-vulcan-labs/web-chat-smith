/**
 * Z-Index Manager
 *
 * Centralized system for managing z-index values across all overlays (modals, tooltips, etc.)
 * Prevents stacking conflicts by dynamically allocating z-index values based on open order.
 */

import type {
  OverlayId,
  OverlayPriority,
  OverlayRegistration,
  OverlayType,
  ZIndexRanges,
} from "./types";

// Z-index ranges for different overlay types
const Z_INDEX_RANGES: ZIndexRanges = {
  "context-menu": { max: 1199, min: 1100 },
  dropdown: { max: 1099, min: 1000 },
  modal: {
    critical: { max: 3999, min: 3000 },
    high: { max: 2999, min: 2000 },
    normal: { max: 1999, min: 1200 },
  },
  popover: { max: 1199, min: 1100 },
  tooltip: { max: 1099, min: 1000 },
};

class ZIndexManager {
  private overlays = new Map<OverlayId, OverlayRegistration>();
  private counters: Record<OverlayType, Record<OverlayPriority, number>> = {
    "context-menu": { critical: 0, high: 0, normal: 0 },
    dropdown: { critical: 0, high: 0, normal: 0 },
    modal: { critical: 0, high: 0, normal: 0 },
    popover: { critical: 0, high: 0, normal: 0 },
    tooltip: { critical: 0, high: 0, normal: 0 },
  };

  /**
   * Register a new overlay and get its z-index
   */
  register(
    id: OverlayId,
    type: OverlayType,
    priority: OverlayPriority = "normal",
    baseZIndex?: number
  ): number {
    // Get the current maximum z-index to ensure new overlays appear on top
    const currentMaxZIndex = this.getMaxZIndex();

    let zIndex: number;

    if (baseZIndex === undefined) {
      // Calculate z-index based on type and priority
      const calculatedZIndex = this.calculateZIndex(type, priority);
      // Ensure it's higher than all currently open overlays
      zIndex = Math.max(calculatedZIndex, currentMaxZIndex + 1);
    } else {
      // If baseZIndex is provided, ensure it's higher than all currently open overlays
      // This prevents stacking issues when multiple modals are open
      zIndex = Math.max(baseZIndex, currentMaxZIndex + 1);
    }

    const registration: OverlayRegistration = {
      id,
      priority,
      registeredAt: Date.now(),
      type,
      zIndex,
    };

    this.overlays.set(id, registration);
    return zIndex;
  }

  /**
   * Unregister an overlay
   */
  unregister(id: OverlayId): void {
    this.overlays.delete(id);
  }

  /**
   * Get the current z-index for an overlay
   */
  getZIndex(id: OverlayId): number | undefined {
    return this.overlays.get(id)?.zIndex;
  }

  /**
   * Calculate the next available z-index for a given type and priority
   */
  private calculateZIndex(
    type: OverlayType,
    priority: OverlayPriority
  ): number {
    const range = ZIndexManager.getRange(type, priority);
    const counter = this.counters[type][priority];

    // Increment counter for this type/priority combination
    this.counters[type][priority] = counter + 1;

    // Calculate z-index within the range
    const offset = counter % (range.max - range.min + 1);
    const zIndex = range.min + offset;

    // If we've exhausted the range, wrap around (shouldn't happen in practice)
    if (zIndex > range.max) {
      console.warn(
        `Z-index range exhausted for ${type} with priority ${priority}. Wrapping around.`
      );
      return range.min;
    }

    return zIndex;
  }

  /**
   * Get the z-index range for a given type and priority
   */
  private static getRange(
    type: OverlayType,
    priority: OverlayPriority
  ): { min: number; max: number } {
    if (type === "modal") {
      return Z_INDEX_RANGES.modal[priority];
    }
    return Z_INDEX_RANGES[type];
  }

  /**
   * Get all currently registered overlays (for debugging)
   */
  getAllOverlays(): OverlayRegistration[] {
    return [...this.overlays.values()].toSorted(
      (a, b) => b.registeredAt - a.registeredAt
    );
  }

  /**
   * Get the highest z-index currently in use
   */
  getMaxZIndex(): number {
    const overlays = [...this.overlays.values()];
    if (overlays.length === 0) {
      return 0;
    }
    return Math.max(...overlays.map((o) => o.zIndex));
  }

  /**
   * Clear all registrations (for testing/debugging)
   */
  clear(): void {
    this.overlays.clear();
    // Reset counters
    for (const type of Object.keys(this.counters)) {
      const overlayType = type as OverlayType;
      this.counters[overlayType] = { critical: 0, high: 0, normal: 0 };
    }
  }
}

// Singleton instance
let managerInstance: ZIndexManager | null = null;

/**
 * Get the singleton ZIndexManager instance
 */
export function getZIndexManager(): ZIndexManager {
  if (!managerInstance) {
    managerInstance = new ZIndexManager();
  }
  return managerInstance;
}

/**
 * Reset the manager instance (mainly for testing)
 */
// function resetZIndexManager(): void {
//   managerInstance = null;
// }

export type { ZIndexRanges } from "./types";
