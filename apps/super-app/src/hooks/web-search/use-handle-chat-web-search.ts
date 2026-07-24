import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type {
  TMessageTemp,
  TTracingProcessResponse,
} from "@/core/models/conversation";
import { useChatPollingWebSearch } from "@/hooks/web-search/use-chat-polling-web-search";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";
import { HTTP_STATUS } from "@/utils/constants/http";

interface THandleStartChatWebSearchOptions {
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  onSuccess?: (result: TTracingProcessResponse) => void;
  onError?: (error?: unknown) => void;
}

export const useHandleChatWebSearch = () => {
  const conversationT = useTranslations("conversationPage");
  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );
  const { handleStartChatPollingWebSearch } = useChatPollingWebSearch();
  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const handleErrorWebSearch = (
    error: unknown,
    messages: TMessageTemp[],
    conversationId: string,
    enabledChatSync: boolean
  ): null => {
    const httpError = error as
      | { error?: { reason?: string; code?: number }; status?: number }
      | undefined;
    if (httpError?.error?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT) {
      // Tracking ChatWebSearchHitLimit
      sendTrackingEvent({
        name: EventKeys.ChatWebSearchHitLimit,
        payload: {
          vulcan_user_id: user.id,
        },
      });

      const updatedMessage: TMessageTemp[] = messages.map((message, index) => {
        if (index === messages.length - 1) {
          return {
            ...message,
            status: "reachedLimit",
            type: "realtime_search",
          };
        }

        return message;
      });
      setConversationStates(conversationId, {
        isNew: false,
        messages: updatedMessage,
        status: "submitted",
      });
    }

    // CHATS-1329: Only catch error when chat sync enable
    if (
      enabledChatSync &&
      (httpError?.status === HTTP_STATUS.CONFLICT ||
        httpError?.error?.code === 6)
    ) {
      toast.info(null, {
        description: conversationT("toast.error.conversationUpdated"),
      });
      setTimeout(() => {
        globalThis.location.reload();
      }, 1000);
      return null;
    }

    // Tracking ChatWebSearchSendSuccessful - failed
    sendTrackingEvent({
      name: EventKeys.ChatWebSearchSendSuccessful,
      payload: {
        vulcan_status: "failed",
        vulcan_user_id: user.id,
      },
    });

    setConversationErrorState(conversationId, messages);
    return null;
  };

  const handleStartChatWebSearch = async (
    options: THandleStartChatWebSearchOptions
  ) => {
    const {
      messages,
      conversationId,
      isRegenerate,
      shouldSyncCrossPlatform,
      enabledChatSync,
      onSuccess,
      onError,
    } = options;
    const response = await handleStartChatPollingWebSearch({
      conversationId,
      enabledChatSync,
      isRegenerate,
      messages,
      onErrorChat: (error) =>
        handleErrorWebSearch(
          error,
          messages,
          conversationId,
          Boolean(enabledChatSync)
        ),
      onErrorTracing: onError,
      onSuccess,
      shouldSyncCrossPlatform,
    });

    if (!response?.message) {
      return null;
    }

    return response.message;
  };

  return { handleStartChatWebSearch };
};
