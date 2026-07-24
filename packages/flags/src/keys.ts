/**
 * Firebase Remote Config keys.
 *
 * These string values map 1:1 to the keys configured in the Firebase Remote
 * Config console. Do NOT rename the string values — they are the contract
 * with Firebase. Only the TypeScript identifiers are allowed to change.
 */
export const REMOTE_CONFIG_KEYS = {
  CHAT_MEMORY_USED: "chat_memory_used",
  CONVERSATION_SUGGESTION_OPTIONS: "conversation_suggestion_options",
  ENABLE_DESIGN_STUDIO_TOGGLE: "enable_design_studio_toggle",
  ENABLE_PADDLE_RETAIN: "enable_paddle_retain",
  ENABLE_THEME_TOGGLE: "enable_theme_toggle",
  FEATURE_PADDLE_CHECKOUT: "feature_paddle_checkout",
  FEATURE_PAYMENT_FLOW_V2: "feature_payment_flow_v2",
  FLOATING_UPGRADE_CONFIG: "floating_upgrade_config",
  FREE_USER_USAGE_CONFIG: "free_user_usage_config",
  LIST_STYLE_OPTIONS: "list_style_options",
  MANAGE_SUBSCRIPTION_MECHANISM: "manage_subscription_mechanism",
  MESSAGE_FEEDBACK_OPTIONS: "message_feedback_options",
  NOTIFICATION_CONFIG: "notification_config",
  ONBOARDING_POPUP_GUIDE_SETTING: "onboarding_popup_guide_setting",
  PACKAGE_SUBSCRIPTION_INFO: "package_subscription_info",
  PACKAGE_SUBSCRIPTION_UI_VERSION: "package_subscription_ui_version",
  SIDEBAR_DOWNLOAD_APP_LABEL: "sidebar_download_app_label",
  SOCIAL_LINKS: "social_links",
  SYNC_BETA: "sync_beta",
  UI_IMAGE_CONFIG: "ui_image_config",
  WEB_FEATURES: "web_features",
  WHATS_NEW_OPTIONS: "whats_new_options",
  WHATS_NEW_POPUP_OPTIONS: "whats_new_popup_options",
} as const;

/**
 * Nested feature keys stored inside the {@link REMOTE_CONFIG_KEYS.WEB_FEATURES}
 * JSON object. These are object keys within that JSON payload, not top-level
 * Remote Config keys.
 */
export const WEB_FEATURE_KEYS = {
  CUSTOM_RESPONSE: "customResponse",
  FEATURE_FAQ: "featureFaq",
  FEATURE_SURVEY_REQUEST: "featureSurveyRequest",
  SIGN_IN_ONE_TAP: "signInOneTap",
  SOCIALS_LINK: "socialLinks",
  SYNC_HISTORY: "syncHistory",
} as const;

export type RemoteConfigKey =
  (typeof REMOTE_CONFIG_KEYS)[keyof typeof REMOTE_CONFIG_KEYS];
export type WebFeatureKey =
  (typeof WEB_FEATURE_KEYS)[keyof typeof WEB_FEATURE_KEYS];
