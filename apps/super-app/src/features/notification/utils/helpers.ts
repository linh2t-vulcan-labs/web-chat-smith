import { logger } from "./logger";

// Helper function to check if count is valid
function isValidCount(count: number | undefined | null): count is number {
  return count !== undefined && count !== null;
}

// Helper function to check if service worker is supported
export function isServiceWorkerSupported(): boolean {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
}

/** Web Notifications API is not available on iOS Safari and some environments. */
export function isNotificationAPIAvailable(): boolean {
  return typeof window !== "undefined" && window.Notification !== undefined;
}

// Helper function to handle count after fetch completion
export function handleFetchCompletion(
  currentCount: number | undefined,
  previousCount: number | null,
  onCountChanged?: (newCount: number, oldCount: number) => void
): number | null {
  if (!isValidCount(currentCount)) {
    return previousCount;
  }

  const shouldTriggerCallback =
    previousCount !== null && previousCount !== currentCount;

  if (shouldTriggerCallback) {
    logger("warn", "Count changed from refetch, triggering callback");
    onCountChanged?.(currentCount, previousCount);
  }

  return currentCount;
}

// Helper function to handle count update when not fetching
export function handleCountUpdate(
  currentCount: number | undefined,
  previousCount: number | null
): number | null {
  if (!isValidCount(currentCount)) {
    return previousCount;
  }

  if (previousCount !== null && previousCount !== currentCount) {
    logger("warn", "Count changed from manual cache update, skipping callback");
  }

  return currentCount;
}

// function isMobileSafari(): boolean {
//   const ua = navigator.userAgent;
//   const { vendor } = navigator;

//   // Check contains "Safari" but not "Chrome" or "CriOS" (Chrome iOS)
//   const isSafari = /Safari/iu.test(ua) && !/CriOS|FxiOS|EdgiOS/iu.test(ua);

//   // Check Apple mobile devices
//   const isAppleMobile = /iPhone|iPad|iPod/iu.test(ua);

//   return isSafari && isAppleMobile && /Apple/iu.test(vendor);
// }

export function isIOSBrowser(): boolean {
  if (typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;
  const { platform } = navigator;
  const maxTouchPoints = navigator.maxTouchPoints ?? 0;

  // Detect iPhone, iPad, and iPod, including iPadOS devices using a desktop user agent.
  return (
    /iPad|iPhone|iPod/iu.test(ua) ||
    (platform === "MacIntel" && maxTouchPoints > 1)
  );
}

export function checkShowSoftPermissionByTime(
  firstVisitTimestamp: number,
  popupDelayMs: number
): boolean {
  const now = Date.now();

  const elapsed = now - firstVisitTimestamp;

  return elapsed >= popupDelayMs;
}

export function checkTimestamp(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  // If received from localStorage → string → need to parse to number
  const parsed = typeof value === "string" ? Number(value) : value;

  // Check type
  if (typeof parsed !== "number") {
    return null;
  }

  // Check NaN, Infinity, or unreasonable timestamp
  if (!Number.isFinite(parsed)) {
    return null;
  }
  if (parsed <= 0) {
    return null;
  }

  return parsed;
}
