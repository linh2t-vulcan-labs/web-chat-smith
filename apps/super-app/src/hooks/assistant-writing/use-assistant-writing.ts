import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

import { createWritingPrompt } from "@/components/assistant-writing/consts";
import { DEFAULT_AI_MODEL } from "@/config/default-model";
import type { TAssistantWriting } from "@/core/models/assistant-writing";
import type { TMessageTemp } from "@/core/models/conversation";
import { EAIProviderModel } from "@/core/models/model";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useRouter } from "@/i18n/navigation";
import { invalidateWithIntervals } from "@/libs/react-query/utils";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { generatePathUrl, generateRandomUUIDV4 } from "@/utils/commons/helpers";
import { OPEN_SUGGESTIONS_KEY } from "@/utils/commons/keys";
import { formattedSuggestion, formattedTitle } from "@/utils/commons/string";
import { defaultAssistantWriting } from "@/utils/constants/assistant";
import {
  SUGGESTION_CONVERSATION_PROMPT,
  SUMMARY_TITLE_PROMPT,
} from "@/utils/constants/conversation";
import { ERROR_MESSAGE_STATUS } from "@/utils/constants/error";
import { mapLatestMessageToSyncDTO } from "@/utils/mappers/conversations";

import { useEditTitleConversation } from "../conversations/use-edit-title-conversation";
import { getConversationsQueryKey } from "../conversations/use-get-conversations";
import useLocalStorage from "../use-local-storage";
import { useCreateId } from "./use-create-id";
import { useCreatePrediction } from "./use-create-prediction";
import { useUpdateAssistantWriting } from "./use-update-assistant-writing";

interface useAssistantWritingProps {
  id?: string;
  initialAssistantWriting?: TAssistantWriting;
}

