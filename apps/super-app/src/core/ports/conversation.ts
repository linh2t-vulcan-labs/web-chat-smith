import type {
  ChatDeepResearchDTO,
  ChatImageToImageDTO,
  ChatInputDTO,
  ChatPollingResultDTO,
  ChatRegenerateImageToImageDTO,
  ChatTextToImageDTO,
  ChatTracingDeepResearchProcessDTO,
  ChatTracingImageToImageProcessDTO,
  GetCitationParamsDTO,
  TChatDTO,
  TCreateAssistantTempMessagesInput,
  TCreateConversationInput,
  TCreatePredictionInput,
  TCreateRegenerateMessageInput,
  TCreateTempMessageInput,
  TDeleteConversationByIdInput,
  TGetConversationByIdInput,
  TGetConversationsInput,
  TGetConversationsInputV2,
  TGetImagesByIdInput,
  TGetImagesByIdInputV2,
  TGetItemsUntilLastUserRoleInput,
  TGetMessagesByIdInput,
  TGetMessagesByIdInputV2,
  TGetTotalTokenByMessagesInput,
  TReadSourceDTO,
  TStopLongRunningTaskDTO,
  TSyncDTO,
  TTrimOldMessagesByToken,
  TUpdateConversationMessagesInput,
  TUpdateConversationMessagesWithoutVendorInput,
  TUpdateConversationNameByIdInput,
  TUpdateConversationNameByIdInputV2,
  TUpdateConversationPinByIdInput,
  TUpdateConversationUnPinByIdInput,
  WebSearchDTO,
} from "@/core/http/dto/conversation";
import type { WebSearchChatResponseModel } from "@/core/models/chat-features/polling-process";
import type { TChatFreeUsage } from "@/core/models/usage";

import type { ImageToImageResponseModel } from "../models/chat-features/image-creation";
import type {
  ConversationModel,
  DeepResearchChatResponseModel,
  EConversationMode,
  TCitationMessage,
  TDeleteConversationById,
  TGetAssistantMessageAfterSendOptions,
  TGetConversationVersion,
  TGetImagesByConversationId,
  TGetImagesByConversationIdV2,
  TGetMessagesByConversationId,
  TMessage,
  TMessageTemp,
  TMessageType,
  TResponseGetConversations,
  TResponseGetConversationsV2,
  TSelectedAIArt,
  TSelectedFile,
  TTracingProcessResponse,
  TUpdateConversationNameById,
  TUpdateConversationPinById,
  TUpdateConversationUnPinById,
  TValidateFilesParams,
  TValidationResult,
} from "../models/conversation";
import type { TResult } from "../models/http";
import type {
  AIModel,
  CustomResponseModel,
  EAIValueModel,
} from "../models/model";

export interface TConversationRepositories {
  createTempMessage: (input: TCreateTempMessageInput) => TMessageTemp;
  createAssistantTempMessages: (
    input?: TCreateAssistantTempMessagesInput
  ) => TMessageTemp;

