"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ContentLayout } from "@/components/content-layout";
import { ConversationInput } from "@/components/conversation-input";
import type { TConversationProps } from "@/components/conversation-types/types";
import { UploadDropzone } from "@/components/upload-drop-zone";
import { UploadTermsConsentModal } from "@/components/upload-terms-consent-modal";
import { cn } from "@/components/utils/cn";
import { INTEREST_PROMPT_OPTIONS } from "@/config/options";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { conversationUC } from "@/core/usecases";
import { useShowHomeChatAnimation } from "@/features/onboarding-popup-queue-manager/hooks";
import {
  ConversationUrlParamsProvider,
  useConversationUrlParams,
} from "@/hooks/conversations/query-params/conversation-url-params-context";
import useConversationActions from "@/hooks/conversations/use-conversation-actions";
import { useConversationFiles } from "@/hooks/conversations/use-conversation-files";
import { useDeletingConversation } from "@/hooks/conversations/use-deleting-conversation";
import useHandleDetectBananaUrl from "@/hooks/conversations/use-detect-banana-url";
import useMessagesFetching from "@/hooks/conversations/use-messages-fetching";
import { useValidateChat } from "@/hooks/usage/use-validate-chat";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { ConversationHandlerProvider } from "@/store/conversation-handler/context";
import {
  useConversationState,
  useConversationStore,
  useIsDisabledInputBasedOnMessageStatus,
} from "@/store/conversation/hooks";
import type { TFileUploadStatus } from "@/store/conversation/types";
import { useGlobalState } from "@/store/global/hooks";
import { DEFAULT_USECASE_TAB } from "@/utils/constants/conversation";
import {
  getConversationModeFromMessageType,
  getValueFromRecordFileUploadStatus,
} from "@/utils/mappers/conversations";

import ConversationContent from "../conversation-content/conversation-content";
import FloatingUpgradeBannerListener from "../conversation-content/floating-upgrade-banner-listener";
import { FloatingUpgradeBlockListener } from "../conversation-content/floating-upgrade-block-listener";
import ConversationInputWrapper from "./conversation-input-wrapper";
import type { TConversationMain, TSendMessageOptions } from "./types";
import WelcomingConversation from "./welcoming-conversation";

const InterestButtonGroup = dynamic(
  () => import("@/components/interest-button-group/interest-button-group")
);

const ConfirmModal = dynamic(
  () => import("@/components/confirm-modal/confirm-modal")
);

interface TTrackConversationSendEventParams {
  isValidPremiumUser: boolean;
  mode: EConversationMode;
  selectedCustomResponse: string | null;
  sendTrackingEvent: ReturnType<
    typeof useSendTrackingEvent
  >["sendTrackingEvent"];
  useCaseConversationValue: string;
  userId: string;
}

const trackConversationSendEvent = ({
  isValidPremiumUser,
  mode,
  selectedCustomResponse,
  sendTrackingEvent,
  useCaseConversationValue,
  userId,
}: TTrackConversationSendEventParams) => {
  if (mode === EConversationMode.DEEP_RESEARCH) {
    if (isValidPremiumUser) {
      sendTrackingEvent({
        name: EventKeys.ChatDeepResearchSend,
        payload: { vulcan_user_id: userId },
      });
      return;
    }

    sendTrackingEvent({
      name: EventKeys.ChatDeepResearchFreeUserTry,
      payload: { vulcan_user_id: userId },
    });
    return;
  }

  if (mode === EConversationMode.AI_ART) {
    if (!isValidPremiumUser) {
      return;
    }

    sendTrackingEvent({
      name: EventKeys.ChatArtSend,
      payload: { vulcan_user_id: userId },
    });
    return;
  }

  if (mode === EConversationMode.WEB_SEARCH) {
    if (!isValidPremiumUser) {
      return;
    }

    sendTrackingEvent({
      name: EventKeys.ChatWebSearchSend,
      payload: { vulcan_user_id: userId },
    });
    return;
  }

  if (mode === EConversationMode.CHAT) {
    const isTrackingCustomResponse =
      Boolean(selectedCustomResponse) && !useCaseConversationValue;
    const payload: {
      vulcan_style?: string;
      vulcan_type: string;
      vulcan_user_id: string;
    } = {
      vulcan_type: isTrackingCustomResponse
        ? "normal_chat"
        : useCaseConversationValue || "normal_chat",
      vulcan_user_id: userId,
    };

    if (isTrackingCustomResponse) {
      payload.vulcan_style = selectedCustomResponse ?? undefined;
    }

    sendTrackingEvent({
      name: EventKeys.ChatSend,
      payload,
    });
  }
};

