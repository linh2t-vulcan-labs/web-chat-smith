import { localStorageImpl } from "@/utils/commons/helpers";
import { MANAGE_ACCOUNT_URL } from "@/utils/constants/url";

interface TGetPopupStorageKeyOptions {
  version?: string;
  userId?: string;
  includePrefix?: boolean;
}

/**
 * Storage keys for tracking popup display history
 */
const POPUP_SHOWN_STORAGE_PREFIX = "popup_shown_";

/**
 * Helper to get localStorage key for a popup
 */
const getPopupStorageKey = (
  popupId: string,
  options?: TGetPopupStorageKeyOptions
) => {
  const { version, includePrefix = true, userId } = options || {};

  const prefix = includePrefix ? POPUP_SHOWN_STORAGE_PREFIX : "";
  // Build the base key: popupId with optional userId
  const baseKey = userId ? `${popupId}-${userId}` : popupId;
  // Append version if provided
  const finalKey = version ? `${baseKey}-${version}` : baseKey;

  return `${prefix}${finalKey}`;
};

/**
 * Helper to check if a key exists in localStorage and is set to true
 */
const isKeySet = (key: string): boolean =>
  localStorageImpl.load<boolean>(key) === true;

/**
 * Get the old format key (without userId) for backward compatibility
 */
const getOldFormatKey = (
  popupId: string,
  version: string | undefined,
  includePrefix: boolean | undefined
): string => getPopupStorageKey(popupId, { includePrefix, version });

/**
 * Migrate old format key to new format (with userId)
 */
const migrateOldKeyToNew = (oldKey: string, newKey: string): void => {
  localStorageImpl.save(newKey, true);
  localStorageImpl.remove(oldKey);
};

/**
 * Check if a popup has been shown before
 * Supports backward compatibility: checks both old format (popupId-version) and new format (popupId-userId-version)
 * If old format is found and userId is provided, migrates the old key to new format
 * This ensures old users who have seen the popup will continue to not see it, and the storage is updated to new format
 */
export const hasPopupBeenShown = (
  popupId: string,
  options?: TGetPopupStorageKeyOptions
): boolean => {
  const { version, userId, includePrefix } = options || {};

  // If userId is provided, check new format first
  if (userId) {
    const newKey = getPopupStorageKey(popupId, options);
    if (isKeySet(newKey)) {
      return true;
    }

    // Check old format and migrate if found
    const oldKey = getOldFormatKey(popupId, version, includePrefix);
    if (isKeySet(oldKey)) {
      migrateOldKeyToNew(oldKey, newKey);
      return true;
    }

    return false;
  }

  // No userId provided, check old format only (no migration)
  const oldKey = getOldFormatKey(popupId, version, includePrefix);
  return isKeySet(oldKey);
};

/**
 * Mark a popup as shown
 * Uses new format (popupId-userId-version) if userId is provided, otherwise uses old format
 * This ensures new users get the new format while maintaining backward compatibility
 * Also checks for user ID changes and clears old user's popup keys if needed
 */
export const markPopupAsShown = (
  popupId: string,
  options?: TGetPopupStorageKeyOptions
): void => {
  const key = getPopupStorageKey(popupId, options);
  localStorageImpl.save(key, true);
};

/**
 * Clear old version keys for a specific popup
 * This allows the popup to re-open when the version changes
 * Handles both old format (popupId-version) and new format (popupId-userId-version)
 * @param popupId - The base popup ID (without userId)
 * @param currentVersion - The current version to keep
 * @param userId - Optional user ID to scope the cleanup to a specific user
 * @param includePrefix - Whether to include the popup_shown_ prefix (default: true)
 */
