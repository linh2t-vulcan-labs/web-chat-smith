import type { TPopupHistoryItem, TPopupItemConfig } from "../store/types";
import { EPopupStatus } from "../store/types";

/**
 * Checks if all dependencies of a popup have been skipped.
 *
 * @param dependencies - Array of popup IDs that are dependencies
 * @param history - Array of popup history items to check against
 * @returns true if all dependencies exist in history and have SKIPPED status, false otherwise
 *
 * @example
 * ```ts
 * const dependencies = ['popup-1', 'popup-2'];
 * const history = [
 *   { id: 'popup-1', status: EPopupStatus.SKIPPED, ... },
 *   { id: 'popup-2', status: EPopupStatus.SKIPPED, ... }
 * ];
 * isAllDependenciesSkipped(dependencies, history); // true
 * ```
 */
function isAllDependenciesSkipped(
  dependencies: string[],
  history: TPopupHistoryItem[]
): boolean {
  return dependencies.every((depId) => {
    const dep = history.find((h) => h.id === depId);
    return dep && dep.status === EPopupStatus.SKIPPED;
  });
}

/**
 * Checks if a popup is in PENDING status.
 *
 * @param popup - The popup configuration to check
 * @returns true if the popup status is PENDING, false otherwise
 */
export function isPopupPending(popup: TPopupItemConfig): boolean {
  return popup.status === EPopupStatus.PENDING;
}

/**
 * Checks if all dependencies of a popup have been met (completed or skipped).
 *
 * A popup with no dependencies is considered to have its dependencies met.
 * For popups with dependencies, all dependencies must exist in history
 * with either COMPLETED or SKIPPED status.
 *
 * @param popup - The popup configuration to check
 * @param history - Array of popup history items to check against
 * @returns true if there are no dependencies OR all dependencies are met, false otherwise
 *
 * @example
 * ```ts
 * // Popup with no dependencies
 * isDependencyMeet({ id: 'popup-1', dependencies: [] }, []); // true
 *
 * // Popup with met dependencies
 * const popup = { id: 'popup-2', dependencies: ['popup-1'] };
 * const history = [{ id: 'popup-1', status: EPopupStatus.COMPLETED, ... }];
 * isDependencyMeet(popup, history); // true
 * ```
 */
export function isDependencyMeet(
  popup: TPopupItemConfig,
  history: TPopupHistoryItem[]
): boolean {
  // If no dependencies, consider them met
  if (!popup.dependencies?.length) {
    return true;
  }

  return popup.dependencies.every((depId) => {
    const dep = history.find((h) => h.id === depId);
    return (
      dep && [EPopupStatus.COMPLETED, EPopupStatus.SKIPPED].includes(dep.status)
    );
  });
}

/**
 * Determines if a delay should be applied to a popup based on its configuration
 * and the status of its dependencies.
 *
 * The delay is applied when:
 * 1. The popup has the `delayOnlyIfDependencyCompleted` flag set to true
 * 2. The popup has dependencies
 * 3. NOT all dependencies were skipped (at least one was completed)
 *
 * If `delayOnlyIfDependencyCompleted` is false or not set, the popup shows immediately without delay.
 * If all dependencies were skipped, the popup should show immediately without delay.
 *
 * @param popup - The popup configuration to check
 * @param history - Array of popup history items to check dependency status
 * @returns true if delay should be applied, false if popup should show immediately
 *
 * @example
 * ```ts
 * // Case 1: delayOnlyIfDependencyCompleted not set - no delay
 * const popup = {
 *   id: 'popup-2',
 *   dependencies: ['popup-1'],
 *   delay: 5000
 * };
 * shouldApplyDelay(popup, []); // false (show immediately)
 *
 * // Case 2: All dependencies skipped - no delay
 * const popup2 = {
 *   id: 'popup-2',
 *   dependencies: ['popup-1'],
 *   delayOnlyIfDependencyCompleted: true,
 *   delay: 5000
 * };
 * const history = [{ id: 'popup-1', status: EPopupStatus.SKIPPED, ... }];
 * shouldApplyDelay(popup2, history); // false (show immediately)
 *
 * // Case 3: At least one dependency completed - apply delay
 * const history2 = [{ id: 'popup-1', status: EPopupStatus.COMPLETED, ... }];
 * shouldApplyDelay(popup2, history2); // true (apply delay)
 * ```
 */
