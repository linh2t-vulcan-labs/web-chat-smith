export const TOKEN_COOKIE_NAME = "access_token";
export const REFRESH_TOKEN_COOKIE_NAME = "refresh_token";
export const CSRF_COOKIE_TOKEN = "X-CSRF-token";

// const USER_DATA_REQUEST_HEADER = "X-Vulcan-User";
// const LOGIN_SUCCESS_SEARCH_PARAMS = "login";

// const XTokenExpiredSearchParams = "token_expire";
export const XCountryKey = "X-Country";
export const XTimezoneKey = "X-Timezone";

export const REFRESH_TOKEN_HEADER = "Refresh-Token";

// Cookies
export const COOKIE_NAME = {
  CAPTCHA_TOKEN: "captcha_token", // Captcha token storage
  CSRF_TOKEN: "csrf_token",
  NONCE: "nonce",
  VULCAN_AUTH_TOKEN: "vat",
  VULCAN_GUEST_TOKEN: "vgt", // Vulcan Guest Mode Token
  VULCAN_LOCALE: "vul-locale",
};
// LOCAL STORAGE
export const USER_ID_KEY = "userId";
export const SIGNIN_TIME_KEY = "signinTime";
export const SIGNIN_SOURCE_PATH_KEY = "signinSourcePath";
// const JUST_SIGNED_IN_KEY = "justSignedIn";
// const ASSISTANT_WRITING_PREFIX_KEY = "assistant-writing";
// const THREAD_PREFIX_KEY = "thread";
export const CURRENT_NEW_FEATURES_VERSION = "v2";
export const CURRENT_AI_STYLE_VERSION = "v2";
export const CURRENT_INFO_MODEL_VERSION = "v4";
export const CURRENT_BANANA_TOUR_VERSION = "v2";
export const OPEN_SUGGESTIONS_KEY = "open-suggestions";
export const OPEN_CONFIRM_SUGGESTION_KEY = "open-confirm-suggestions";
export const HAS_SEEN_REMINDER_MODAL_KEY = "has-seen-reminder-modal";
// const HAS_SEEN_SUBSCRIPTION_MODAL_KEY = "has-seen-subscription-modal";
export const HAS_SEEN_NEW_FEATURES_MODAL_KEY = `has-seen-new-features-modal`;
export const HAS_SEEN_INFO_MODEL = "has-seen-info-model";
export const HAS_SEEN_GEMINI_BANANA_TOUR_KEY = `has-seen-gemini-banana-tour`;
export const RECENT_FILES_KEY = "recent-files";
export const IS_SIGNED_IN_KEY = "is-signed-in";
export const SEEN_MODELS = "seen_models";
export const HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY =
  "has-seen-premium-onboarding-modal";
export const HAS_SEEN_PRO_PLAN_EXPIRED_MODAL_KEY =
  "has-seen-pro-plan-expired-modal";
export const HAS_SEEN_CHAT_SYNC_ALERT = "has-seen-chat-sync-alert";
export const ENABLE_PREMIUM_ONBOARDING_MODAL_KEY =
  "enable-premium-onboarding-modal";

export const LOCAL_STORAGE_KEY = {
  ACCESS_TOKEN_KEY: "access_token",
  /** Landing AI image tool: prompt + art style applied once after redirect to `/conversation?mode=...`. */
  AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF:
    "ai-tool-landing-image-generate-handoff",
  AUTH_REFRESH_LOCK: "auth-refresh-lock", // coordinate refresh rotation across tabs
  AUTH_STORE_DATA: "auth-store-data", // use in auth store
  GUEST_ID: "guest-id",
  GUEST_MODE_PRODUCT: "guest-product",
  GUEST_STORE_DATA: "guest-store-data", // use in guest store
  LOGIN_EVENT: "login-event",
  LOGOUT_EVENT: "logout-event",
  NOTIFICATION_STORE: "notification-store",
  VULCAN_AUTH_TOKEN: "vat",
  VULCAN_GUEST_TOKEN: "vgt", // Vulcan Guest Mode Token,
};
export const SEEN_IMAGE_MODELS = "seen_image_models";
export const SEEN_AI_CARD_ITEMS = "seen_ai_card_items";
// const HAS_SEEN_AI_ART_CONFIRMATION_MODAL = "has_seen_ai_art_confirmation_modal";
export const HAS_CLICKED_BANANA_CREATE_IMAGE =
  "has_clicked_banana_create_image";
export const HAS_SEEN_CUSTOM_RESPONSES = "has_seen_custom_responses";
export const PUSH_TOKEN_KEY = "push_token";
export const PUSH_TOKEN_ID_KEY = "push_token_id";
// const LAST_CHAT_AT_KEY = "last_chat_at";
export const FREE_USAGE_CLIENT_KEY = "free_usage_client";