export const clearOldPopupVersionKeys = (
  popupId: string,
  currentVersion: string,
  userId?: string,
  includePrefix = false
): void => {
  const currentKey = getPopupStorageKey(popupId, {
    includePrefix,
    userId,
    version: currentVersion,
  });

  // Build prefix based on includePrefix setting
  const prefix = includePrefix ? POPUP_SHOWN_STORAGE_PREFIX : "";
  // Build prefix for old format: [prefix]popupId-
  const oldFormatPrefix = `${prefix}${popupId}-`;
  // Build prefix for new format: [prefix]popupId-userId-
  const newFormatPrefix = userId ? `${prefix}${popupId}-${userId}-` : null;

  const shouldClearKey = (key: string): boolean => {
    // Skip the current key
    if (key === currentKey) {
      return false;
    }

    // If userId is provided, only clear keys for this specific userId
    if (userId && newFormatPrefix) {
      // Check if key matches new format for current userId (format: popupId-userId-version)
      // Example: if newFormatPrefix is "has-seen-info-model-82ade9e6-7e99-4a79-a1a4-47e8d6263f09-"
      // then keys starting with this prefix are for userId "82ade9e6-7e99-4a79-a1a4-47e8d6263f09"
      if (key.startsWith(newFormatPrefix)) {
        // This key is for the current userId, extract version and clear if different
        const version = key.slice(newFormatPrefix.length);
        return version !== currentVersion;
      }

      // Key doesn't start with newFormatPrefix, so it's either:
      // 1. For a different userId (e.g., "has-seen-info-model-differentUserId-v2") - KEEP IT
      // 2. Old format without userId (e.g., "has-seen-info-model-v2") - KEEP IT (for migration safety)
      //
      // We only clear keys that explicitly match our userId prefix to ensure we keep
      // keys for different user IDs even if they have the same version
      return false;
    }

    // No userId provided - handle old format keys (backward compatibility)
    // Only clear old format keys when no userId is specified
    if (key.startsWith(oldFormatPrefix)) {
      const afterPrefix = key.slice(oldFormatPrefix.length);
      // Clear if version is different
      return afterPrefix !== currentVersion;
    }

    // Don't clear keys that don't match our patterns
    return false;
  };

  for (const key of Object.keys(localStorage)) {
    if (shouldClearKey(key)) {
      localStorage.removeItem(key);
    }
  }
};

/**
 * Condition: Show only once (generic)
 */
export const shouldShowOnce = (
  popupId: string,
  options?: TGetPopupStorageKeyOptions
): boolean => !hasPopupBeenShown(popupId, options);

/**
 * Condition checker for DS Subscription popup
 * Should show only once on first login for non-premium users
 */
export const createDSSubscriptionCondition =
  (
    isValidPremiumUser: boolean,
    isFinishFetchProfile: boolean,
    isBananaRoute: boolean,
    justSignedIn: boolean
  ) =>
  (): boolean => {
    const currentPathName = globalThis.location.pathname;

    // Wait until profile is fetched
    // Don't show DS when on manage-account route
    if (
      !isFinishFetchProfile ||
      isValidPremiumUser ||
      isBananaRoute ||
      !justSignedIn ||
      currentPathName.startsWith(MANAGE_ACCOUNT_URL)
    ) {
      return false;
    }

    return true;
  };

/**
 * Condition checker for Home Chat Animation popup
 * Can show multiple times but only for non-premium users
 */
export const createHomeChatAnimationCondition =
  (
    userId: string | undefined,
    isValidPremiumUser: boolean,
    isFinishFetchProfile: boolean
  ) =>
  (): boolean => {
    if (!isFinishFetchProfile || !userId) {
      return false;
    }

    // Can show for any user
    return true;
  };

/**
 * Condition checker for What's New popups
 * Supports versioning - will re-show when version changes
 */
export const createWhatsNewCondition =
  (
    popupId: string,
    isFinishFetchProfile: boolean,
    isBananaRoute: boolean,
    options?: TGetPopupStorageKeyOptions
  ) =>
  (): boolean => {
    if (!isFinishFetchProfile || isBananaRoute) {
      return false;
    }

    return shouldShowOnce(popupId, options);
  };

/**
 *
 *  Condition checker for What's New tooltip
 *  Should show only once
 */

export const createWhatsNewTooltipCondition =
  (
    popupId: string,
    isFinishFetchProfile: boolean,
    options?: TGetPopupStorageKeyOptions
  ) =>
  (): boolean => {
    if (!isFinishFetchProfile) {
      return false;
    }

    return shouldShowOnce(popupId, options);
  };

/**
 * Condition checker for Notification Permission Popup
 * Should show only once
 */
export const createNotificationPermissionCondition =
  (
    popupId: string,
    isFinishFetchProfile: boolean,
    options?: TGetPopupStorageKeyOptions
  ) =>
  (): boolean => {
    if (!isFinishFetchProfile) {
      return false;
    }
    return shouldShowOnce(popupId, options);
  };

/**
 * Generic condition factory that combines multiple conditions
 */
// const combineConditions =
//   (...conditions: (() => boolean)[]) =>
//   (): boolean =>
//     conditions.every((condition) => condition());