interface THandleSendMessageContext {
  conversationMode: EConversationMode;
  conversationStore: ReturnType<typeof useConversationStore>;
  handleCreateConversation: (params: {
    mode: EConversationMode;
    prompt: string;
    type: "chat" | "usecase";
  }) => Promise<unknown>;
  handleCreateConversationWithQuestions: (
    userInput: string,
    promptTemplate: string
  ) => Promise<unknown>;
  handleUpdateConversation: (params: {
    mode: EConversationMode;
    prompt: string;
  }) => Promise<unknown>;
  handleValidateChat: ReturnType<typeof useValidateChat>["handleValidateChat"];
  initialConversationInput: () => void;
  isEditImage: boolean;
  selectedFilesCount: number;
  selectedId: string;
  selectedModel: { isAllowChatVision: boolean };
  setIsEditImage: (value: boolean) => void;
  trackSendEvent: (mode: EConversationMode) => void;
  useCaseConversation: {
    isUseCase: boolean;
    promptTemplate: string;
  };
}

const handleSendMessageWithContext = async (
  { mode, userInput }: TSendMessageOptions,
  {
    conversationMode,
    conversationStore,
    handleCreateConversation,
    handleCreateConversationWithQuestions,
    handleUpdateConversation,
    handleValidateChat,
    initialConversationInput,
    isEditImage,
    selectedFilesCount,
    selectedId,
    selectedModel,
    setIsEditImage,
    trackSendEvent,
    useCaseConversation,
  }: THandleSendMessageContext
) => {
  const currentMessages =
    conversationStore.getState().conversationStates[selectedId]?.messages ?? [];
  const isAIArtMode = mode === EConversationMode.AI_ART;
  const isModelUnsupported = !selectedModel.isAllowChatVision;

  if (isModelUnsupported && selectedFilesCount > 0 && !isAIArtMode) {
    toast.error(null, {
      description: "Model doesn't support file upload",
    });
    return;
  }

  const isNotValidChat = handleValidateChat({
    conversationMode: mode,
    messages: currentMessages,
  });

  trackSendEvent(mode);

  if (isNotValidChat) {
    return;
  }

  initialConversationInput();

  if (useCaseConversation.isUseCase) {
    await handleCreateConversationWithQuestions(
      userInput,
      useCaseConversation.promptTemplate
    );
    return;
  }

  if (!selectedId) {
    await handleCreateConversation({
      mode,
      prompt: userInput,
      type: "chat",
    });
    return;
  }

  await handleUpdateConversation({ mode, prompt: userInput });

  if (isEditImage && conversationMode === EConversationMode.AI_ART) {
    setIsEditImage(false);
  }
};

interface THandleSubmitContext {
  conversationMode: EConversationMode;
  handleSendMessage: (options: TSendMessageOptions) => Promise<void>;
  isAiArtValidToSubmit: boolean;
  isConsentAccepted: boolean;
  isDisabledAIArt: boolean;
  isInvalidToGenerateWithUploadedImage: boolean;
  selectedFilesCount: number;
  setIsOpenConsentsConfirm: (value: boolean) => void;
  setIsOpenImageLimitAlert: (value: boolean) => void;
  setIsOpenImageUploadNotSupportedModal: (value: boolean) => void;
  setIsShowConfirmAIArtModal: (value: boolean) => void;
  userInput: string;
}

