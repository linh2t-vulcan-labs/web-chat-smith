import { avatarBackgroundColor } from "@/components/avatar/consts";
import type { TChatFreeUsage, TFreeUsageReset } from "@/core/models/usage";
import type { TUserOnboarding, UserInfoModel } from "@/core/models/user";

import { EUSER_ROLE } from "../commons/enums";
import { getRandomInt } from "../commons/helpers";

export const defaultUser: UserInfoModel = {
  avatar: "",
  avatarColor: avatarBackgroundColor[
    getRandomInt(0, avatarBackgroundColor.length - 1)
  ] as string,
  consents: null,
  createdAt: "",
  email: "",
  firstName: "",
  id: "",
  lastName: "",
  role: EUSER_ROLE.FREE,
  username: "",
};

export const defaultChatFreeUsage: TChatFreeUsage = {
  assistant: 0,
  chat: 0,
  deepResearch: 0,
  file: 0,
  imageCreation: 0,
  webSearch: 0,
};

export const defaultFreeUsageResetInfo: TFreeUsageReset = {
  assistant: null,
  chat: null,
  deepResearch: null,
  file: null,
  imageCreation: null,
  webSearch: null,
};

export const defaultUserOnboarding: TUserOnboarding = {
  isUserOnboarded: false,
  metadata: {
    interest: [],
    personal: "",
  },
};

// const SUBSCRIPTION_USER_ROLE = {
//   FREE: "free",
//   PREMIUM: "premium",
//   EXPIRED: "expired",
// };

export const CONSENT_CONFIRM_TYPE = {
  UPLOAD_TERMS_CONSENT: "UPLOAD_TERMS_CONSENT",
};

export const CONSENT_CONFIRM_ACTION = {
  CHAT_UPLOAD: "chat_upload",
  IMAGE_2_IMAGE_UPLOAD: "img2img_upload",
};

export const CONSENT_CONFIRM_VERSION = "V1.1";
