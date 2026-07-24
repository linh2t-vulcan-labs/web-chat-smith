import type { SubscriptionModel } from "@/core/models/subscription";

export const defaultUserSubscriptionInfo: Omit<SubscriptionModel, "toPlain"> = {
  canShowExpiredSubPopup: false,
  currentSubscriptionInfo: null,
  existingTrialActive: false,
  isCurrentSubscriptionFromMobile: false,
  isExistActiveSubscriptionFromMobile: false,
  isExistActiveSubscriptionFromWeb: false,
  isExistSubscriptionFromWeb: false,
  isExistUserSubscription: false,
  isExpired: false,
  isValidPremiumUser: false,
  items: [],
  listSubscriptionFromMobile: [],
  listSubscriptionFromWeb: [],
  trialExists: false,
};

export const SUBSCRIPTION_YEARLY_EXPIRED_GRACE_DAYS = 30;
export const SUBSCRIPTION_MONTHLY_EXPIRED_GRACE_DAYS = 14;
export const SUBSCRIPTION_EXPIRED_POPUP_INTERVAL_DAYS = 7;
