import type { SubscriptionItemModel } from "@/core/models/subscription";
import dayjs from "@/libs/dayjs";

import { formatToISO8601DateTime } from "../commons/date-time";
import {
  EDURATION_UNIT,
  ESUBSCRIPTION_SOURCE,
  ESUBSCRIPTION_STATUS,
  EUSER_ROLE,
} from "../commons/enums";
import {
  SUBSCRIPTION_EXPIRED_POPUP_INTERVAL_DAYS,
  SUBSCRIPTION_MONTHLY_EXPIRED_GRACE_DAYS,
  SUBSCRIPTION_YEARLY_EXPIRED_GRACE_DAYS,
} from "../constants/subscriptions";

/**
 * Checks if a subscription item has valid items array.
 */
export function hasValidSubscriptionItems(
  items: SubscriptionItemModel[] | undefined | null
): items is SubscriptionItemModel[] {
  return !!items && items.length > 0;
}

/**
 * Checks if a subscription is not expired by comparing expiredAt with current date.
 */
export function isSubscriptionNotExpired(expiredAt: string): boolean {
  const cleaned = formatToISO8601DateTime(expiredAt);
  const expireDate = dayjs.utc(cleaned, "YYYY-MM-DD HH:mm:ss");
  const today = dayjs().utc();
  return today.isBefore(expireDate);
}

/**
 * Checks if a subscription status is always considered active (doesn't require expiration check).
 */
const ALWAYS_ACTIVE_STATUSES = new Set([
  ESUBSCRIPTION_STATUS.ACTIVE,
  ESUBSCRIPTION_STATUS.TRIAL,
  ESUBSCRIPTION_STATUS.GRACE_PERIOD,
]);

function isSubscriptionStatusAlwaysActive(
  status: ESUBSCRIPTION_STATUS
): boolean {
  return ALWAYS_ACTIVE_STATUSES.has(status);
}

/**
 * Checks if a cancelled subscription is still active (not expired).
 */
function isCancelledSubscriptionActive(item: SubscriptionItemModel): boolean {
  if (item.status !== ESUBSCRIPTION_STATUS.CANCELLED) {
    return false;
  }
  return isSubscriptionNotExpired(item.expiredAt);
}

/**
 * Checks if a subscription item is active (either always active status or cancelled but not expired).
 */
function isSubscriptionItemActive(item: SubscriptionItemModel): boolean {
  if (isSubscriptionStatusAlwaysActive(item.status)) {
    return true;
  }
  return isCancelledSubscriptionActive(item);
}

/**
 * Checks if a subscription source is from mobile (Android or iOS).
 */
const MOBILE_SUBSCRIPTION_SOURCES = new Set([
  ESUBSCRIPTION_SOURCE.ANDROID,
  ESUBSCRIPTION_SOURCE.IOS,
]);

export function isMobileSubscriptionSource(
  source: ESUBSCRIPTION_SOURCE
): boolean {
  return MOBILE_SUBSCRIPTION_SOURCES.has(source);
}

/**
 * Checks if a subscription source is from web.
 */
export function isWebSubscriptionSource(source: ESUBSCRIPTION_SOURCE): boolean {
  return source === ESUBSCRIPTION_SOURCE.WEB;
}

/**
 * Checks if a subscription role is premium (active or cancelled).
 */
const PREMIUM_ROLES = new Set([
  EUSER_ROLE.PREMIUM,
  EUSER_ROLE.CANCELLED_PREMIUM,
]);

function isPremiumRole(role: EUSER_ROLE): boolean {
  return PREMIUM_ROLES.has(role);
}

/**
 * Filters subscription items by mobile source.
 */
export function filterSubscriptionsByMobileSource(
  items: SubscriptionItemModel[]
): SubscriptionItemModel[] {
  return items.filter((item) =>
    isMobileSubscriptionSource(item.subscriptionSource)
  );
}

/**
 * Filters subscription items by web source.
 */
export function filterSubscriptionsByWebSource(
  items: SubscriptionItemModel[]
): SubscriptionItemModel[] {
  return items.filter((item) =>
    isWebSubscriptionSource(item.subscriptionSource)
  );
}

/**
 * Finds the current subscription info (premium or cancelled premium from web).
 */