  getItemsUntilLastUserRole: (
    input: TGetItemsUntilLastUserRoleInput
  ) => TMessageTemp[];
  getTotalTokenByMessages: (input: TGetTotalTokenByMessagesInput) => number;
  getLastUserMessage: (messages: TMessageTemp[]) => TMessageTemp | null;
  getLastAssistantMessage: (messages: TMessageTemp[]) => TMessageTemp | null;
  getLatestUserMessageForConversationMode: (
    messages: TMessageTemp[],
    type: TMessageType
  ) => TMessageTemp | null;
  getLatestUserMessageWithType: (
    messages: TMessageTemp[],
    type: TMessageType
  ) => TMessageTemp | null;
  getLatestAssistantMessageForConversationMode: (
    messages: TMessageTemp[],
    type: TMessageType
  ) => TMessageTemp | null;
  getMessagesContextForDeepResearch: (
    messages: TMessageTemp[]
  ) => TMessageTemp[];
  getGuardValueFromMessage: (message: TMessageTemp) => keyof TChatFreeUsage;
  getGuardValueFromConversationMode: (
    conversationMode: EConversationMode
  ) => keyof TChatFreeUsage;
  getSourceAssistantMessage: (
    mode: EConversationMode,
    lastMessage?: TMessageTemp
  ) => EConversationMode | "regenerate";
  getTypeOfUserMessage: (conversationMode: EConversationMode) => TMessageType;
  getTypeOfAssistantMessage: (
    conversationMode: EConversationMode
  ) => TMessageType;
  trimOldMessagesByToken: (input: TTrimOldMessagesByToken) => TMessageTemp[];
  shouldUpdateTitle: (messages: TMessageTemp[], order?: number) => boolean;
  markLastAssistantMessageAsError: (
    messages: TMessageTemp[],
    content?: string
  ) => TMessageTemp[];
  markLastAssistantMessageAsCancelled: (
    messages: TMessageTemp[],
    content?: string
  ) => TMessageTemp[];
  updateAssistantTempMessage: (
    messages: TMessageTemp[],
    assistantMessage: TMessageTemp
  ) => TMessageTemp[];
  updateFieldForAssistantMessage: (
    messages: TMessageTemp[],
    messageId: string,
    updatedInfo: Partial<TMessageTemp>
  ) => TMessageTemp[];
  transformMessageBeforeSend: (
    messages: TMessageTemp[],
    others: Omit<ChatInputDTO, "messages">
  ) => ChatInputDTO;
  filterEmptyContentMessage: (messages: TMessageTemp[]) => TMessageTemp[];
  transformMessageForDeepResearch: (
    promptContent: TMessageTemp,
    conversationId: string,
    isRegenerate?: boolean,
    messages?: TMessageTemp[],
    sync?: TSyncDTO,
    readSource?: TReadSourceDTO
  ) => ChatDeepResearchDTO;
  generateReachedLimitTimeDeepResearch: () => string;
  transformMessageForTextToImage: (
    prompt: string,
    conversationId: string,
    aiArtStyle?: string,
    isRegenerate?: boolean,
    model?: string,
    sync?: TSyncDTO,
    readSource?: TReadSourceDTO
  ) => ChatTextToImageDTO;
  transformMessageForImageToImage: (
    promptContent: TMessageTemp,
    conversationId: string,
    imageIds: string[],
    aiArtStyle?: string,
    isRegenerate?: boolean,
    model?: string,
    sync?: TSyncDTO,
    readSource?: TReadSourceDTO
  ) => ChatImageToImageDTO;
  transformMessageForRegenerateImageToImage: (
    promptContent: TMessageTemp,
    conversationId: string,
    imageUrls: string[],
    aiArtStyle?: string,
    isRegenerate?: boolean,
    model?: string,
    sync?: TSyncDTO,
    readSource?: TReadSourceDTO
  ) => ChatRegenerateImageToImageDTO;
  transformMessageForWebSearch: (
    promptContent: TMessageTemp,
    conversationId: string,
    isRegenerate?: boolean,
    sync?: TSyncDTO,
    readSource?: TReadSourceDTO
  ) => WebSearchDTO;
  insertAdditionalInfoForAssistantMessage: (
    assistantMessage: TMessageTemp
  ) => TGetAssistantMessageAfterSendOptions;
  injectBadgeLink: (
    content: string,
    linkResolver: (index: number) => string | undefined
  ) => string;
  detectConversationProcessing: (
    conversation: ConversationModel | null
  ) => TMessageType | "";
  preprocessContentMessages: (messages: TMessageTemp[]) => TMessageTemp[];
  processExportContent: (message: TMessageTemp) => string;
  validateAIArtInput: (
    userInput: string,
    selectedFiles: TSelectedFile[],
    selectedAIArt: TSelectedAIArt
  ) => boolean;
  isModelImageToImage: (
    mode: EConversationMode,
    model: EAIValueModel
  ) => boolean;
  isDisabledFileUpload: (mode: EConversationMode) => boolean;
  validateFilesForConversation: (
    params: TValidateFilesParams
  ) => TValidationResult;
  filterErrorMessages: (messages: TMessageTemp[]) => TMessageTemp[];
}

export interface TConversationServiceAPIs {
  // Internal
  getInternalConversationInfo: (
    conversationId: string,
    userId: string
  ) => TResult<ConversationModel>;