const handleSubmitWithContext = async (
  consentAccepted: boolean,
  {
    conversationMode,
    handleSendMessage,
    isAiArtValidToSubmit,
    isConsentAccepted,
    isDisabledAIArt,
    isInvalidToGenerateWithUploadedImage,
    selectedFilesCount,
    setIsOpenConsentsConfirm,
    setIsOpenImageLimitAlert,
    setIsOpenImageUploadNotSupportedModal,
    setIsShowConfirmAIArtModal,
    userInput,
  }: THandleSubmitContext
) => {
  if (isAiArtValidToSubmit) {
    setIsShowConfirmAIArtModal(true);
    return;
  }

  if (isInvalidToGenerateWithUploadedImage) {
    setIsOpenImageUploadNotSupportedModal(true);
    return;
  }

  if (isDisabledAIArt) {
    setIsOpenImageLimitAlert(true);
    return;
  }

  const isValidConsentAccepted = isConsentAccepted || consentAccepted;
  if (!isValidConsentAccepted && selectedFilesCount > 0) {
    setIsOpenConsentsConfirm(true);
    return;
  }

  await handleSendMessage({ mode: conversationMode, userInput });
};

const shouldSendNewHomepageViewEvent = ({
  hasMessages,
  isConversationHome,
  isEventSent,
  userId,
}: {
  hasMessages: boolean;
  isConversationHome: boolean;
  isEventSent: boolean;
  userId: string;
}) => Boolean(userId) && isConversationHome && !hasMessages && !isEventSent;

interface THandleTaskParamFromUrlContext {
  conversationMode: EConversationMode;
  handleCreateConversation: ReturnType<
    typeof useConversationActions
  >["handleCreateConversation"];
  handleValidateChat: ReturnType<typeof useValidateChat>["handleValidateChat"];
  initialConversationInput: () => void;
  messages: ReturnType<typeof useConversationActions>["messages"];
  setConversationStates: ReturnType<
    typeof useConversationActions
  >["setConversationStates"];
  setTaskParams: ReturnType<typeof useConversationUrlParams>["setTaskParams"];
  setUseCaseConversation: ReturnType<
    typeof useConversationActions
  >["setUseCaseConversation"];
  useCaseConversation: ReturnType<
    typeof useConversationActions
  >["useCaseConversation"];
}

const isInterestPromptOptionKey = (
  key: string
): key is keyof typeof INTEREST_PROMPT_OPTIONS =>
  key in INTEREST_PROMPT_OPTIONS;

const handleTaskParamFromUrlWithContext = (
  key: string,
  {
    conversationMode,
    handleCreateConversation,
    handleValidateChat,
    initialConversationInput,
    messages,
    setConversationStates,
    setTaskParams,
    setUseCaseConversation,
    useCaseConversation,
  }: THandleTaskParamFromUrlContext
) => {
  const { question, promptTemplate } = isInterestPromptOptionKey(key)
    ? INTEREST_PROMPT_OPTIONS[key]
    : { promptTemplate: "", question: [] };

  if (!question?.length && !promptTemplate) {
    setTaskParams(null);
    return;
  }

  initialConversationInput();
  const isNotValidChat = handleValidateChat({
    conversationMode,
    messages,
  });

  if (isNotValidChat) {
    return;
  }

  if (!question) {
    setUseCaseConversation({
      ...useCaseConversation,
      value: key,
    });
    void handleCreateConversation({
      mode: conversationMode,
      prompt: promptTemplate,
      type: "usecase",
    });
    return;
  }

  const assistantMessage = conversationUC.createAssistantTempMessages({
    models: EAIValueModel.None,
    prompt: question[0],
    status: "idle",
  });

  setConversationStates("", {
    messages: [...messages, assistantMessage],
    status: "idle",
  });

  setUseCaseConversation({
    isUseCase: true,
    promptTemplate,
    questions: question.slice(1),
    value: key,
  });
};

interface THandleClickSuggestionContext {
  handleSendMessage: (options: TSendMessageOptions) => Promise<void>;
  hasUploadFileIssue: boolean;
  sendTrackingEvent: ReturnType<
    typeof useSendTrackingEvent
  >["sendTrackingEvent"];
  setConversationMode: (mode: EConversationMode) => void;
  setUserInput: ReturnType<typeof useConversationActions>["setUserInput"];
  userId: string;
}

