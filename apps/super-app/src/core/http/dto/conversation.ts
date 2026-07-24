import type {
  TMessage,
  TMessageTemp,
  TMessageType,
  TMessageTypeSync,
  TSelectedFile,
  TStatusMessage,
  TTracingStatus,
} from "@/core/models/conversation";
import type { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import type { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { Exclude, Expose, Transform } from "@/libs/class-transformer";
import {
  mapMessageTempToDto,
  mappingMessageTempToMessageDeepResearchDTO,
} from "@/utils/mappers/conversations";

export enum EUseCase {
  CHAT = "USE_CASE_CHAT",
  UNSPECIFIED = "USE_CASE_UNSPECIFIED", // use to get full
  ACADEMIC_WRITING = "USE_CASE_ACADEMIC_WRITING",
  GRAMMAR = "USE_CASE_GRAMMAR",
}
export type TMessageRole = "user" | "assistant" | "developer";

export enum EMessageState {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

enum EMessageContentType {
  TEXT = "text",
  IMAGE = "image",
}

/* INPUT TYPES */
export interface TCreateTempMessageInput {
  prompt: string;
  status?: TStatusMessage;
  type: TMessageType;
  role?: TMessageRole;
  model?: EAIValueModel;
  files?: TSelectedFile[];
  imageStyle?: string; // use for image creation
}

export interface TCreateAssistantTempMessagesInput {
  prompt: string;
  status: TStatusMessage;
  models: EAIValueModel;
}

export type TCreateRegenerateMessageInput = ChatInputDTO & {
  id: string;
  convId?: string;
  selectedCustomResponse: string | null;
  originalMessages: TMessageTemp[];
  shouldSyncCrossPlatform?: boolean;
  useMemory?: boolean;
  readSource?: TReadSourceDTO;
};

export type TCreatePredictionInput = ChatInputDTO;

export interface TCreateConversationInput {
  use_case: EUseCase;
}

export interface TCreateGroupMessageInput {
  messages: TMessageTemp[];
}

export interface TGetConversationsInput {
  page_token: number | string;
  limit: number | string;
  use_case: EUseCase;
}
export interface TGetConversationsInputV2 {
  next_cursor?: number | string;
  limit: number | string;
}

export interface TGetMessagesByIdInput {
  id: string;
  next_id?: number | string;
  limit: number | string;
  sortBy: "SORT_DESC" | "SORT_ASC";
}

export interface TGetMessagesByIdInputV2 {
  id: string;
  prev_cursor?: number | string;
  limit: number | string;
}

export interface TGetImagesByIdInput {
  id: string;
  next_id?: number | string;
  limit: number | string;
}

export interface TGetImagesByIdInputV2 {
  id: string;
  next_id?: number | string;
  limit: number | string;
}

export interface TGetConversationByIdInput {
  id: string;
}

export interface TGetItemsUntilLastUserRoleInput {
  messages: TMessageTemp[];
}

export interface TGetTotalTokenByMessagesInput {
  messages: TMessageTemp[];
}

export interface TDeleteConversationByIdInput {
  id: string;
}

export interface TUpdateConversationNameByIdInput {
  id: string;
  name: string;
}

export interface TUpdateConversationNameByIdInputV2 {
  id: string;
  title: string;
  description?: string;
}

export type TUpdateConversationMessagesInput = ChatInputDTO & {
  id: string;
  selectedCustomResponse?: string | null;
  shouldSyncCrossPlatform?: boolean;
  useMemory?: boolean;
  convId?: string;
  readSource?: TReadSourceDTO;
};

export type TUpdateConversationMessagesWithoutVendorInput = ChatInputDTO & {
  id: string;
  sync?: TSyncDTO;
};

export interface TUpdateConversationPinByIdInput {
  id: string;
}

export interface TUpdateConversationUnPinByIdInput {
  id: string;
}

// Entities
export interface TTrimOldMessagesByToken {
  messages: TMessageTemp[];
  totalTokens: number;
}

export interface TChatDTO {
  model: string;
  messages: TMessage[];
}

export interface TConversationDTO {
  ref_id: string;
  name: string;
  last_message: string;
  pinned: boolean;
  use_case: string;
  last_active_at: string; // ISO date string
  pinned_at: string | null; // ISO date string
  updated_at: string; // ISO date string
  created_at: string; // ISO date string
  last_model: EAIValueModel;
  last_provider: EAIProviderModel;
  is_migrated: boolean;
}

export interface TGetConversationByIdDto {
  next_page_token: string;
  version: string;
  data: TConversationDTO[];
}

export interface TGetConversationByIdV2Dto {
  next_cursor: string;
  prev_cursor: string;
  has_more: boolean;
  data: TConversationDTO[];
}

export interface TMessageContentDTO {
  id: string;
  content: {
    type: EMessageContentType;
    text?: string;
    image_url?: string;
  }[];
  role: TMessageRole;
  attachments?: TAttachmentDTO[];
}

export interface TGetMessagesByIdDto {
  next_id: string;
  data: TMessageDTO2[];
}

export interface TGetMessagesByIdV2Dto {
  next_cursor: string;
  prev_cursor: string;
  has_more: boolean;
  data: TMessageDTO2[];
}

export interface TGetImagesByIdDto {
  next_id: string;
  data: TImageDTO[];
}

export interface TGetImagesByIdV2Dto {
  prev_cursor: string;
  data: TImageDTO[];
}

export interface TAttachmentDTO {
  file_id: string;
  mime_type: string;
  download_url: string;
}

export interface TFileMessageDTO {
  file_id: string;
  file_name: string;
  file_size: number;
  file_mime_type: string;
  download_url: string;
}

export interface TCitationMessageDTO {
  url: string;
  title: string;
  description: string;
  image_url: string;
}

export interface TMetaDataDeepResearchDTO {
  thinking: string;
  researching: string;
  exploring: string;
  analyzing: string;
  done: string;
}

export interface TMetadataMessageDTO {
  files?: TFileMessageDTO[];
  citations?: TCitationMessageDTO[];
  steps?: TMetaDataDeepResearchDTO;
  processing_time?: string;
  image_style?: string; // Use for image creation
}

export interface TMessageDTO2 {
  ref_id: string;
  messages: TMessageContentDTO;
  feedback_status: EMessageFeedbackStatus;
  status: string;
  models: EAIValueModel;
  provider: EAIProviderModel;
  updated_at: string;
  created_at: string;
  type: TMessageTypeSync;
  metadata: TMetadataMessageDTO | null;
  context_json: {
    schema_version: number;
    text_to_image: {
      generation_prompt: string;
      negative_prompt: string;
    };
  };
}

export interface TImageDTO {
  ref_id: string;
  url: string;
}

export interface TUpdateMessageDTO {
  id: string;
  model: string;
  choices: {
    message: {
      name: string;
      role: string;
      content: string;
    };
  }[];
  type: TMessageType;
  error: null;
  created: number;
}

export interface TCreateRegenerateMessageDTO {
  id: string;
  model: string;
  choices: {
    message: {
      name: string;
      role: string;
      content: string;
    };
  }[];
  type: TMessageType;
  error: null;
  created: number;
}

export interface TDeleteConversationByIdDTO {
  name: string;
  status: "inactive" | "active";
}

export interface TUpdateConversationNameByIdDTO {
  name: string;
  status: string;
}

export interface TUpdateConversationPinByIdDTO {
  pinned: boolean;
  pinned_at: string;
}

export interface TUpdateConversationUnPinByIdDTO {
  pinned: boolean;
}

export interface TChatConversationDTO {
  data: TMessage;
}

export interface TAnswerDTO {
  id: string;
  created: string;
  model: string;
  choices: {
    Message: TMessageDTO;
  }[];
}

export interface TMessageDTO {
  role: string;
  content: string;
}

export interface TDeepResearchMessagesDTO {
  role: string;
  content: { type: string; text: string; image_url?: { url: string } }[];
  type: TMessageType;
}

@Exclude()
export class ChatTracingDeepResearchProcessDTO {
  @Expose({ name: "processId" })
  process_id!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

export interface TTracingResponseDTO {
  data: TMessageDTO2 | null;
  failed_reason: string;
  status: TTracingStatus;
}

@Exclude()
export class ChatInputDTO {
  @Expose()
  @Transform(({ value }: { value: TMessageTemp[] }) => {
    if (!value || !Array.isArray(value)) {
      return [];
    }

    return value
      .filter((message) => !!message.content)
      .map(mapMessageTempToDto);
  })
  messages!: TMessageContentDTO[];

  @Expose()
  model?: EAIValueModel;

  @Expose()
  provider?: EAIProviderModel;

  @Expose()
  n?: string;

  @Expose()
  nsfw_check?: boolean;
}

@Exclude()
export class ChatDeepResearchDTO {
  @Expose()
  prompt!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "isRegenerate" })
  regenerate_message!: boolean;

  @Expose()
  @Transform(({ value }: { value: TMessageTemp[] }) =>
    mappingMessageTempToMessageDeepResearchDTO(value ?? [])
  )
  messages!: TDeepResearchMessagesDTO[]; // Context for deep research

  @Expose()
  sync!: TSyncDTO;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class GetCitationParamsDTO {
  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "messageId" })
  message_id!: string;
}

@Exclude()
export class ChatTextToImageDTO {
  @Expose()
  prompt!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "isRegenerate" })
  regenerate_message!: boolean;

  @Expose()
  style!: string;

  @Expose()
  model!: string;

  @Expose()
  sync!: TSyncDTO;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class ChatImageToImageDTO {
  @Expose()
  prompt!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "isRegenerate" })
  regenerate_message!: boolean;

  @Expose()
  style!: string;

  @Expose({ name: "imageIds" })
  image_ids!: string[];

  @Expose()
  model!: string;

  @Expose()
  sync!: TSyncDTO;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class ChatRegenerateImageToImageDTO {
  @Expose()
  prompt!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "isRegenerate" })
  regenerate_message!: boolean;

  @Expose()
  style!: string;

  @Expose({ name: "imageUrls" })
  image_urls!: string[];

  @Expose()
  model!: string;

  @Expose()
  sync!: TSyncDTO;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class ChatTracingImageToImageProcessDTO {
  @Expose({ name: "processId" })
  process_id!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class WebSearchDTO {
  @Expose()
  prompt!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "isRegenerate" })
  regenerate_message!: boolean;

  @Expose()
  sync!: TSyncDTO;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

