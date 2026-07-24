import { DEFAULT_AI_MODEL } from "@/config/default-model";
import { AIModel, EAIProviderModel } from "@/core/models/model";

import type { TGuestStoreState } from "./types";

const defaultSelectedModel = new AIModel();

export const defaultGuestStoreState: TGuestStoreState = {
  accessToken: null,
  anonId: null,
  bootstrapError: null,
  conversationState: {
    messages: [],
    status: "idle",
    temporaryMessageForStreaming: null,
  },
  csrfToken: "",
  deviceId: null,
  guestUserInput: "",
  isFetching: false,
  isOpenGuestConfirmModal: false,
  isOpenPromoteSignIn: true,
  isShowCaptchaModal: false,
  isTyping: false,
  isVerifiedCaptcha: false,
  nonce: "",
  selectedId: "",
  selectedModel: {
    ...defaultSelectedModel,
    availableRoles: [],
    badge: null,
    description: "",
    isActive: false,
    isAllowChatVision: true,
    logo: "",
    provider: EAIProviderModel.OpenAI,
    title: "GPT-5 Nano",
    value: DEFAULT_AI_MODEL,
  },
  sessionId: null,
  temporaryMessageForStreaming: null,
  verificationError: null,
};