export function shouldApplyDelay(
  popup: TPopupItemConfig,
  history: TPopupHistoryItem[]
): boolean {
  // If delayOnlyIfDependencyCompleted is not set, don't apply delay (show immediately)
  if (!popup?.delayOnlyIfDependencyCompleted) {
    return false;
  }

  // If no dependencies, don't apply delay
  if (!popup?.dependencies || popup?.dependencies.length === 0) {
    return false;
  }

  // If all dependencies were skipped, don't apply delay (show immediately)
  const allDepsSkipped = isAllDependenciesSkipped(popup.dependencies, history);
  return !allDepsSkipped; // Apply delay only if NOT all dependencies were skipped
}

/**
 * Checks if a popup's custom condition is met.
 *
 * If the popup has no condition, it's considered met.
 * If the condition check fails or returns false, the popup is marked as skipped.
 * If the condition is met, the optional `onConditionMeet` callback is executed.
 *
 * @param popup - The popup configuration to check
 * @param markAsSkipped - Callback function to mark the popup as skipped if condition fails
 * @returns true if condition is met or no condition exists, false otherwise
 *
 * Notes:
 * - Promise results are treated as false (async conditions not supported)
 * - Errors during condition check automatically mark the popup as skipped
 *
 * @example
 * ```ts
 * const popup = {
 *   id: 'popup-1',
 *   condition: {
 *     check: () => userIsLoggedIn(),
 *     onConditionMeet: () => console.log('User is logged in')
 *   }
 * };
 * isConditionMeet(popup, (id) => console.log(`Skipped: ${id}`));
 * ```
 */
export function isConditionMeet(
  popup: TPopupItemConfig,
  markAsSkipped?: (popupId: string) => void
): boolean {
  // No condition means condition is met
  if (!popup.condition?.check) {
    return true;
  }

  try {
    const result = popup.condition.check();

    // Treat promises as false (don't support async conditions in this check)
    const conditionMet = result instanceof Promise ? false : result;

    if (!conditionMet) {
      markAsSkipped?.(popup.id);
      return false;
    }

    // Execute callback when condition is met
    popup.condition.onConditionMeet?.();

    return true;
  } catch (error) {
    console.error(
      `[isConditionMeet] Error checking condition for ${popup.id}:`,
      error
    );
    markAsSkipped?.(popup.id);
    return false;
  }
}

/**
 * Checks if a delay has elapsed for a given popup.
 *
 * @param popupId - The ID of the popup to check
 * @param delay - The delay duration in milliseconds
 * @param delayTimers - Record of popup IDs to their start timestamps
 * @returns true if the delay has elapsed, false otherwise
 */
function hasElapsedDelay(
  popupId: string,
  delay: number,
  delayTimers: Record<string, number>
): boolean {
  const delayStartTime = delayTimers[popupId];
  if (!delayStartTime) {
    return false;
  }

  const elapsedTime = Date.now() - delayStartTime;
  return elapsedTime >= delay;
}

/**
 * Determines if a delayed popup can be shown based on its delay configuration.
 *
 * This handles all the delay logic including:
 * - Checking if timer is scheduled
 * - Checking if delay has elapsed
 * - Applying delay only if dependencies were completed (not skipped)
 *
 * @param popup - The popup configuration to check
 * @param history - Array of popup history items
 * @param delayTimers - Record of popup IDs to their start timestamps
 * @param scheduledTimers - Record of popup IDs to their scheduled timers
 * @returns true if popup can be shown, false if it should wait
 */
