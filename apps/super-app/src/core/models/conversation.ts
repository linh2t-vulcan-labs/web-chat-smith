import type {
  EMessageState,
  TMessageRole,
  TSyncAllowDTO,
} from "@/core/http/dto/conversation";
import type { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import { ASSISTANT_WRITING_URL, CONVERSATION_URL } from "@/utils/constants/url";
import {
  mapDtoToMessageTemp,
  normalizeMessageType,
} from "@/utils/mappers/conversations";

import type { TAIArtOptions } from "../ports/chat-features/image-creation";
import type { EAIProviderModel, EAIValueModel } from "./model";

// Placeholder shown for a conversation whose name hasn't been generated yet
// (e.g. right after creation, before the backend's async title job runs).
export const DEFAULT_CONVERSATION_NAME = "Untitled";

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
/** Message statuses that mean the chat input should be locked (quota/paywall/unavailable). */
export const LIMIT_MESSAGE_STATUSES = new Set<TStatusMessage>([
  "reachedLimit",
  "premiumOnly",
  "comingSoon",
]);
export type TStatusConversation =
  | "idle"
  | "loading"
  | "generating"
  | "polling"
  | "submitted"
  | "error";
export type TConversationUseCase = "chat" | "academic_writing";
export type TTracingStatus = "done" | "failed" | "in_progress" | "canceled";
/**
 * Message Type Enum - Single source of truth for message types
 * When BE changes values, only update the enum values here
 */

export enum EMessageType {
  // Normal Chat
  CHAT = "chat",

  // Deep Research
  DEEP_RESEARCH = "deep_research",
  DEEP_RESEARCH_ANALYZE = "deep_research_analyze",

  // Image Creation
  IMAGE_CREATION = "image_creation",

  // Web Search
  REALTIME_SEARCH = "realtime_search",
}

// Keep TMessageType for backward compatibility with existing code
export type TMessageType =
  | "chat"
  | "deep_research"
  | "deep_research_analyze"
  | "image_creation"
  | "realtime_search";

export type TMessageTypeSync =
  | "text"
  | "text_to_image"
  | "image_to_text"
  | "chat_with_file"
  | "image_to_image"
  | "task"
  | "task_response"
  | "assistant_writing"
  | "real_time_search"
  | "deep_research_conversation"
  | "deep_research";

export enum EConversationMode {
  CHAT = "chat",
  DEEP_RESEARCH = "deep_research",
  AI_ART = "image_creation",
  WEB_SEARCH = "web_search",
}

export enum EStopConversationTaskType {
  PROCESS_TYPE_UNSPECIFIED = "PROCESS_TYPE_UNSPECIFIED",
  PROCESS_TYPE_IMAGE_GENERATION = "PROCESS_TYPE_IMAGE_GENERATION",
  PROCESS_TYPE_REAL_TIME_SEARCH = "PROCESS_TYPE_REAL_TIME_SEARCH",
  PROCESS_TYPE_DEEP_RESEARCH = "PROCESS_TYPE_DEEP_RESEARCH",
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
  @Transform(({ value }) => (value ? normalizeMessageType(value) : ""))
  type!: TMessageType | "";
}

@Exclude()
export class ConversationModel {
  @Expose()
  @Transform(({ obj }) => obj["ref_id"])
  id!: string;

  @Expose()
  @Transform(({ value }) => value || DEFAULT_CONVERSATION_NAME)
  name!: string;

  @Expose({ name: "user_id" })
  userId?: string;

  @Expose({ name: "last_message" })
  lastMessage!: string;

  @Expose()
  pinned!: boolean;

  @Expose({ name: "ref_id" })
  refId!: string;

  @Expose({ name: "conversation_conv_id" })
  conversationConvId!: string;

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

  @Expose({ name: "last_model" })
  lastModel!: EAIValueModel;

  @Expose({ name: "last_provider" })
  lastProvider!: EAIProviderModel;

  @Expose({ name: "is_migrated" })
  isMigrated!: boolean;

  @Expose({ name: "platform" })
  platform!: string;

  @Expose()
  @Transform(({ obj }) => {
    const urlSegmentObj: Record<TConversationUseCase, string> = {
      academic_writing: ASSISTANT_WRITING_URL,
      chat: CONVERSATION_URL,
    };

    return `${
      urlSegmentObj[obj["use_case"] as TConversationUseCase] ?? CONVERSATION_URL
    }/${obj["ref_id"]}`;
  })
  path!: string;
}

export interface TConversationState {
  convId: string;
  status: TStatusConversation;
  temporaryMessageForStreaming?: TMessageTemp | null;
  processId?: string;
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

export interface TResponseGetConversationsV2 {
  has_more: boolean;
  next_cursor: string;
  prev_cursor: string;
  data: ConversationModel[];
}

export interface TGetMessagesByConversationId {
  has_more: boolean;
  next_id: string;
  data: TMessageTemp[];
}

export interface TGetMessagesByConversationIdV2 {
  has_more: boolean;
  next_id: string;
  prev_cursor: string;
  data: TMessageTemp[];
}

export interface TGetImagesByConversationId {
  next_id: string;
  data: TImage[];
}

export interface TGetImagesByConversationIdV2 {
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
  state?: EMessageState;
  models: EAIValueModel;
  provider?: EAIProviderModel;
  updatedAt: string;
  createdAt: string;
  files: TFileMessage[];
  deepResearchInfo?: TDeepResearchMessageInfo;
  imageCreationInfo?: TImageCreationInfo; // Text to Image and Image to Image
  contextJson?: {
    schemaVersion: number;
    textToImage: {
      generationPrompt: string;
      negativePrompt: string;
    };
  };
}

export interface TImage {
  id: string;
  url: string;
}

export interface TTracingProcessResponse {
  message: TMessageTemp | null;
  failedReason?: string;
  status: TTracingStatus;
}

export interface TUseCaseConversation {
  isUseCase: boolean;
  value: string;
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

export type TSelectedAIArt = TAIArtOptions;

@Exclude()
export class DeepResearchChatResponseModel {
  @Expose({ name: "process_id" })
  processId!: string;

  @Expose()
  status!: TTracingStatus;

  @Expose({ name: "response_message" })
  @Transform(({ value }) => {
    if (!value) {
      return null;
    }

    if (!value.ref_id) {
      return null;
    }

    return mapDtoToMessageTemp(value);
  })
  responseMessage!: TMessageTemp;
}

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

export interface TGuestChatInputDTO {
  messages: TMessageTemp[];
  model: EAIValueModel;
  provider: EAIProviderModel;
}

export interface TMapMessageContentToSyncDTOParams {
  messages?: TMessageTemp[];
  conversationId: string;
  convId?: string;
  useMemory?: boolean;
  syncAllow?: TSyncAllowDTO;
  messageType?: TMessageTypeSync;
}

// File Validation

export interface TValidationResult {
  isValid: boolean;
  errorKey?: string;
  errorParams?: Record<string, string | number | Date>;
}

export interface TValidateFilesParams {
  files: TSelectedFile[];
  conversationMode: EConversationMode;
  selectedAIArt: TSelectedAIArt;
  maxFiles?: number;
}
