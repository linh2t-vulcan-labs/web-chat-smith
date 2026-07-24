import { DEFAULT_AI_MODEL } from "@/config/default-model";
import type {
  TAssistantSetting,
  TAssistantWriting,
} from "@/core/models/assistant-writing";
import type { TMessageTemp } from "@/core/models/conversation";
import { EMessageFeedbackStatus } from "@/core/models/message-feedback";

export const defaultAssistantSetting: TAssistantSetting = {
  feedback: "",
  length: "short",
  prompt: "",
  technique: "none",
  tone: "formal",
};

// const defaultPrompt: TMessageTemp = {
//   id: "",
//   content: "",
//   role: "user",
//   messageId: "",
//   feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
//   countToken: 0,
//   files: [],
//   type: "chat",
//   models: DEFAULT_AI_MODEL,
//   createdAt: "",
//   updatedAt: "",
//   status: "idle",
// };

export const defaultAssistantAnswer: TMessageTemp = {
  content: "",
  countToken: 0,
  createdAt: "",
  feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
  files: [],
  id: "",
  messageId: "",
  models: DEFAULT_AI_MODEL,
  role: "assistant",
  status: "idle",
  type: "chat",
  updatedAt: "",
};

export const defaultAssistantWriting: TAssistantWriting = {
  answer: defaultAssistantAnswer,
  settings: defaultAssistantSetting,
  status: "idle",
};

export enum AssistantType {
  ASSISTANT_WRITING = "writing",
  ASSISTANT_GRAMMAR = "grammar",
  ASSISTANT_LYRIC = "lyric",
}