function canShowDelayedPopup(
  popup: TPopupItemConfig,
  history: TPopupHistoryItem[],
  delayTimers: Record<string, number>,
  scheduledTimers: Record<string, NodeJS.Timeout>
): boolean {
  // No delay specified, show immediately
  if (!popup.delay || popup.delay <= 0) {
    return true;
  }

  // Check if delay should be applied based on dependency status
  const applyDelay = shouldApplyDelay(popup, history);

  // Show immediately if all dependencies were skipped
  if (!applyDelay) {
    return true;
  }

  // If timer is scheduled, wait for it
  if (scheduledTimers[popup.id]) {
    return false;
  }

  // Check if delay has already elapsed
  return hasElapsedDelay(popup.id, popup.delay, delayTimers);
}

/**
 * Creates a history item for a popup.
 *
 * @param popup - The popup configuration
 * @param status - The status to record in history
 * @returns A new history item
 */
export function createHistoryItem(
  popup: TPopupItemConfig,
  status: EPopupStatus
): TPopupHistoryItem {
  return {
    id: popup.id as TPopupHistoryItem["id"],
    status,
    timestamp: Date.now(),
    type: popup.type,
  };
}

/**
 * Checks if a popup already exists in history to prevent duplicates.
 *
 * @param popupId - The ID of the popup to check
 * @param history - Array of popup history items
 * @returns true if popup exists in history, false otherwise
 */
export function isPopupInHistory(
  popupId: string,
  history: TPopupHistoryItem[]
): boolean {
  return history.some((h) => h.id === popupId);
}

/**
 * Finds a popup in the queue by ID.
 *
 * @param popupId - The ID of the popup to find
 * @param queue - Array of popup configurations
 * @returns The popup if found, undefined otherwise
 */
export function findPopupInQueue(
  popupId: string,
  queue: TPopupItemConfig[],
  options?: { status?: EPopupStatus }
): TPopupItemConfig | undefined {
  return queue.find(
    (p) =>
      p.id === popupId && (options?.status ? p.status === options.status : true)
  );
}

/**
 * Checks if a popup needs delay scheduling.
 *
 * @param popup - The popup configuration to check
 * @param history - Array of popup history items
 * @param scheduledTimers - Record of scheduled timer IDs
 * @param delayTimers - Record of delay start times
 * @returns true if delay needs to be scheduled, false otherwise
 */
export function needsDelayScheduling(
  popup: TPopupItemConfig,
  history: TPopupHistoryItem[],
  scheduledTimers: Record<string, NodeJS.Timeout>,
  delayTimers: Record<string, number>
): boolean {
  if (!popup.delay || popup.delay <= 0) {
    return false;
  }

  if (!shouldApplyDelay(popup, history)) {
    return false;
  }

  const isScheduled = !!scheduledTimers[popup.id];
  const hasStartTime = !!delayTimers[popup.id];

  return !hasStartTime && !isScheduled;
}

/**
 * Validates if a popup can be shown based on trigger type.
 *
 * @param popup - The popup configuration to check
 * @param currentPopupsCount - Number of currently showing popups
 * @param history - Array of popup history items
 * @param delayTimers - Record of delay start times
 * @param scheduledTimers - Record of scheduled timer IDs
 * @returns true if popup can be shown based on trigger type, false otherwise
 */
export function canShowBasedOnTriggerType(
  popup: TPopupItemConfig,
  currentPopupsCount: number,
  history: TPopupHistoryItem[],
  delayTimers: Record<string, number>,
  scheduledTimers: Record<string, NodeJS.Timeout>
): boolean {
  switch (popup.triggerType) {
    case "IMMEDIATE":
    case "CONDITIONAL": {
      return true;
    }

    case "DELAYED": {
      return canShowDelayedPopup(popup, history, delayTimers, scheduledTimers);
    }

    case "AFTER_PREVIOUS": {
      // Must wait for current popups to close
      if (currentPopupsCount > 0) {
        return false;
      }
      return canShowDelayedPopup(popup, history, delayTimers, scheduledTimers);
    }

    default: {
      return true;
    }
  }
}
