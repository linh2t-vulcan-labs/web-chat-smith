import { useCallback, useEffect, useRef } from "react";

const MAX_LOADING_TIMEOUT_MS = 25_000;
const RELOAD_DELAY_MS = 2000;

interface SafeguardOptions {
  isLoading: boolean;
  onTimeout: () => void;
}

/**
 * Custom hook to prevent infinite loading states
 * Automatically triggers callback if loading exceeds maximum time
 * Follows Single Responsibility Principle - only handles timeout logic
 */
export function useLoadingSafeguard({
  isLoading,
  onTimeout,
}: SafeguardOptions) {
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTimedOut = useRef(false);

  const cleanup = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  useEffect(() => {
    // Don't set new timeout if already timed out or not loading
    if (hasTimedOut.current || !isLoading) {
      cleanup();
      return;
    }

    timeoutId.current = setTimeout(() => {
      if (isLoading) {
        hasTimedOut.current = true;
        // console.error("[useLoadingSafeguard] Max loading timeout reached");
        onTimeout();
      }
    }, MAX_LOADING_TIMEOUT_MS);

    return cleanup;
  }, [isLoading, onTimeout, cleanup]);
}

/**
 * Utility hook to handle force reload with delay
 * Provides better UX by waiting before reload
 */
export function useForceReload() {
  const reloadTimerId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const forceReload = useCallback((delayMs = RELOAD_DELAY_MS) => {
    console.warn("[useForceReload] Scheduling page reload in", delayMs, "ms");

    // Cleanup any existing timer
    if (reloadTimerId.current) {
      clearTimeout(reloadTimerId.current);
    }

    reloadTimerId.current = setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, delayMs);
  }, []);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (reloadTimerId.current) {
        clearTimeout(reloadTimerId.current);
      }
    },
    []
  );

  return forceReload;
}
