import type {
  TAssistantSetting,
  TAssistantWriting,
  TAssistantWritingStates,
} from "@/core/models/assistant-writing";
import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type {
  EConversationMode,
  TConversationState,
  TConversationStates,
  TMessageTemp,
  TSelectedAIArt,
  TSelectedFile,
  TUseCaseConversation,
} from "@/core/models/conversation";
import type { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import type { AIModelItem } from "@/core/models/model";

export type TFileUploadStates = Record<
  string,
  { isLoading: boolean; isError: boolean }
>;
export type TFileUploadStatus = "error" | "loading" | "normal";

export interface TInitializeConversationInput {
  userMessage: string;
  conversationMode: EConversationMode;
  assistantMessage?: string;
  selectedFiles?: TSelectedFile[];
  initialMessages?: TMessageTemp[];
  conversationId?: string;
  chatType?: "chat" | "usecase";
  isRetry?: boolean;
  imageStyle?: EAIART_STYLE;
}
export interface TInitializeConversationResponse {
  userMessage: TMessageTemp;
  assistantTempMessage: TMessageTemp;
  messages: TMessageTemp[];
}

export interface TConversationStoreState {
  isEditImage: boolean;
  isLastGroupMessage: boolean;
  isOpenUploadFileModal: boolean;
  isOpenSliderAIArt: boolean;
  isOpenImageLimitAlert: boolean;
  isOpenImageUploadNotSupportedModal: boolean;
  isOpenImageUploadNotSupportedValidationModal: boolean;
  isOpenConsentsConfirm: boolean;
  isOpenConversationSync: boolean;
  assistantWritingSettings: TAssistantSetting;
  suggestions: string[];
  selectedId: string;
  selectedModel: AIModelItem;
  selectedFiles: TSelectedFile[];
  selectedAIArt: TSelectedAIArt;
  selectedImageModel: AIModelItem;
  useCaseConversation: TUseCaseConversation;
  userInput: string;
  mode: EConversationMode;
  fileUploadStates: TFileUploadStates;
  conversationStates: TConversationStates;
  assistantWritingStates: TAssistantWritingStates;
  streamControllers: Record<string, NodeJS.Timeout | null>;
  temporaryMessageForStreaming: TMessageTemp | null;
  sessionId: string | null;
  isOpenImageModelDropdown: boolean;
}

export interface TConversationStoreAction {
  updateTempMsgById: (
    conversationId: string,
    messageId: string,
    message: TMessageTemp
  ) => void;
  setIsEditImage: (isEditImage: boolean) => void;
  setIsOpenUploadFileModal: (flag: boolean) => void;
  setIsOpenSliderAIArt: (flag: boolean) => void;
  setIsOpenImageLimitAlert: (flag: boolean) => void;
  setIsOpenImageUploadNotSupportedModal: (flag: boolean) => void;
  setIsOpenImageUploadNotSupportedValidationModal: (flag: boolean) => void;
  setIsOpenConsentsConfirm: (flag: boolean) => void;
  setAssistantWritingSettings: (
    assistantWritingSettings: TAssistantSetting
  ) => void;
  setSelectedId: (conversationId: string) => void;
  setSuggestions: (suggestions: string[]) => void;
  setSelectedModel: (model: AIModelItem) => void;
  setSelectedFiles: (files: TSelectedFile[]) => void;
  setSelectedAIArt: (selectedAIArt: TSelectedAIArt) => void;
  setSelectedImageModel: (model: AIModelItem) => void;
  setUserInput: (userInput: string) => void;
  updateSelectedFiles: (files: TSelectedFile[]) => void;
  updateFeedbackStatusMessage: (
    conversationId: string,
    messageId: string,
    status: EMessageFeedbackStatus
  ) => void;
  setUseCaseConversation: (useCaseConversation: TUseCaseConversation) => void;
  setMode: (mode: EConversationMode) => void;
  streamingMessage: (
    conversationId: string,
    originalMessage: TMessageTemp,
    speed?: number
  ) => Promise<void>;
  setConversationStates: (
    conversationId: string,
    newState: Partial<TConversationState>
  ) => void;
  setAssistantWritingStates: (
    id: string,
    newState: Partial<TAssistantWriting>
  ) => void;
  setStreamControllers: (
    conversationId: string,
    controller: NodeJS.Timeout | null
  ) => void;
  setConversationErrorState: (
    conversationId: string,
    messages: TMessageTemp[],
    content?: string
  ) => void;
  setConversationWarningState: (
    conversationId: string,
    messages: TMessageTemp[],
    content?: string
  ) => void;
  setConversationCancelledState: (
    conversationId: string,
    messages: TMessageTemp[],
    content?: string
  ) => void;
  updateFileUploadStatesByFileId: (
    fileId: string,
    states: { isLoading?: boolean; isError?: boolean }
  ) => void;
  removeFileUploadStateByFileId: (fileId: string) => void;
  stopStreamingMessages: (conversationId: string) => void;
  resetStore: (resetParams?: Partial<TConversationStoreState>) => void;
  resetDisabledStatusBasedOnMessageStatus: () => void;
  setSessionId: (requestId: string | null) => void;
  initialConversationInput: () => void;
  initializeConversation: (
    input: TInitializeConversationInput
  ) => TInitializeConversationResponse;
  checkDisabledInputBasedOnMessageStatus: () => boolean;
  setIsOpenImageModelDropdown: (isOpen: boolean) => void;
  setIsOpenConversationSync: (isOpen: boolean) => void;
}

export type TConversationStore = TConversationStoreState &
  TConversationStoreAction;

export interface FloatingUpgradeConfig {
  initialShowThreshold: number;
  showInterval: number;
  enabled: boolean;
}