  // Public
  createMessage: (params: TChatDTO) => TResult<TMessage>;
  createRegenerateMessage: (
    input: TCreateRegenerateMessageInput
  ) => TResult<TMessageTemp>;
  createPrediction: (input: TCreatePredictionInput) => TResult<TMessageTemp>;
  createConversationId: (
    input: TCreateConversationInput
  ) => TResult<ConversationModel>;
  createConversationIdV2: (
    input: TCreateConversationInput
  ) => TResult<ConversationModel>;
  getModels: () => TResult<AIModel[]>;
  getCustomResponse: () => TResult<CustomResponseModel>;
  getConversationVersion: () => TResult<TGetConversationVersion>;
  getConversations: (
    input: TGetConversationsInput
  ) => TResult<TResponseGetConversations>;
  getConversationsV2: (
    input: TGetConversationsInputV2
  ) => TResult<TResponseGetConversationsV2>;
  getMessagesById: (
    input: TGetMessagesByIdInput
  ) => TResult<TGetMessagesByConversationId>;
  getMessagesByIdV2: (
    input: TGetMessagesByIdInputV2
  ) => TResult<TGetMessagesByConversationId>;
  getImagesById: (
    input: TGetImagesByIdInput
  ) => TResult<TGetImagesByConversationId>;
  getImagesByIdV2: (
    input: TGetImagesByIdInputV2
  ) => TResult<TGetImagesByConversationIdV2>;
  getConversationById: (
    input: TGetConversationByIdInput
  ) => TResult<ConversationModel>;
  getConversationByIdV2: (
    input: TGetConversationByIdInput
  ) => TResult<ConversationModel>;
  deleteConversationById: (
    input: TDeleteConversationByIdInput
  ) => TResult<TDeleteConversationById>;
  deleteConversationByIdV2: (
    input: TDeleteConversationByIdInput
  ) => TResult<TDeleteConversationById>;
  updateConversationMessages: (
    input: TUpdateConversationMessagesInput,
    metadata?: { originInput: TMessageTemp[] }
  ) => TResult<TMessageTemp>;
  updateUsecaseMessages: (
    input: TUpdateConversationMessagesInput,
    metadata?: { originInput: TMessageTemp[] }
  ) => TResult<TMessageTemp>;
  updateConversationMessagesWithoutVendor: (
    input: TUpdateConversationMessagesWithoutVendorInput
  ) => TResult<object>;
  updateConversationNameById: (
    input: TUpdateConversationNameByIdInput
  ) => TResult<TUpdateConversationNameById>;
  updateConversationNameByIdV2: (
    input: TUpdateConversationNameByIdInputV2
  ) => TResult<TUpdateConversationNameById>;
  updateConversationPinById: (
    input: TUpdateConversationPinByIdInput
  ) => TResult<TUpdateConversationPinById>;
  updateConversationUnPinById: (
    input: TUpdateConversationUnPinByIdInput
  ) => TResult<TUpdateConversationUnPinById>;

  // getTracingProcess
  getChatPollingResult: (
    input: ChatPollingResultDTO
  ) => TResult<TTracingProcessResponse>;

  // Citations
  getInfoCitations: (
    input: GetCitationParamsDTO
  ) => TResult<TCitationMessage[]>;
  getInfoCitationsV2: (
    input: GetCitationParamsDTO
  ) => TResult<TCitationMessage[]>;

  // Check Latest Message
  shouldUseIndexDB: (
    conversationId: string,
    lastMessageContent: string
  ) => TResult<{ isLatest: boolean }>;

  // DeepResearch
  chatWithDeepResearch: (
    input: ChatDeepResearchDTO
  ) => TResult<DeepResearchChatResponseModel>;
  getTracingDeepResearchProgress: (
    input: ChatTracingDeepResearchProcessDTO
  ) => TResult<TTracingProcessResponse>;
  // AIArt
  chatWithTextToImage: (input: ChatTextToImageDTO) => TResult<TMessageTemp>;
  chatWithImageToImage: (
    input: ChatImageToImageDTO,
    selectedFile: TSelectedFile[],
    shouldSaveToLocalStorage?: boolean,
    model?: string
  ) => TResult<ImageToImageResponseModel>;
  regenerateImageToImage: (
    input: ChatRegenerateImageToImageDTO,
    selectedFile: TSelectedFile[],
    shouldSaveToLocalStorage?: boolean,
    model?: string
  ) => TResult<ImageToImageResponseModel>;
  getTracingImageToImageProgress: (
    input: ChatTracingImageToImageProcessDTO
  ) => TResult<TTracingProcessResponse>;

  // WebSearch
  webSearch: (input: WebSearchDTO) => TResult<WebSearchChatResponseModel>;

  postSelectedCustomResponse: (item: string) => TResult<unknown>;
  stopLongRunningTask: (input: TStopLongRunningTaskDTO) => TResult<unknown>;
}
