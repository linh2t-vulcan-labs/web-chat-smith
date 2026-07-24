const AUTH_ERROR_REASON = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  USER_DEACTIVATED: "USER_DEACTIVATED",
};

const CONVERSATION_ERROR_REASON = {
  EXCEED_FILE_UPLOAD_PER_CONVERSATION: "EXCEED_FILE_UPLOAD_PER_CONVERSATION",
  REACHED_LIMIT: "API_QUOTA_EXCEEDED",
};

const ERROR_MESSAGE_STATUS = {
  [CONVERSATION_ERROR_REASON.REACHED_LIMIT]:
    "You have reach advanced usage limit. Let upgrade to continue experience fastest and most advanced feature",
};

const ERROR_MESSAGE_SYSTEM = {
  MODEL_UNAVAILABLE:
    "Your previous model is temporarily unavailable. Switched to GPT-4o mini.",
  SUBSCRIPTION_EXPIRED:
    "Your subscription has expired. Switched to default model.",
  SYSTEM_ERROR:
    "We are facing system error for this setting. Please try again later",
};

const FILE_VALIDATION_ERROR_MESSAGE = {
  AI_ART_MAX_IMAGES: (maxImages: number) =>
    maxImages === 1
      ? `This style only allows up to ${maxImages} image`
      : `Please select ${maxImages} images or fewer. This style only allows up to ${maxImages} images`,
  AI_ART_NOT_ALLOW_ADDING_IMAGES: "This model doesn't allow adding images",
  FEATURE_NOT_SUPPORT_FILES: "This feature doesn't support files upload",
  MAX_FILES_UPLOAD: "You can only upload 10 files at a time.",
  MAX_IMAGES_UPLOAD: (maxImages: number) =>
    `You can upload up to ${maxImages} image${maxImages > 1 ? "s" : ""} per message`,
};

const FILE_VALIDATION_ERROR_KEY = {
  FEATURE_NOT_SUPPORT_FILES: "toast.error.fileNotSupport",
  MODEL_NOT_ALLOW_IMAGES: "toast.error.modelNotAllowImages",
  REACH_MAX_IMAGES: "toast.error.reachMaxImages",
  SINGLE_IMAGE: "toast.error.singleImage",
  TOO_MANY_FILES: "toast.error.tooManyFiles",
  TOO_MANY_IMAGES: "toast.error.tooManyImages",
} as const;

export {
  AUTH_ERROR_REASON,
  CONVERSATION_ERROR_REASON,
  ERROR_MESSAGE_STATUS,
  ERROR_MESSAGE_SYSTEM,
  FILE_VALIDATION_ERROR_MESSAGE,
  FILE_VALIDATION_ERROR_KEY,
};