function useAssistantWriting({
  id,
  initialAssistantWriting,
}: useAssistantWritingProps) {
  const { isBeta: enabledChatSync } = useChatSyncFlag();
  const queryClient = useQueryClient();
  const router = useRouter();
  // Global State
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
  const dsVersion = useGlobalState((state) => state.dsVersion);

  const setChatFreeUsage = useGlobalState((state) => state.setChatFreeUsage);
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );

  // Conversation Store
  const conversationStore = useConversationStore();

  // Conversation State
  const assistantWritingSettings = useConversationState(
    (state) => state.assistantWritingSettings
  );
  const selectedId = useConversationState((state) => state.selectedId);
  const suggestions = useConversationState((state) => state.suggestions);
  const assistantWritingStates = useConversationState(
    (state) => state.assistantWritingStates
  );
  const setAssistantWritingSettings = useConversationState(
    (state) => state.setAssistantWritingSettings
  );
  const setAssistantWritingStates = useConversationState(
    (state) => state.setAssistantWritingStates
  );
  const setSessionId = useConversationState((state) => state.setSessionId);
  const setSelectedId = useConversationState((state) => state.setSelectedId);
  const setSuggestions = useConversationState((state) => state.setSuggestions);
  const { isPersistenceEnabled } = useChatSyncFlag();

  // API Mutation
  const createIdMutation = useCreateId();
  const updateMutation = useUpdateAssistantWriting();
  const createPredictionMutation = useCreatePrediction();
  const editTitleConversationMutation = useEditTitleConversation();

  // Others
  const isChatBlocked = !isValidPremiumUser && !chatFreeUsage.assistant;
  const selectedAssistant =
    assistantWritingStates[selectedId] || defaultAssistantWriting;
  const [isShowSuggestions] = useLocalStorage(OPEN_SUGGESTIONS_KEY, true);

  const handleStopGenerating = () => {
    setAssistantWritingStates(selectedId, {
      ...selectedAssistant,
      status: "submitted",
    });
  };

  const handleSuggestion = async (messages: TMessageTemp[]) => {
    const data = await createPredictionMutation.mutateAsync({
      messages,
      model: DEFAULT_AI_MODEL,
      promptTemplate: SUGGESTION_CONVERSATION_PROMPT,
    });

    const suggestions = formattedSuggestion(data.content);
    setSuggestions(suggestions);
  };

  const handleError = (error: unknown) => {
    const errorReason = (
      error as { error: { reason?: string } } | null | undefined
    )?.error.reason;

    toast.error(null, {
      description:
        ERROR_MESSAGE_STATUS[
          errorReason as keyof typeof ERROR_MESSAGE_STATUS
        ] ?? "Something went wrong, please try again",
    });

    setAssistantWritingStates(selectedId, {
      ...selectedAssistant,
      status: "idle",
    });
  };

  const handleCreate = async (prompt: string, isRevert = false) => {
    if (isChatBlocked) {
      setIsOpenSubscriptionModal(true, "assistant-writing");
      sendTrackingEvent({
        name: EventKeys.DSAutoOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "assistant-writing",
          vulcan_user_id: user.id,
        },
      });
      return;
    }

    const newSessionId = generateRandomUUIDV4();
    setSessionId(newSessionId);

    const modifyPrompt = createWritingPrompt(
      prompt,
      selectedAssistant.settings
    );
    const userMessage = conversationUC.createTempMessage({
      prompt: modifyPrompt,
      role: "user",
      type: "chat",
    });
    const assistantClone = { ...selectedAssistant };

    const baseState = {
      ...selectedAssistant,
      prompt: userMessage,
    };

    setAssistantWritingStates(selectedId, {
      ...baseState,
      status: "loading",
    });

    if (!isValidPremiumUser) {
      setChatFreeUsage({
        ...chatFreeUsage,
        assistant: chatFreeUsage.assistant - 1,
      });
    }

    try {
      const id = await createIdMutation.mutateAsync();

      const assistantMessage = await updateMutation.mutateAsync({
        id,
        messages: [userMessage],
        model: DEFAULT_AI_MODEL,
        provider: EAIProviderModel.OpenAI,
        readSource: enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE",
        settings: assistantWritingSettings,
        ...(isPersistenceEnabled && {
          sync: mapLatestMessageToSyncDTO({
            conversationId: id,
            messageType: "assistant_writing",
            messages: [userMessage],
          }),
        }),
      });

      const prediction = await createPredictionMutation.mutateAsync({
        messages: [userMessage, assistantMessage],
        model: DEFAULT_AI_MODEL,
        promptTemplate: SUMMARY_TITLE_PROMPT,
      });

      const title = formattedTitle(prediction.content);
      await editTitleConversationMutation.mutateAsync({ id, name: title });

      if (isShowSuggestions) {
        await handleSuggestion([userMessage, assistantMessage]);
      }

      const newUrl = generatePathUrl({ id, path: "/assistant/writing" });

      setAssistantWritingStates(id, {
        ...baseState,
        answer: assistantMessage,
        status: "generating",
      });

      if (conversationStore.getState().sessionId !== newSessionId) {
        return;
      }

      // Set writing state with new response
      setSelectedId(id);

      // Optionally revert
      if (isRevert) {
        setAssistantWritingStates(selectedId, assistantClone);
      }

      if (enabledChatSync) {
        invalidateWithIntervals(queryClient, getConversationsQueryKey());
      }

      router.replace(newUrl, { scroll: false });
      sendTrackingEvent({
        name: EventKeys.AssistantwrittingResponse,
        payload: {
          vulcan_status: "success",
        },
      });
    } catch (error) {
      sendTrackingEvent({
        name: EventKeys.AssistantwrittingResponse,
        payload: {
          vulcan_status: "failed",
        },
      });
      handleError(error);
    }
  };

  const handleUpdate = async (prompt: string) => {
    if (isChatBlocked) {
      setIsOpenSubscriptionModal(true, "assistant-writing");
      sendTrackingEvent({
        name: EventKeys.DSAutoOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "assistant-writing",
          vulcan_user_id: user.id,
        },
      });
      return;
    }

    const modifiedPrompt = createWritingPrompt(
      prompt,
      selectedAssistant.settings
    );
    const userMessage = conversationUC.createTempMessage({
      prompt: modifiedPrompt,
      role: "user",
      type: "chat",
    });

    const baseState = {
      ...selectedAssistant,
    };

    setAssistantWritingStates(selectedId, {
      ...baseState,
      status: "loading",
    });

    if (!isValidPremiumUser) {
      setChatFreeUsage({
        ...chatFreeUsage,
        assistant: chatFreeUsage.assistant - 1,
      });
    }

    try {
      const assistantMessage = await updateMutation.mutateAsync({
        id: selectedId,
        messages: [userMessage],
        model: DEFAULT_AI_MODEL,
        provider: EAIProviderModel.OpenAI,
        readSource: enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE",
        settings: assistantWritingSettings,
        ...(isPersistenceEnabled && {
          sync: mapLatestMessageToSyncDTO({
            conversationId: selectedId,
            messageType: "assistant_writing",
            messages: [userMessage],
          }),
        }),
      });

      if (isShowSuggestions) {
        await handleSuggestion([userMessage, assistantMessage]);
      }

      setAssistantWritingStates(selectedId, {
        ...baseState,
        answer: assistantMessage,
        status: "generating",
      });
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    setSelectedId(id || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!initialAssistantWriting?.answer) {
      return;
    }

    setAssistantWritingStates(selectedId, {
      ...selectedAssistant,
      answer: initialAssistantWriting.answer,
    });
    setAssistantWritingSettings(initialAssistantWriting.settings);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAssistantWriting]);

  return {
    assistantWritingSettings,
    error: createIdMutation.error || updateMutation.error,
    handleCreate,
    handleStopGenerating,
    handleUpdate,
    selectedAssistantWriting: selectedAssistant,
    selectedId,
    setAssistantWritingSettings,
    setSuggestions,
    status: selectedAssistant.status,
    suggestions,
  };
}

export default useAssistantWriting;
