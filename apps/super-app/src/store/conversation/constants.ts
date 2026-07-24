import { defaultAIArtStyle } from "@/config/ai-style-options";
import { DEFAULT_AI_MODEL } from "@/config/default-model";
import { IMAGE_MODELS } from "@/config/models";
import { EConversationMode } from "@/core/models/conversation";
import { AIModel, AIModelItem, EAIProviderModel } from "@/core/models/model";
import {
  defaultAssistantSetting,
  defaultAssistantWriting,
} from "@/utils/constants/assistant";
import { defaultConversationState } from "@/utils/constants/conversation";

import type { TConversationStoreState } from "./types";

const defaultSelectedModel = new AIModel();

export const defaultChatModel = {
  ...defaultSelectedModel,
  availableRoles: [] as string[],
  badge: null,
  description: "",
  isActive: false,
  isAllowChatVision: true,
  logo: "",
  provider: EAIProviderModel.OpenAI,
  title: "GPT-5 Nano",
  value: DEFAULT_AI_MODEL,
};

export const defaultSelectedImageModel: AIModelItem =
  IMAGE_MODELS[0] ?? new AIModelItem();
export const defaultConversationStoreState: TConversationStoreState = {
  assistantWritingSettings: defaultAssistantSetting,
  assistantWritingStates: {
    "": defaultAssistantWriting,
  },
  conversationStates: {
    "": defaultConversationState,
  },
  fileUploadStates: {},
  isEditImage: false,
  isLastGroupMessage: false,
  isOpenConsentsConfirm: false,
  isOpenConversationSync: false,
  isOpenImageLimitAlert: false,
  isOpenImageModelDropdown: false,
  isOpenImageUploadNotSupportedModal: false,
  isOpenImageUploadNotSupportedValidationModal: false,
  isOpenSliderAIArt: true,
  isOpenUploadFileModal: false,
  mode: EConversationMode.CHAT,
  selectedAIArt: defaultAIArtStyle,
  selectedFiles: [],
  selectedId: "",
  selectedImageModel: {
    ...defaultSelectedImageModel,
  },
  selectedModel: defaultChatModel,
  sessionId: null,
  streamControllers: {
    "": null,
  },
  suggestions: [],
  temporaryMessageForStreaming: null,
  useCaseConversation: {
    isUseCase: false,
    promptTemplate: "",
    questions: [],
    value: "",
  },
  userInput: "",
};
