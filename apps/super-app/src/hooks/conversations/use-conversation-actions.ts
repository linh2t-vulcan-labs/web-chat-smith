import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type {
  TGetAssistantMessageAfterSendOptions,
  TMessageTemp,
} from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useChatImageCreation } from "@/hooks/image-creation/use-chat-image-creation";
import { useFreeUsageTracker } from "@/hooks/usage/use-free-usage-tracker";
import { useHandleChatWebSearch } from "@/hooks/web-search/use-handle-chat-web-search";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@/libs/react-query";
import { invalidateWithIntervals } from "@/libs/react-query/utils";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import type { THttpError } from "@/utils/commons/error";
import {
  generateRandomUUIDV4,
  localStorageImpl,
} from "@/utils/commons/helpers";
import {
  HAS_SEEN_CHAT_SYNC_ALERT,
  OPEN_SUGGESTIONS_KEY,
} from "@/utils/commons/keys";
import { formattedTitle } from "@/utils/commons/string";
import {
  defaultConversationState,
  ENABLED_SUGGESTION_MESSAGE_TYPE,
  SUMMARY_TITLE_PROMPT,
} from "@/utils/constants/conversation";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";
import { HTTP_STATUS } from "@/utils/constants/http";

import { useHandleChatDeepResearch } from "../deep-research/use-handle-chat-deep-research";
import { useConversationScroll } from "../use-conversation-scroll";
import useLocalStorage from "../use-local-storage";
import { useCreateId } from "./use-create-id";
import { useCreatePrediction } from "./use-create-prediction";
import { useCreateUseCases } from "./use-create-usecases";
import { useEditTitleConversation } from "./use-edit-title-conversation";
import { getConversationsQueryKey } from "./use-get-conversations";
import { useHandleSuggestionMessages } from "./use-handle-suggestion-messages";
import { useMemoryUsedFlag } from "./use-memory-used-flag";
import { useRegenerateMessage } from "./use-regenerate-message";
import { useUpdateConversation } from "./use-update-conversation";

export interface TConversationActions {
  id?: string;
  convId?: string;
  initialMessages: TMessageTemp[];
}

export interface THandleCreateConversationOptions {
  prompt: string;
  type: "usecase" | "chat";
  mode: EConversationMode;
}

export interface THandleUpdateConversationOptions {
  prompt: string;
  mode: EConversationMode;
}

export interface THandleGetAssistantMessageAfterSendOptions {
  source: EConversationMode | "regenerate";
  conversationId: string;
  convId?: string; // conversationConvId (sync field)
  messages: TMessageTemp[];
  selectedImageModelValue?: string;
  options?: TGetAssistantMessageAfterSendOptions;
  type?: "usecase" | "chat";
}

