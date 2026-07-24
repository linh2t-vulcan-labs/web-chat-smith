import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { ChatTracingDeepResearchProcessDTO } from "@/core/http/dto/conversation";
import type {
  TMessageTemp,
  TTracingProcessResponse,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { E_PERMISSION_REQUEST_TYPE } from "@/features/notification/enum/permission";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useFreeUsageTracker } from "@/hooks/usage/use-free-usage-tracker";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQueryClient } from "@/libs/react-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import type { THttpError } from "@/utils/commons/error";
import { startPolling } from "@/utils/commons/polling";
import { defaultConversationState } from "@/utils/constants/conversation";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";
import { HTTP_STATUS } from "@/utils/constants/http";

import { registerTracingController } from "../conversations/use-conversation-tracing";
import { getMessagesQueryKey } from "../conversations/use-get-messages";
import { useChatDeepResearch } from "./use-chat-deep-research";

const INTERVAL_TIME = 5 * 1000; // 5s
const TIMEOUT = 1000 * 60 * 10; // 10 minutes

interface THandleStartChatDeepResearchOptions {
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  onSuccess?: (result: TTracingProcessResponse) => void;
  onError?: (error?: unknown) => void;
}

export const useHandleChatDeepResearch = () => {
  const conversationT = useTranslations("conversationPage");

  const chatDeepResearchMutation = useChatDeepResearch();
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );
  const setConversationCancelledState = useConversationState(
    (state) => state.setConversationCancelledState
  );
  const startStreamingMessage = useConversationState(
    (state) => state.streamingMessage
  );

  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );

  const conversationStore = useConversationStore();
  const queryClient = useQueryClient();

  const { consumeFreeChat } = useFreeUsageTracker();

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { canShowSoftPermission, setConfirmToastState } = useNotification();

  const handleStartChatDeepResearch = async (
    options: THandleStartChatDeepResearchOptions
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
    const response = await chatDeepResearchMutation
      .mutateAsync({
        conversationId,
        enabledChatSync,
        isRegenerate,
        messages,
        shouldSyncCrossPlatform,
      })
      .catch((error: THttpError) => {
        // Tracking ChatDeepResearchSendSuccessful failed case
        sendTrackingEvent({
          name: EventKeys.ChatDeepResearchSendSuccessful,
          payload: {
            vulcan_status: "failed",
            vulcan_user_id: user.id,
          },
        });
        if (error?.error?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT) {
          const errorDetail = error.error;
          const updatedMessage: TMessageTemp[] = messages.map(
            (message, index) => {
              if (index === messages.length - 1) {
                const updatedContent = errorDetail?.details?.[0]
                  ?.error as string;
                return {
                  ...message,
                  content: updatedContent ?? "",
                  status: "reachedLimit",
                  type: "deep_research",
                };
              }

              return message;
            }
          );
          setConversationStates(conversationId, {
            isNew: false,
            messages: updatedMessage,
            status: "submitted",
          });

          return null;
        }

        // CHATS-1329: Only catch error when chat sync enable
        if (
          enabledChatSync &&
          (error.status === HTTP_STATUS.CONFLICT || error?.error?.code === 6)
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

    if (!response) {
      return;
    }
    const { processId } = response;

    if (!processId) {
      const clarifyMessage = response.responseMessage;

      // Tracking ChatDeepResearchSendSuccessful successful case
      sendTrackingEvent({
        name: EventKeys.ChatDeepResearchSendSuccessful,
        payload: {
          vulcan_status: "success",
          vulcan_user_id: user.id,
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(conversationId),
      });
      await startStreamingMessage(conversationId, clarifyMessage);
      return;
    }

    consumeFreeChat("deepResearch");

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
            type: "deep_research",
          };
        }

        return message;
      }
    );
    setConversationStates(conversationId, {
      messages: updatedMessage,
      processId,
      status: "polling",
    });

    // [Notification] Show soft request
    if (canShowSoftPermission()) {
      setConfirmToastState(
        true,
        E_PERMISSION_REQUEST_TYPE.NOTIFICATION_LONG_RUNNING_TASK,
        {
          triggerName: "deep_research",
        }
      );
    }

    const queryProcessDto = new TransformerBuilder(
      ChatTracingDeepResearchProcessDTO
    )
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
      .toPlainSnakeCase() as ChatTracingDeepResearchProcessDTO;

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
        interval: INTERVAL_TIME,
        onError: (error) => {
          onError?.(error);
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
        timeout: TIMEOUT,
        validate: (result) => result?.status !== "in_progress",
      });
      if (controller?.stop) {
        registerTracingController(conversationId, controller.stop);
      }
    });
  };

  return { handleStartChatDeepResearch };
};