export function findCurrentSubscriptionInfo(
  items: SubscriptionItemModel[]
): SubscriptionItemModel | null {
  return (
    items.find(
      (item) =>
        isPremiumRole(item.role) &&
        isWebSubscriptionSource(item.subscriptionSource)
    ) ?? null
  );
}

/**
 * Checks if any subscription item has a premium role.
 */
export function hasPremiumRole(items: SubscriptionItemModel[]): boolean {
  return items.some((item) => item.role === EUSER_ROLE.PREMIUM);
}

/**
 * Finds a cancelled premium package from items.
 */
export function findCancelledPremiumPackage(
  items: SubscriptionItemModel[]
): SubscriptionItemModel | undefined {
  return items.find((item) => item.role === EUSER_ROLE.CANCELLED_PREMIUM);
}

/**
 * Checks if any subscription items are active (for a given source filter).
 */
export function hasActiveSubscription(
  items: SubscriptionItemModel[],
  sourceFilter?: (source: ESUBSCRIPTION_SOURCE) => boolean
): boolean {
  const filteredItems = sourceFilter
    ? items.filter((item) => sourceFilter(item.subscriptionSource))
    : items;
  return filteredItems.some((item) => isSubscriptionItemActive(item));
}

export function checkSubscriptionPassedGracePeriod(
  items: SubscriptionItemModel[],
  fallback: boolean
) {
  // Check if the most recently expired subscription has passed the grace period
  const now = dayjs().utc();
  const expiredItems = items.filter((item) => {
    const expireDate = dayjs(formatToISO8601DateTime(item.expiredAt)).utc();
    return expireDate.isBefore(now);
  });

  // If no expired items, return the original logic
  if (expiredItems.length === 0) {
    return fallback;
  }

  // Find the most recently expired subscription (latest expired_at)
  let mostRecentExpired: SubscriptionItemModel =
    expiredItems[0] as SubscriptionItemModel;
  for (const current of expiredItems) {
    const latestDate = dayjs(mostRecentExpired.expiredAt);
    const currentDate = dayjs(current.expiredAt);
    if (currentDate.isAfter(latestDate)) {
      mostRecentExpired = current;
    }
  }

  const mostRecentExpiredDate = dayjs(
    formatToISO8601DateTime(mostRecentExpired.expiredAt)
  ).utc();
  // Check if it's a yearly subscription
  const isYearly = mostRecentExpired.durationUnit === EDURATION_UNIT.YEAR;
  const gracePeriodDays = isYearly
    ? SUBSCRIPTION_YEARLY_EXPIRED_GRACE_DAYS
    : SUBSCRIPTION_MONTHLY_EXPIRED_GRACE_DAYS;

  // Check if expired_at has passed the grace period
  const gracePeriodEndDate = mostRecentExpiredDate.add(gracePeriodDays, "day");
  const hasPassedGracePeriod = now.isAfter(gracePeriodEndDate);
  return hasPassedGracePeriod;
}

export function checkSubscriptionPassedExpireGracePeriod(
  items: SubscriptionItemModel[],
  fallback: boolean
) {
  // Check if the most recently expired subscription has passed the grace period
  const now = dayjs().utc();
  const expiredItems = items.filter((item) => {
    const expireDate = dayjs(formatToISO8601DateTime(item.expiredAt)).utc();
    return expireDate.isBefore(now);
  });

  // If no expired items, return the original logic
  if (expiredItems.length === 0) {
    return fallback;
  }

  // Find the most recently expired subscription (latest expired_at)
  let mostRecentExpired: SubscriptionItemModel =
    expiredItems[0] as SubscriptionItemModel;
  for (const current of expiredItems) {
    const latestDate = dayjs(mostRecentExpired.expiredAt);
    const currentDate = dayjs(current.expiredAt);
    if (currentDate.isAfter(latestDate)) {
      mostRecentExpired = current;
    }
  }

  const mostRecentExpiredDate = dayjs(
    formatToISO8601DateTime(mostRecentExpired.expiredAt)
  ).utc();

  const gracePeriodDays = SUBSCRIPTION_EXPIRED_POPUP_INTERVAL_DAYS;

  const gracePeriodEndDate = mostRecentExpiredDate.add(gracePeriodDays, "day");
  const hasValidGraceExpirePeriod = now.isBefore(gracePeriodEndDate);
  return hasValidGraceExpirePeriod;
}