function useConversationActions({
  id,
  convId,
  initialMessages,
}: TConversationActions) {
  const queryClient = useQueryClient();
  const conversationT = useTranslations("conversationPage");
  const router = useRouter();

  // Conversation Store
  const conversationStore = useConversationStore();
  // Conversation state
  const userInput = useConversationState((state) => state.userInput);
  const selectedModel = useConversationState((state) => state.selectedModel);
  const selectedId = useConversationState((state) => state.selectedId);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const suggestions = useConversationState((state) => state.suggestions);
  const conversationStates = useConversationState(
    (state) => state.conversationStates
  );
  const useCaseConversation = useConversationState(
    (state) => state.useCaseConversation
  );
  const conversationMode = useConversationState((state) => state.mode);

  const setSelectedId = useConversationState((state) => state.setSelectedId);
  const streamingMessage = useConversationState(
    (state) => state.streamingMessage
  );
  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const setUseCaseConversation = useConversationState(
    (state) => state.setUseCaseConversation
  );
  const setUserInput = useConversationState((state) => state.setUserInput);
  const initializeConversation = useConversationState(
    (state) => state.initializeConversation
  );
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );
  const setSessionId = useConversationState((state) => state.setSessionId);
  const setIsOpenConversationSync = useConversationState(
    (state) => state.setIsOpenConversationSync
  );
  // Chat sync
  const { isBeta: enabledChatSync, isPersistenceEnabled } = useChatSyncFlag();
  // Memory
  const { isEnable: enabledMemoryUsed } = useMemoryUsedFlag();
  // API Mutations
  const createIdMutation = useCreateId();
  const updateConversationMutation = useUpdateConversation();
  const regenerateMessageMutation = useRegenerateMessage();
  const createUseCasesMutation = useCreateUseCases();
  const createPredictionMutation = useCreatePrediction();
  const editTitleConversationMutation = useEditTitleConversation();

  const { handleStartChatImageCreation } = useChatImageCreation();
  const { handleStartChatWebSearch } = useHandleChatWebSearch();

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  // Others
  const [isShowSuggestions] = useLocalStorage(OPEN_SUGGESTIONS_KEY, true);
  const conversationId = id ?? selectedId;
  const conversation =
    conversationStates[conversationId] || defaultConversationState;
  const conversationConvId = convId || conversation.convId;
  const { status } = conversation;
  const { messages } = conversation;

  const { consumeFreeChat } = useFreeUsageTracker();
  const { handleSuggestion } = useHandleSuggestionMessages();
  const { handleStartChatDeepResearch } = useHandleChatDeepResearch();

  const {
    lastMessageRef,
    setScrollContainerZone,
    lastItemRef,
    scrollToBottom,
    setIsShouldAutoScroll,
  } = useConversationScroll(
    messages,
    status === "loading" || status === "polling",
    status === "generating",
    selectedId
  );

  const isEnabledSuggestion = (
    newSessionId: string,
    latestMessage: TMessageTemp
  ) =>
    isShowSuggestions &&
    conversationStore.getState().sessionId === newSessionId &&
    ENABLED_SUGGESTION_MESSAGE_TYPE.includes(latestMessage.type);

  const handleQuestionExists = (prompt: string) => {
    const userMessage = conversationUC.createTempMessage({
      files: selectedFiles,
      prompt,
      role: "user",
      type: "chat",
    });
    const assistantMessage = conversationUC.createAssistantTempMessages({
      models: EAIValueModel.None,
      prompt: useCaseConversation.questions[0] ?? "",
      status: "idle",
    });

    // Add user prompt & question for assistant
    setConversationStates("", {
      ...conversation,
      messages: [...initialMessages, userMessage, assistantMessage],
    });

    // Remove question from list
    setUseCaseConversation({
      ...useCaseConversation,
      questions: useCaseConversation.questions.slice(1),
    });
  };

  const handleSummaryConversation = async (
    id: string,
    messages: TMessageTemp[]
  ) => {
    const data = await createPredictionMutation
      .mutateAsync({
        messages,
        model: selectedModel.value,
        promptTemplate: SUMMARY_TITLE_PROMPT,
      })
      .catch(() => {
        setConversationErrorState(id, messages);
        return null;
      });

    if (!data) {
      return;
    }

    const name = formattedTitle(data.content);
    await editTitleConversationMutation.mutateAsync({ id, name });
  };

  const prepareConversation = (
    prompt: string,
    type: "usecase" | "chat",
    conversationMode: EConversationMode,
    initialMessages: TMessageTemp[],
    conversationId?: string
  ) => {
    const newSessionId = generateRandomUUIDV4();
    setSessionId(newSessionId);

    const guardValue =
      conversationUC.getGuardValueFromConversationMode(conversationMode);

    const { userMessage, assistantTempMessage, messages } =
      initializeConversation({
        chatType: type,
        conversationId,
        conversationMode,
        initialMessages,
        selectedFiles,
        userMessage: prompt,
      });

    setIsShouldAutoScroll(true);

    if (assistantTempMessage.type !== "deep_research_analyze") {
      consumeFreeChat(guardValue);
    }

    return { assistantTempMessage, messages, newSessionId, userMessage };
  };

  const getAssistantMessageAfterSend = async ({
    source,
    conversationId,
    convId,
    messages,
    selectedImageModelValue,
    options,
    type,
  }: THandleGetAssistantMessageAfterSendOptions) => {
    // Selected model for image generation
    const model =
      selectedImageModelValue === "get_img" //Old image2image messages have "get_image" model
        ? EAIValueModel.GPT_Image
        : selectedImageModelValue ||
          // CHAT-2061: since BE updated => Default image model when mode (chat to image) is getimg
          (selectedImageModel.value === EAIValueModel.chatsmith
            ? EAIValueModel.Get_Img
            : selectedImageModel.value);

    switch (source) {
      case EConversationMode.WEB_SEARCH: {
        return await handleStartChatWebSearch({
          conversationId,
          enabledChatSync,
          isRegenerate: options?.realTimeSearchInfo?.isRegenerate,
          messages,
          onError: () => {
            // Tracking ChatWebSearchSendSuccessful case failed
            sendTrackingEvent({
              name: EventKeys.ChatWebSearchSendSuccessful,
              payload: {
                vulcan_status: "failed",
                vulcan_user_id: user.id,
              },
            });
            setConversationErrorState(conversationId, messages);
          },
          onSuccess(data) {
            const { message } = data;
            // Tracking ChatWebSearchSendSuccessful case success
            sendTrackingEvent({
              name: EventKeys.ChatWebSearchSendSuccessful,
              payload: {
                vulcan_status: "success",
                vulcan_user_id: user.id,
              },
            });
            return message;
          },
          shouldSyncCrossPlatform: isPersistenceEnabled,
        });
      }
      case EConversationMode.AI_ART: {
        const isRegenerate = options?.imageCreationInfo?.isRegenerate;
        return await handleStartChatImageCreation({
          conversationId,
          enabledChatSync,
          isRegenerate,
          messages,
          model,
          onError: () => {
            // Tracking ChatArtSuccessful failed case
            sendTrackingEvent({
              name: EventKeys.ChatArtSuccessful,
              payload: {
                vulcan_status: "failed",
                vulcan_user_id: user.id,
              },
            });
            setConversationErrorState(conversationId, messages);
          },
          onErrorChat: () => {
            // Tracking ChatArtSuccessful failed
            sendTrackingEvent({
              name: EventKeys.ChatArtSuccessful,
              payload: {
                vulcan_status: "failed",
                vulcan_user_id: user.id,
              },
            });
          },
          onSuccess(data) {
            // Tracking ChatArtSuccessful successful case
            sendTrackingEvent({
              name: EventKeys.ChatArtSuccessful,
              payload: {
                vulcan_status: "success",
                vulcan_user_id: user.id,
              },
            });
            const { message } = data;

            return message;
          },
          shouldSaveToLocalStorage:
            !conversationStore.getState().isEditImage && !isRegenerate,
          shouldSyncCrossPlatform: isPersistenceEnabled,
        });
      }
      case EConversationMode.DEEP_RESEARCH: {
        const deepResearchResult = await handleStartChatDeepResearch({
          conversationId,
          enabledChatSync,
          isRegenerate: options?.deepResearchInfo?.isRegenerate,
          messages,
          onError: () => {
            // Tracking ChatDeepResearchSendSuccessful failed case
            sendTrackingEvent({
              name: EventKeys.ChatDeepResearchSendSuccessful,
              payload: {
                vulcan_status: "failed",
                vulcan_user_id: user.id,
              },
            });
            setConversationErrorState(conversationId, messages);
          },
          onSuccess(data) {
            const { message } = data;
            // Tracking ChatDeepResearchSendSuccessful successful case
            sendTrackingEvent({
              name: EventKeys.ChatDeepResearchSendSuccessful,
              payload: {
                vulcan_status: "success",
                vulcan_user_id: user.id,
              },
            });
            return message;
          },
          shouldSyncCrossPlatform: isPersistenceEnabled,
        });

        if (deepResearchResult?.message) {
          return deepResearchResult?.message;
        }

        return null;
      }
      case "regenerate": {
        return await regenerateMessageMutation
          .mutateAsync({
            convId,
            conversationId,
            enabledChatSync,
            messages,
            model: selectedModel.value,
            provider: selectedModel.provider,
            shouldSyncCrossPlatform: isPersistenceEnabled,
            useMemory: enabledMemoryUsed,
          })
          .catch((error) => {
            // CHATS-1329: Only catch error when chat sync enable
            if (
              enabledChatSync &&
              (error.status === HTTP_STATUS.CONFLICT ||
                error?.error?.code === 6)
            ) {
              toast.info(null, {
                description: conversationT("toast.error.conversationUpdated"),
              });
              setTimeout(() => {
                globalThis.location.reload();
              }, 1000);
              return null;
            }
            setConversationErrorState(conversationId, messages);
            return null;
          });
      }
      default: {
        return await updateConversationMutation
          .mutateAsync({
            convId,
            conversationId,
            enabledChatSync,
            messages,
            model: selectedModel.value,
            provider: selectedModel.provider,
            shouldSyncCrossPlatform: isPersistenceEnabled,
            type,
            useMemory: enabledMemoryUsed,
          })
          .catch((error: THttpError) => {
            const errorDetail = error.error;

            const lastMessageOverride = (
              content: string,
              status: TMessageTemp["status"]
            ) => {
              const updatedMessages: TMessageTemp[] = messages.map(
                (message, index) =>
                  index === messages.length - 1
                    ? { ...message, content, status }
                    : message
              );

              setConversationStates(conversationId, {
                convId,
                isNew: false,
                messages: updatedMessages,
              });
              return null;
            };

            if (errorDetail) {
              switch (errorDetail.reason) {
                case CONVERSATION_ERROR_REASON.REACHED_LIMIT: {
                  return lastMessageOverride(
                    "You have reached the advanced usage limit. Upgrade to continue experiencing the fastest and most advanced features, or switch to free models.",
                    "premiumOnly"
                  );
                }

                case CONVERSATION_ERROR_REASON.EXCEED_FILE_UPLOAD_PER_CONVERSATION: {
                  return lastMessageOverride(
                    "You’ve reached the upload limit in this conversation.",
                    "reachedLimit"
                  );
                }

                default: {
                  break;
                }
              }
            }

            // CHATS-1329: Only catch error when chat sync enable
            if (
              enabledChatSync &&
              (error.status === HTTP_STATUS.CONFLICT ||
                error?.error?.code === 6)
            ) {
              toast.info(null, {
                description: conversationT("toast.error.conversationUpdated"),
              });
              setTimeout(() => {
                globalThis.location.reload();
              }, 1000);
              return null;
            }

            setConversationErrorState(conversationId, messages);
            return null;
          });
      }
    }
  };

  const handleCreateConversation = async ({
    prompt,
    type,
    mode,
  }: THandleCreateConversationOptions) => {
    const preparation = prepareConversation(
      prompt,
      type,
      mode,
      initialMessages
    );
    if (!preparation) {
      return;
    }

    const { userMessage, newSessionId, assistantTempMessage, messages } =
      preparation;

    // Create conversation id
    const convIdResults = await createIdMutation.mutateAsync().catch(() => {
      setConversationErrorState("", [userMessage, assistantTempMessage]);
      return null;
    });

    if (!convIdResults?.length) {
      return;
    }

    const [id, convId] = convIdResults;

    setConversationStates(id, {
      convId,
      isNew: true,
      messages,
      status: "loading",
    });

    if (conversationStore.getState().sessionId === newSessionId) {
      setSelectedId(id);
      router.replace(`/conversation/${id}`, { scroll: false });
      setTimeout(() => scrollToBottom("smooth"), 0);
    }

    const isImageToImageMode =
      mode === EConversationMode.AI_ART && selectedFiles.length > 0;

    if (mode === EConversationMode.DEEP_RESEARCH || isImageToImageMode) {
      await handleSummaryConversation(id, [userMessage]);
    }

    const assistantMessage = await getAssistantMessageAfterSend({
      convId,
      conversationId: id,
      messages,
      source: mode,
      type,
    });

    if (enabledChatSync) {
      invalidateWithIntervals(queryClient, getConversationsQueryKey());
    }

    if (!assistantMessage) {
      return;
    }

    if (mode !== EConversationMode.DEEP_RESEARCH && !isImageToImageMode) {
      await handleSummaryConversation(
        id,
        conversationUC.updateAssistantTempMessage(messages, assistantMessage)
      );
    }

    // Start generating animation
    // Add assistant response
    await streamingMessage(id, assistantMessage);
    await handleSuggestion(
      messages,
      isEnabledSuggestion(newSessionId, assistantTempMessage)
    );
    if (enabledChatSync) {
      showSyncAlert();
    }
  };

  const showSyncAlert = () => {
    if (!localStorageImpl.load(HAS_SEEN_CHAT_SYNC_ALERT)) {
      setIsOpenConversationSync(true);
      localStorageImpl.save(HAS_SEEN_CHAT_SYNC_ALERT, true);
    }
  };

  const handleUpdateConversation = async ({
    prompt,
    mode,
  }: THandleUpdateConversationOptions) => {
    const currentConversationMode = mode || conversationMode;
    const preparation = prepareConversation(
      prompt,
      "chat",
      currentConversationMode,
      initialMessages,
      conversationId
    );

    if (!preparation) {
      return;
    }

    const { newSessionId, messages, assistantTempMessage } = preparation;

    const assistantMessage = await getAssistantMessageAfterSend({
      convId: conversationConvId,
      conversationId,
      messages,
      source: currentConversationMode,
      type: "chat",
    });

    if (!assistantMessage) {
      return;
    }

    await handleSuggestion(
      messages,
      isEnabledSuggestion(newSessionId, assistantTempMessage)
    );

    // Start generating animation
    // Add assistant response

    await streamingMessage(conversationId, assistantMessage);
  };

  const handleRegenerateMessage = async () => {
    const newSessionId = generateRandomUUIDV4();
    setSessionId(newSessionId);

    const latestMessage = initialMessages.at(-1);
    if (!latestMessage) {
      return;
    }
    const selectedImageModelValue = latestMessage.models;

    const tempAssistantMessage = conversationUC.createTempMessage({
      prompt: "",
      role: "assistant",
      status: "pending",
      type: latestMessage.type,
    });

    const messages = [...initialMessages, tempAssistantMessage];

    // Add loading
    setConversationStates(conversationId, {
      ...conversation,
      messages,
      status: "loading",
    });

    const guardValue = conversationUC.getGuardValueFromMessage(latestMessage);

    consumeFreeChat(guardValue);
    const sourceAssistantMessage = conversationUC.getSourceAssistantMessage(
      conversationMode,
      latestMessage
    );

    const additionalInfo =
      conversationUC.insertAdditionalInfoForAssistantMessage(latestMessage);

    const assistantMessage = await getAssistantMessageAfterSend({
      convId: conversationConvId,
      conversationId,
      messages,
      options:
        Object.keys(additionalInfo).length > 0 ? additionalInfo : undefined,
      selectedImageModelValue,
      source: sourceAssistantMessage,
    });

    if (!assistantMessage) {
      return;
    }

    await handleSuggestion(
      messages,
      isEnabledSuggestion(newSessionId, latestMessage)
    );

    // Start generating animation
    // Add assistant response
    await streamingMessage(conversationId, assistantMessage);
  };

  const handleCreateConversationWithQuestions = async (
    prompt: string,
    promptTemplate: string
  ) => {
    if (useCaseConversation.questions.length) {
      handleQuestionExists(prompt);
      return;
    }

    // Reset use case conversation
    setUseCaseConversation({
      ...useCaseConversation,
      isUseCase: false,
    });

    const newSessionId = generateRandomUUIDV4();
    setSessionId(newSessionId);

    const { messages } = initializeConversation({
      conversationMode,
      initialMessages,
      userMessage: prompt,
    });

    consumeFreeChat("chat");

    const convIdResults = await createIdMutation.mutateAsync();
    const [id, convId] = convIdResults;

    setConversationStates(id, {
      ...conversation,
      convId,
      isNew: true,
      messages,
      status: "loading",
    });

    const assistantMessage = await createUseCasesMutation.mutateAsync({
      id,
      messages,
      model: selectedModel.value,
      promptTemplate,
      provider: selectedModel.provider,
      shouldSyncCrossPlatform: isPersistenceEnabled,
    });

    const updatedMessages = conversationUC.updateAssistantTempMessage(
      messages,
      assistantMessage
    );
    await handleSummaryConversation(id, updatedMessages);
    await handleSuggestion(
      updatedMessages,
      isEnabledSuggestion(newSessionId, assistantMessage)
    );

    // Start generating animation
    // Add assistant response

    await streamingMessage(id, assistantMessage);

    if (conversationStore.getState().sessionId !== newSessionId) {
      return;
    }

    setSelectedId(id);
    router.replace(`/conversation/${id}`, { scroll: false });
  };

  return {
    status,
    useCaseConversation,
    suggestions,
    userInput,
    messages,
    setUserInput,
    setUseCaseConversation,
    setConversationStates,
    handleCreateConversation,
    handleUpdateConversation,
    handleRegenerateMessage,
    handleCreateConversationWithQuestions,
    // scroll messages
    lastMessageRef,
    lastItemRef,
    setScrollContainerZone,
  };
}

export default useConversationActions;
