// import { DEFAULT_AI_MODEL } from "@/config/default-model";
import type {
  // ConversationModel,
  TConversationState,
  TMessageType,
} from "@/core/models/conversation";
// import { EAIProviderModel, EAIValueModel } from "@/core/models/model";

export const MAX_TOKENS = 10_000;
// const MAX_TEXT_AREA_ROWS = 6;
export const MESSAGE_THRESHOLD = 0.9;
export const FREE_USER_DIALOG_TRIGGERS = [2, 4];
export const AI_ART_MAX_INPUT_LENGTH = 2048;

export const SUMMARY_TITLE_PROMPT =
  "Create a brief chat title in five words or fewer summarizing this conversation";

export const SUGGESTION_CONVERSATION_PROMPT =
  'Predict 4 short request messages the user may send related to this conversation. JSON format: {"predictions": [String]}. Return JSON only.';

export const DEFAULT_USECASE_TAB = "career_development";

// const defaultConversation: ConversationModel = {
//   id: "",
//   conversationConvId: "",
//   name: "",
//   refId: "",
//   lastMessage: "",
//   longPollingProcess: {
//     processId: "",
//     status: "",
//     type: "",
//   },
//   pinned: false,
//   path: "",
//   useCase: "chat",
//   pinnedAt: "",
//   lastActiveAt: "",
//   updatedAt: "",
//   createdAt: "",
//   lastModel: DEFAULT_AI_MODEL,
//   lastProvider: EAIProviderModel.OpenAI,
//   isMigrated: false,
//   platform: "",
// };

export const defaultConversationState: TConversationState = {
  convId: "",
  messages: [],
  status: "idle",
  temporaryMessageForStreaming: null,
};

export const defaultModels = [];
export const defaultMCustomResponses = [];

export const ENABLED_SUGGESTION_MESSAGE_TYPE: TMessageType[] = [
  "chat",
  "realtime_search",
];

// Files
export const FREE_QUANTITY_UPLOAD = 5;
export const PREMIUM_QUANTITY_UPLOAD = 10;
// const IMAGE_TO_IMAGE_MAX_ALLOW_FILE = 1;
export const MAX_SIZE_IN_MB = 20;
export const CHAT_POLLING_INTERVAL_TIME = 5 * 1000; // 5s;
export const CHAT_POLLING_TIMEOUT = 1000 * 60 * 5; // 5 minutes
// const MODEL_LIST_UNSUPPORTED_FILES = [EAIValueModel.Deepseek];
export const MAX_IMAGES_PER_UPLOAD = 4;
