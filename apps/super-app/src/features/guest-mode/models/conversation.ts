import type { TMessageRole } from "@/core/http/dto/conversation";
import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import { ASSISTANT_WRITING_URL, CONVERSATION_URL } from "@/utils/constants/url";
// import { mapDtoToMessageTemp } from "@/utils/mappers/conversations";

import type { EAIValueModel } from "./index";

// Conversation Entities
export type TRole = "user" | "assistant" | "developer";
export type TStatusMessage =
  | "pending"
  | "success"
  | "error"
  | "idle"
  | "generating"
  | "reachedLimit"
  | "premiumOnly"
  | "comingSoon"
  | "skipped";
export type TStatusConversation =
  | "idle"
  | "loading"
  | "generating"
  | "polling"
  | "submitted"
  | "error";
export type TConversationUseCase = "chat" | "academic_writing";
export type TTracingStatus = "done" | "failed" | "in_progress" | "canceled";
export type TMessageType =
  | "chat"
  | "deep_research"
  | "deep_research_analyze"
  | "image_creation"
  | "realtime_search";

export enum EConversationMode {
  CHAT = "chat",
  DEEP_RESEARCH = "deep_research",
  AI_ART = "image_creation",
  WEB_SEARCH = "web_search",
}

export enum ETracingProcessType {
  DEEP_RESEARCH = "PROCESS_TYPE_DEEP_RESEARCH",
  UNSPECIFIED = "PROCESS_TYPE_UNSPECIFIED",
}

export interface TMessage {
  uid: string;
  role: TRole;
  message: string;
  status: TStatusMessage;
}

@Exclude()
class ConversationPollingProcessModel {
  @Expose({ name: "process_id" })
  processId!: string;

  @Expose()
  status!: string;

  @Expose()
  type!: TMessageType | "";
}

@Exclude()
class ConversationModel {
  @Expose()
  @Transform(({ obj }) => obj["ref_id"])
  id!: string;

  @Expose()
  name!: string;

  @Expose({ name: "user_id" })
  userId?: string;

  @Expose({ name: "last_message" })
  lastMessage!: string;

  @Expose()
  pinned!: boolean;

  @Expose({ name: "ref_id" })
  refId!: string;

  @Expose({ name: "last_active_at" })
  lastActiveAt!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "pinned_at" })
  pinnedAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose({ name: "use_case" })
  useCase!: TConversationUseCase;

  @Expose({ name: "long_polling_process" })
  @Type(() => ConversationPollingProcessModel)
  longPollingProcess!: ConversationPollingProcessModel;

  @Expose()
  get path(): string {
    const urlSegmentObj: Record<TConversationUseCase, string> = {
      academic_writing: ASSISTANT_WRITING_URL,
      chat: CONVERSATION_URL,
    };

    return `${urlSegmentObj[this.useCase] ?? CONVERSATION_URL}/${this.refId}`;
  }
}

export interface TConversationState {
  status: TStatusConversation;
  temporaryMessageForStreaming?: TMessageTemp | null;
  messages: TMessageTemp[];
  error?: unknown;
  isNew?: boolean;
}

export type TConversationStates = Record<string, TConversationState>;

export interface TGetConversationVersion {
  version: string;
}

export interface TResponseGetConversations {
  next_page_token: string;
  version: string;
  data: ConversationModel[];
}

export interface TGetMessagesByConversationId {
  next_id: string;
  data: TMessageTemp[];
}

export interface TGetImagesByConversationId {
  next_id: string;
  data: TImage[];
}

export interface TFileMessage {
  fileId: string;
  fileName: string;
  fileSize: number;
  fileMimeType: string;
  downloadUrl: string;
}

export interface TCitationMessage {
  url: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface TDeepResearchStepMessage {
  thinking: string;
  researching: string;
  exploring: string;
  analyzing: string;
  done: string;
}

export interface TDeepResearchMessageInfo {
  citations: TCitationMessage[];
  steps: TDeepResearchStepMessage;
  processTime: string;
}

export interface TImageCreationInfo {
  style: string;
}

export interface TMessageTemp {
  id: string;
  role: TMessageRole;
  content: string;
  uiContent?: string; // Update to message markdown if transform data
  messageId?: string; // id from server
  feedbackStatus: EMessageFeedbackStatus;
  countToken: number;
  type: TMessageType;
  status: TStatusMessage;
  models: EAIValueModel;
  updatedAt: string;
  createdAt: string;
  files: TFileMessage[];
  deepResearchInfo?: TDeepResearchMessageInfo;
  imageCreationInfo?: TImageCreationInfo; // Text to Image and Image to Image
}

export interface TImage {
  id: string;
  url: string;
}

export interface TTracingProcessResponse {
  message: TMessageTemp | null;
  status: TTracingStatus;
}

export interface TUseCaseConversation {
  isUseCase: boolean;
  questions: string[];
  promptTemplate: string;
}

// API entities
export interface TDeleteConversationById {
  status: "inactive" | "active";
}

export interface TUpdateConversationNameById {
  name: string;
}

export interface TUpdateConversationPinById {
  pinned: boolean;
  pinnedAt: string;
}

export interface TUpdateConversationUnPinById {
  pinned: boolean;
}

// Others
export interface TSuggestionPayload {
  previousMessages: TMessage[];
  userMessage: TMessage;
  model: EAIValueModel;
}

export interface TSelectedFile {
  mockId: string;
  mimeType: string;
  fileName: string;
  fileSize: number;
  fileId?: string;
  file?: File;
  fileUrl?: string;
}

export interface TGetAssistantMessageAfterSendOptions {
  deepResearchInfo?: { isRegenerate: boolean };
  imageCreationInfo?: { isRegenerate: boolean };
  realTimeSearchInfo?: { isRegenerate: boolean };
}

export interface TSelectedAIArt {
  id: string;
  title: string;
  description: string;
  image: string;
  value: EAIART_STYLE;
}

// @Exclude()
// class DeepResearchChatResponseModel {
//   @Expose({ name: "process_id" })
//   processId!: string;

//   @Expose()
//   status!: TTracingStatus;

//   @Expose({ name: "response_message" })
//   @Transform(({ value }) => {
//     if (!value) {
//       return null;
//     }

//     if (!value.ref_id) {
//       return null;
//     }

//     return mapDtoToMessageTemp(value);
//   })
//   responseMessage!: TMessageTemp;
// }

// @Exclude()
// class WebSearchModel {
//   @Expose({ name: "data" })
//   @Transform(({ value }) => {
//     if (!value) {
//       return null;
//     }

//     return mapDtoToMessageTemp(value);
//   })
//   message!: TMessageTemp;
// }
