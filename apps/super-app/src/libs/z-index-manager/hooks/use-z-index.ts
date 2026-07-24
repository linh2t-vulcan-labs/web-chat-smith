"use client";

import { useEffect, useMemo, useRef } from "react";

import { getZIndexManager } from "../manager";
import type { OverlayId, UseZIndexOptions } from "../types";

/**
 * React hook for managing z-index of overlay components
 *
 * Automatically registers the component when mounted and unregisters when unmounted.
 * Returns the current z-index value for the component.
 *
 * @example
 * ```tsx
 * const zIndex = useZIndex({ type: 'modal', priority: 'high' });
 *
 * return (
 *   <div style={{ zIndex }}>
 *     Modal content
 *   </div>
 * );
 * ```
 */
export function useZIndex(options: UseZIndexOptions): number {
  const { type, priority = "normal", baseZIndex, enabled = true } = options;

  const idRef = useRef<OverlayId | null>(null);
  const manager = getZIndexManager();

  // Generate a unique ID for this overlay instance
  const overlayId = useMemo<OverlayId>(() => {
    // oxlint-disable-next-line react/react-compiler -- ref read/write is intentional: caches the generated id so it's only computed once per instance instead of every render
    if (!idRef.current) {
      // oxlint-disable-next-line react/react-compiler -- Date.now/Math.random are only evaluated once (guarded by the ref check above) to mint a stable random overlay id, not on every render
      idRef.current = `${type}-${priority}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    }
    // oxlint-disable-next-line react/react-compiler -- reads the cached id from the ref set above; stable after first computation
    return idRef.current;
  }, [type, priority]);

  // Register overlay when enabled
  const zIndex = useMemo(() => {
    if (!enabled) {
      return baseZIndex ?? 0;
    }
    return manager.register(overlayId, type, priority, baseZIndex);
  }, [enabled, overlayId, type, priority, baseZIndex, manager]);

  // Cleanup on unmount
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return () => {
      manager.unregister(overlayId);
    };
  }, [enabled, overlayId, manager]);

  return zIndex;
}
