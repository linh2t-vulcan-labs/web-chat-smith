import { useTranslations } from "next-intl";

import { ChatPollingResultDTO } from "@/core/http/dto/conversation";
import type {
  TMessageTemp,
  TTracingProcessResponse,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { E_PERMISSION_REQUEST_TYPE } from "@/features/notification/enum/permission";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useChatWebSearch } from "@/hooks/web-search/use-chat-web-search";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQueryClient } from "@/libs/react-query";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import type { THttpError } from "@/utils/commons/error";
import { startPolling } from "@/utils/commons/polling";
import {
  CHAT_POLLING_INTERVAL_TIME,
  CHAT_POLLING_TIMEOUT,
  defaultConversationState,
} from "@/utils/constants/conversation";

import { registerTracingController } from "../conversations/use-conversation-tracing";
import { getMessagesQueryKey } from "../conversations/use-get-messages";

interface THandleStartChatPollingWebSearchOptions {
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  onSuccess?: (result: TTracingProcessResponse) => void;
  onErrorTracing?: (error?: unknown) => void;
  onErrorChat?: (error?: unknown) => null;
}

export const useChatPollingWebSearch = () => {
  const queryClient = useQueryClient();
  const conversationT = useTranslations("conversationPage");

  const chatWebSearchMutation = useChatWebSearch();
  const conversationStore = useConversationStore();

  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );
  const setConversationCancelledState = useConversationState(
    (state) => state.setConversationCancelledState
  );

  const { canShowSoftPermission, setConfirmToastState } = useNotification();

  const handleStartChatPollingWebSearch = async (
    options: THandleStartChatPollingWebSearchOptions
  ) => {
    const {
      messages,
      conversationId,
      isRegenerate,
      shouldSyncCrossPlatform = false,
      enabledChatSync = false,
      onSuccess,
      onErrorTracing,
      onErrorChat,
    } = options;

    const response = await chatWebSearchMutation
      .mutateAsync({
        conversationId,
        enabledChatSync,
        isRegenerate,
        messages,
        shouldSyncCrossPlatform,
      })
      .catch((error: THttpError) => onErrorChat?.(error));

    if (!response) {
      return;
    }

    const { processId } = response;

    const currentState =
      conversationStore.getState().conversationStates[conversationId] ||
      defaultConversationState;
    const currentMessages = currentState.messages;
    const updatedMessage: TMessageTemp[] = currentMessages.map(
      (message, index) => {
        if (index === currentMessages.length - 1) {
          return {
            ...message,
            status: "pending",
            type: "realtime_search",
          };
        }

        return message;
      }
    );

    setConversationStates(conversationId, {
      messages: updatedMessage,
      // Note: CHATS-1329 needs clarification, check later
      processId,
      status: "polling",
      isNew: false,
    });

    // [Notification] Show soft request
    if (canShowSoftPermission()) {
      setConfirmToastState(
        true,
        E_PERMISSION_REQUEST_TYPE.NOTIFICATION_LONG_RUNNING_TASK,
        {
          triggerName: "web_search",
        }
      );
    }

    const queryProcessDto = new TransformerBuilder(ChatPollingResultDTO)
      .format(
        {
          conversationId,
          processId,
          readSource: enabledChatSync
            ? "READ_SOURCE_CONVERSATION_NEXUS"
            : "READ_SOURCE_ENGINE",
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatPollingResultDTO;

    return new Promise<TTracingProcessResponse>((resolve, reject) => {
      const controller = startPolling({
        fetcher: async () => {
          const [error, data] =
            await conversationClientService.getChatPollingResult(
              queryProcessDto
            );
          if (error || !data) {
            throw error || new Error("No data received");
          }
          return data;
        },
        interval: CHAT_POLLING_INTERVAL_TIME,
        onError: (error) => {
          onErrorTracing?.(error);
          reject(error instanceof Error ? error : new Error("Unknown error"));
        },
        onSuccess: (data) => {
          const { message, status } = data;

          if (status === "failed") {
            setConversationErrorState(conversationId, messages);
            return;
          }

          if (status === "canceled") {
            setConversationCancelledState(
              conversationId,
              messages ?? [],
              conversationT("messageAnswersSkipped")
            );
          }

          if (message && status === "done") {
            queryClient.invalidateQueries({
              queryKey: getMessagesQueryKey(conversationId),
            });
          }

          onSuccess?.(data);
          resolve(data);
        },
        timeout: CHAT_POLLING_TIMEOUT,
        validate: (result) => result?.status !== "in_progress",
      });
      if (controller?.stop) {
        registerTracingController(conversationId, controller.stop);
      }
    });
  };

  return { handleStartChatPollingWebSearch };
};