const handleClickSuggestionWithContext = (
  message: string,
  {
    handleSendMessage,
    hasUploadFileIssue,
    sendTrackingEvent,
    setConversationMode,
    setUserInput,
    userId,
  }: THandleClickSuggestionContext
) => {
  if (userId) {
    sendTrackingEvent({
      name: EventKeys.NewSuggestionsClick,
      payload: { vulcan_user_id: userId },
    });
  }

  if (hasUploadFileIssue) {
    setUserInput(message);
    return;
  }

  void handleSendMessage({
    mode: EConversationMode.CHAT,
    userInput: message,
  });
  setConversationMode(EConversationMode.CHAT);
};

const trackInputChatClickWithContext = ({
  eventSentRef,
  sendTrackingEvent,
  userId,
}: {
  eventSentRef: React.MutableRefObject<boolean>;
  sendTrackingEvent: ReturnType<
    typeof useSendTrackingEvent
  >["sendTrackingEvent"];
  userId: string;
}) => {
  if (!userId || eventSentRef.current) {
    return;
  }

  eventSentRef.current = true;
  sendTrackingEvent({
    name: EventKeys.NewInputchatClick,
    payload: { vulcan_user_id: userId },
  });
};

const handleRegenerateWithValidContext = async ({
  conversationMode,
  handleRegenerateMessage,
  handleValidateChat,
  messages,
}: {
  conversationMode: EConversationMode;
  handleRegenerateMessage: ReturnType<
    typeof useConversationActions
  >["handleRegenerateMessage"];
  handleValidateChat: ReturnType<typeof useValidateChat>["handleValidateChat"];
  messages: ReturnType<typeof useConversationActions>["messages"];
}) => {
  const latestMessage = messages.at(-1);
  if (!latestMessage) {
    return;
  }
  const guardCheck = conversationUC.getGuardValueFromMessage(latestMessage);

  const isNotValidChat = handleValidateChat({
    conversationMode,
    guardCheck,
    isRegenerate: true,
    messages,
  });

  if (isNotValidChat) {
    return;
  }

  await handleRegenerateMessage();
};

const handleRetrySendMessageWithContext = async ({
  conversationMode,
  handleSendMessage,
  messages,
}: {
  conversationMode: EConversationMode;
  handleSendMessage: (options: TSendMessageOptions) => Promise<void>;
  messages: ReturnType<typeof useConversationActions>["messages"];
}) => {
  const latestUserMessage = conversationUC.getLastUserMessage(messages);
  if (!latestUserMessage) {
    return;
  }

  await handleSendMessage({
    mode: conversationMode,
    userInput: latestUserMessage.content,
  });
};

/**
 * Internal component that contains the main conversation logic
 * Must be wrapped with ConversationUrlParamsProvider
 */
