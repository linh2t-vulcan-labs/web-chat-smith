// const POPUP_QUEUE_STORAGE_KEY = "popup_queue_state";
// const ONBOARDING_END_TIMESTAMP_KEY = "onboarding_end_timestamp";

// Default delays (in milliseconds)
export const ONBOARDING_POPUP_QUEUE_DELAYS = {
  AFTER_DS_CLOSE: 200, // 0.2 seconds
  AFTER_ONBOARDING: 3000, // 3 minutes
  BETWEEN_POPUPS: 300, // 0.3 seconds
} as const;

export const POPUP_QUEUE_KEY = {
  DS_SUBSCRIPTION: "ds-subscription",
  EXPIRED_SUBSCRIPTION: "expired-subscription",
  HOME_CHAT_ANIMATION: "home-chat-animation",
  NOTIFICATION_PERMISSION: "notification-permission",
  ONBOARDING_GUIDE: "onboarding-guide",
  WHATS_NEW_POPUP: "whats-new-popup",
  WHATS_NEW_TOOLTIP: "whats-new-tooltip",
} as const;