@Exclude()
export class ChatPollingResultDTO {
  @Expose({ name: "processId" })
  process_id!: string;

  @Expose({ name: "conversationId" })
  conversation_id!: string;

  @Expose({ name: "readSource" })
  read_source!: TReadSourceDTO;
}

// Sync Types
export type TSyncAllowDTO =
  | "SYNC_ALLOW_UNSPECIFIED"
  | "SYNC_ALLOW_REQUEST_AND_RESPONSE"
  | "SYNC_ALLOW_RESPONSE_ONLY"
  | "SYNC_ALLOW_NONE";

export type TReadSourceDTO =
  | "READ_SOURCE_ENGINE"
  | "READ_SOURCE_CONVERSATION_NEXUS";

export interface TSyncConversationMessageFileDTO {
  filename: string;
  mime_type: string;
  data: string;
}

export interface TSyncConversationMessageDTO {
  role: TMessageRole;
  content: string;
  files: TSyncConversationMessageFileDTO[];
  message_type: string;
  client_message_id: string;
  conversation_message_id: string;
}

export interface TSyncDTO {
  client_conv_id: string;
  conversation_conv_id: string;
  sync_allow: TSyncAllowDTO;
  use_memory?: boolean;
  conversation_messages: TSyncConversationMessageDTO[];
}

export type TStopLongRunningTaskType =
  | "PROCESS_TYPE_UNSPECIFIED"
  | "PROCESS_TYPE_IMAGE_GENERATION"
  | "PROCESS_TYPE_REAL_TIME_SEARCH"
  | "PROCESS_TYPE_DEEP_RESEARCH";

export interface TStopLongRunningTaskDTO {
  process_id: string;
  type: TStopLongRunningTaskType;
  conversation_id: string;
  read_source: TReadSourceDTO;
}