// eslint-disable-next-line complexity
function ConversationMainContent({
  id,
  isHome: isConversationHome = false,
}: Readonly<TConversationMain>) {
  // Global
  const {
    metadata: { interest: interestValues },
  } = useGlobalState((state) => state.onboarding);
  const user = useGlobalState((state) => state.user);
  const selectedCustomResponse = useGlobalState(
    (state) => state.selectedCustomResponse
  );
  const { isOpen: isShowHomeChatAnimation } = useShowHomeChatAnimation();

  // Conversation state
  const isOpenUploadFileModal = useConversationState(
    (state) => state.isOpenUploadFileModal
  );
  const isOpenConsentsConfirm = useConversationState(
    (state) => state.isOpenConsentsConfirm
  );
  const isEditImage = useConversationState((state) => state.isEditImage);
  const isOpenImageUploadNotSupportedModal = useConversationState(
    (state) => state.isOpenImageUploadNotSupportedModal
  );
  const selectedId = useConversationState((state) => state.selectedId);
  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const conversationMode = useConversationState((state) => state.mode);
  const initialConversationInput = useConversationState(
    (state) => state.initialConversationInput
  );
  const setSelectedId = useConversationState((state) => state.setSelectedId);
  const setIsOpenUploadFileModal = useConversationState(
    (state) => state.setIsOpenUploadFileModal
  );
  const setIsEditImage = useConversationState((state) => state.setIsEditImage);
  const setIsOpenImageLimitAlert = useConversationState(
    (state) => state.setIsOpenImageLimitAlert
  );
  const setIsOpenConsentsConfirm = useConversationState(
    (state) => state.setIsOpenConsentsConfirm
  );
  const setIsOpenImageUploadNotSupportedModal = useConversationState(
    (state) => state.setIsOpenImageUploadNotSupportedModal
  );
  const setIsOpenImageModelDropdown = useConversationState(
    (state) => state.setIsOpenImageModelDropdown
  );
  const setConversationMode = useConversationState((state) => state.setMode);
  const setConversationCancelledState = useConversationState(
    (state) => state.setConversationCancelledState
  );
  const isDisabledInputBasedOnMessageStatus =
    useIsDisabledInputBasedOnMessageStatus();
  const fileUploadStates = useConversationState(
    (state) => state.fileUploadStates
  );
  const conversationStore = useConversationStore();

  // Others
  const [defaultTab, setDefaultTab] = useState(DEFAULT_USECASE_TAB);
  const [isOpenUseCaseListModal, setIsOpenUseCaseListModal] = useState(false);
  const [isShowConfirmAIArtModal, setIsShowConfirmAIArtModal] = useState(false);
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  const {
    isLoading,
    isLoadingConversation,
    isFetchNextPageError,
    isFetchMessageError,
    isFetchedMessages,
    messages: initialMessages,
    hasNextPage,
    conversationInfo,
    isFetchingNextPage,
    stopTracing,
    refetchMessages,
    fetchNextPageConversation,
  } = useMessagesFetching({ id });
  const {
    status,
    userInput,
    useCaseConversation,
    suggestions,
    messages,
    setUseCaseConversation,
    setConversationStates,
    setUserInput,
    handleCreateConversation,
    handleUpdateConversation,
    handleRegenerateMessage,
    handleCreateConversationWithQuestions,
    // scroll messages
    lastMessageRef,
    lastItemRef,
    setScrollContainerZone,
  } = useConversationActions({
    convId: conversationInfo?.conversationConvId,
    id,
    initialMessages,
  });
  const {
    selectedFiles,
    acceptFiles,
    maxFiles,
    maxSizeInMB,
    fileUploadContent,
    onFiles,
  } = useConversationFiles();
  const isConsentAccepted = Boolean(
    user.consents?.uploadTermsConsent?.actionContext
  );

  const { sendTrackingEvent } = useSendTrackingEvent();
  const newHomepageViewSentRef = useRef(false);
  const newInputChatClickSentRef = useRef(false);
  const { checkDeletingConversation } = useDeletingConversation();
  const isDeletingCurrentConversation = id
    ? checkDeletingConversation(id)
    : false;

  const isError = status === "error";
  const isPendingConversationInput =
    status === "loading" ||
    status === "polling" ||
    isDeletingCurrentConversation;
  const isDisabledAIArt =
    conversationMode === EConversationMode.AI_ART &&
    selectedFiles.length > selectedAIArt.maxImages;
  const hasMessages = messages?.length > 0 || !!id;
  const isFileUploadDisabled =
    conversationUC.isDisabledFileUpload(conversationMode);

  const isShowButtonUseCaseGroup =
    !hasMessages && conversationMode === EConversationMode.CHAT;

  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const { isValidPremiumUser } = userSubscriptionInfo;

  const { handleValidateChat } = useValidateChat();

  const isBananaRoute = useHandleDetectBananaUrl();

  // This hook must be called within ConversationUrlParamsProvider
  const { setTaskParams, registerTaskParamHandler } =
    useConversationUrlParams();

  const fileUploadStatus: TFileUploadStatus = useMemo(
    () => getValueFromRecordFileUploadStatus(fileUploadStates),
    [fileUploadStates]
  );

  const hasUploadFileIssue = ["error", "loading"].includes(fileUploadStatus);

  const handleStopGenerating = useCallback(async () => {
    const currentProcessId =
      conversationStore.getState().conversationStates[selectedId]?.processId;
    const messageType = conversationInfo?.longPollingProcess?.type;
    if (currentProcessId) {
      const currentConvMode =
        getConversationModeFromMessageType(messageType) || conversationMode;
      await stopTracing(
        selectedId,
        currentProcessId,
        currentConvMode as EConversationMode
      );
    }

    setConversationCancelledState(
      selectedId,
      messages ?? [],
      conversationT("messageAnswersSkipped")
    );
  }, [
    conversationInfo,
    conversationMode,
    conversationStore,
    conversationT,
    messages,
    selectedId,
    setConversationCancelledState,
    stopTracing,
  ]);

  const handleToggleUseCaseModal = () => {
    setIsOpenUseCaseListModal(!isOpenUseCaseListModal);
  };

  const handleClickCategory = (category: string) => {
    setDefaultTab(category);
    handleToggleUseCaseModal();
    // Tracking UseCaseView
    sendTrackingEvent({
      name: EventKeys.UseCaseView,
      payload: {
        sub_task: "",
        task: category,
        vulcan_user_id: user.id,
      },
    });
  };

  /**
   * Handles use case selection from URL (page refresh/load).
   * This is called automatically by the centralized URL params hook.
   */
  const handleTaskParamFromUrl = useCallback(
    (key: string) => {
      handleTaskParamFromUrlWithContext(key, {
        conversationMode,
        handleCreateConversation,
        handleValidateChat,
        initialConversationInput,
        messages,
        setConversationStates,
        setTaskParams,
        setUseCaseConversation,
        useCaseConversation,
      });
    },
    [
      conversationMode,
      messages,
      useCaseConversation,
      initialConversationInput,
      handleValidateChat,
      setUseCaseConversation,
      handleCreateConversation,
      setConversationStates,
      setTaskParams,
    ]
  );

  /**
   * Handles use case selection from user interaction (button click).
   * Also syncs the selection to URL params.
   */
  const handleSelectUseCaseList = (key: string) => {
    const { question, promptTemplate } = isInterestPromptOptionKey(key)
      ? INTEREST_PROMPT_OPTIONS[key]
      : { promptTemplate: "", question: [] };

    if (!question?.length && !promptTemplate) {
      setTaskParams(null);
      return;
    }

    handleToggleUseCaseModal();

    // Sync to URL
    setTaskParams(key);

    // Execute the use case selection
    handleTaskParamFromUrl(key);
  };

  const handleTrackSendEvent = useCallback(
    (mode: EConversationMode) => {
      trackConversationSendEvent({
        isValidPremiumUser,
        mode,
        selectedCustomResponse,
        sendTrackingEvent,
        useCaseConversationValue: useCaseConversation.value,
        userId: user.id,
      });
    },
    [
      isValidPremiumUser,
      selectedCustomResponse,
      sendTrackingEvent,
      useCaseConversation.value,
      user.id,
    ]
  );

  const handleSendMessage = async ({
    userInput,
    mode,
  }: TSendMessageOptions) => {
    await handleSendMessageWithContext(
      { mode, userInput },
      {
        conversationMode,
        conversationStore,
        handleCreateConversation,
        handleCreateConversationWithQuestions,
        handleUpdateConversation,
        handleValidateChat,
        initialConversationInput,
        isEditImage,
        selectedFilesCount: selectedFiles.length,
        selectedId,
        selectedModel,
        setIsEditImage,
        trackSendEvent: handleTrackSendEvent,
        useCaseConversation,
      }
    );
  };

  const isImageOptionalAIArt =
    selectedImageModel.value === EAIValueModel.chatsmith ||
    selectedAIArt.value === EAIART_STYLE.NONE;

  const isAiArtValidToSubmit =
    conversationMode === EConversationMode.AI_ART &&
    !isImageOptionalAIArt &&
    selectedFiles.length === 0;

  const isInvalidToGenerateWithUploadedImage =
    conversationMode === EConversationMode.AI_ART &&
    selectedImageModel.value === EAIValueModel.chatsmith &&
    selectedFiles.length > 0;

  const handleClickSuggestion = (message: string) => {
    handleClickSuggestionWithContext(message, {
      handleSendMessage,
      hasUploadFileIssue,
      sendTrackingEvent,
      setConversationMode,
      setUserInput,
      userId: user.id,
    });
  };

  const handleInputChatPointerDownCapture = () => {
    trackInputChatClickWithContext({
      eventSentRef: newInputChatClickSentRef,
      sendTrackingEvent,
      userId: user.id,
    });
  };

  const handleOpenImageUploadNotSupportedModel = () => {
    setIsOpenImageUploadNotSupportedModal(true);
  };

  const handleProceedAIArtModal = () => {
    setIsShowConfirmAIArtModal(false);
    setIsOpenUploadFileModal(true);
  };

  const handleForceOpenImageModelDropdown = () => {
    setIsOpenImageUploadNotSupportedModal(false);
    setIsOpenImageModelDropdown(true);
  };

  const handleSubmit = async (consentAccepted = false) => {
    await handleSubmitWithContext(consentAccepted, {
      conversationMode,
      handleSendMessage,
      isAiArtValidToSubmit,
      isConsentAccepted,
      isDisabledAIArt,
      isInvalidToGenerateWithUploadedImage,
      selectedFilesCount: selectedFiles.length,
      setIsOpenConsentsConfirm,
      setIsOpenImageLimitAlert,
      setIsOpenImageUploadNotSupportedModal,
      setIsShowConfirmAIArtModal,
      userInput,
    });
  };

  const handleRegenerateWithValid = async () => {
    await handleRegenerateWithValidContext({
      conversationMode,
      handleRegenerateMessage,
      handleValidateChat,
      messages,
    });
  };
  const handleRetrySendMessage = async () => {
    await handleRetrySendMessageWithContext({
      conversationMode,
      handleSendMessage,
      messages,
    });
  };

  const conversationHandlers: TConversationProps["handlers"] = {
    onClickSuggestion: handleClickSuggestion,
    onFetchNextPage: fetchNextPageConversation,
    onRefetchMessages: refetchMessages,
    onRegenerateMessage: handleRegenerateWithValid,
    setScrollContainerZone,
  };

  const conversationStates: TConversationProps["states"] = {
    conversationMode,
    hasNextPage,
    isFetchMessageError,
    isFetchNextPageError,
    isFetchedMessages,
    isFetchingNextPage,
    isLoading: isLoading || isLoadingConversation,
    status,
  };

  const conversationRefs: TConversationProps["refs"] = {
    lastItemRef,
    lastMessageRef,
  };

  const conversationData: TConversationProps["data"] = {
    messages,
    suggestions,
  };

  useEffect(() => {
    setSelectedId(id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!user.id) {
      newHomepageViewSentRef.current = false;
      newInputChatClickSentRef.current = false;
      return;
    }

    const canSendNewHomepageView = shouldSendNewHomepageViewEvent({
      hasMessages,
      isConversationHome,
      isEventSent: newHomepageViewSentRef.current,
      userId: user.id,
    });

    if (!canSendNewHomepageView) {
      newHomepageViewSentRef.current = false;
      return;
    }

    newHomepageViewSentRef.current = true;
    sendTrackingEvent({
      name: EventKeys.NewHomepageView,
      payload: { vulcan_user_id: user.id },
    });
  }, [user.id, isConversationHome, hasMessages, sendTrackingEvent]);

  // Handle enable AI Art mode when mode param is QUERY_PARAM_BANANA
  const handleRedirectToAiArt = useCallback(() => {
    setConversationMode(EConversationMode.AI_ART);
  }, [setConversationMode]);

  useEffect(() => {
    if (isBananaRoute) {
      handleRedirectToAiArt();
    }
  }, [isBananaRoute, handleRedirectToAiArt]);

  // Register the task param handler with the centralized URL params hook
  // This allows the hook to call our handler when task params change from URL
  useEffect(() => {
    registerTaskParamHandler(handleTaskParamFromUrl);
  }, [registerTaskParamHandler, handleTaskParamFromUrl]);

  const isShowLayoutChat = !isConversationHome || hasMessages;
  const isShowLayoutHome = !isShowLayoutChat;

  return (
    <ContentLayout>
      <UploadDropzone
        className="flex size-full flex-col"
        acceptFiles={acceptFiles}
        maxFiles={maxFiles}
        maxSizeInMB={maxSizeInMB}
        fileUploadContent={fileUploadContent}
        onFilesSelected={onFiles}
        isDisabled={
          isOpenUploadFileModal ||
          isFileUploadDisabled ||
          isDisabledInputBasedOnMessageStatus
        }
      >
        <ConversationHandlerProvider
          value={{
            handleRegenerate: handleRegenerateWithValid,
            handleRetrySend: handleRetrySendMessage,
          }}
        >
          <div className="flex size-full flex-col justify-between">
            <div
              className={cn("flex-1 overflow-hidden", {
                hidden: isShowLayoutHome,
              })}
            >
              <ConversationContent
                states={conversationStates}
                data={conversationData}
                refs={conversationRefs}
                handlers={conversationHandlers}
              />
            </div>

            {!isError && (
              <ConversationInputWrapper isConversationHome={isShowLayoutHome}>
                {/* Floating Upgrade Block */}
                {selectedId && hasMessages && (
                  <>
                    <FloatingUpgradeBannerListener
                      containerClassname="w-full pb-medium-1.5 max-w-(--breakpoint-md) mx-auto block md:hidden"
                      floatingClassname="w-full!"
                    />
                    <FloatingUpgradeBlockListener />
                  </>
                )}

                <div
                  className="w-full"
                  onPointerDownCapture={handleInputChatPointerDownCapture}
                >
                  <ConversationInput
                    enableEnterPress
                    userInput={userInput}
                    isLoading={status === "polling"}
                    isPending={isPendingConversationInput}
                    onSubmit={handleSubmit}
                    onStopGenerating={handleStopGenerating}
                    onPaste={onFiles}
                    onOpenImageUploadNotSupportedModel={
                      handleOpenImageUploadNotSupportedModel
                    }
                  />
                </div>
                {isShowButtonUseCaseGroup && (
                  <InterestButtonGroup
                    isOpenUseCaseListModal={isOpenUseCaseListModal}
                    defaultTab={defaultTab}
                    interestValues={interestValues}
                    onSelect={handleSelectUseCaseList}
                    onClickCategory={handleClickCategory}
                    onClose={handleToggleUseCaseModal}
                  />
                )}
                <WelcomingConversation
                  className="md:mt-v1-structural-section-large mt-v1-structural-content-relaxed"
                  shouldShowWelcome={!hasMessages && isShowHomeChatAnimation}
                  exitsMessage={hasMessages}
                />
              </ConversationInputWrapper>
            )}
          </div>
          {isShowConfirmAIArtModal && (
            <ConfirmModal
              title={conversationT("modal.imageRequired.title")}
              description={conversationT("modal.imageRequired.desc")}
              proceedText={commonT("cta.uploadPhoto")}
              closeText={commonT("cta.cancel")}
              className="w-full md:w-[426px]"
              open={isShowConfirmAIArtModal}
              onClose={() => setIsShowConfirmAIArtModal(false)}
              onProceed={handleProceedAIArtModal}
            />
          )}
          {isOpenImageUploadNotSupportedModal && (
            <ConfirmModal
              title={conversationT("modal.uploadNotSupport.title")}
              description={conversationT("modal.uploadNotSupport.desc")}
              proceedText={commonT("cta.gotIt")}
              showCloseButton={false}
              className="w-full md:w-[330px]"
              open={isOpenImageUploadNotSupportedModal}
              onClose={handleForceOpenImageModelDropdown}
              onProceed={handleForceOpenImageModelDropdown}
            />
          )}
          {isOpenConsentsConfirm && (
            <UploadTermsConsentModal
              open={isOpenConsentsConfirm}
              onSuccess={() => {
                setIsOpenConsentsConfirm(false);
                handleSubmit(true);
              }}
              conversationMode={conversationMode}
              onClose={() => setIsOpenConsentsConfirm(false)}
            />
          )}
        </ConversationHandlerProvider>
      </UploadDropzone>
    </ContentLayout>
  );
}

/**
 * Wrapper component that provides URL params context with task handler.
 * This ensures useConversationUrlParams can be called within ConversationMainContent.
 * The task handler is passed to centralize URL param processing logic.
 */
export default function ConversationMain({
  id,
  isHome = false,
}: Readonly<TConversationMain>) {
  return (
    <ConversationUrlParamsProvider>
      <ConversationMainContent id={id} isHome={isHome} />
    </ConversationUrlParamsProvider>
  );
}
