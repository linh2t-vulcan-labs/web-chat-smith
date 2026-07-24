import { useTranslations } from "next-intl";

import { ChatPollingResultDTO } from "@/core/http/dto/conversation";
import type {
  ConversationModel,
  TMessageTemp,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQueryClient } from "@/libs/react-query";
import { useConversationState } from "@/store/conversation/hooks";
import { startPolling } from "@/utils/commons/polling";
import {
  CHAT_POLLING_INTERVAL_TIME,
  CHAT_POLLING_TIMEOUT,
} from "@/utils/constants/conversation";

import { getMessagesQueryKey } from "../conversations/use-get-messages";

export const useGetChatPollingResult = () => {
  const conversationT = useTranslations("conversationPage");
  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const streamingMessage = useConversationState(
    (state) => state.streamingMessage
  );
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );
  const setConversationCancelledState = useConversationState(
    (state) => state.setConversationCancelledState
  );

  const queryClient = useQueryClient();

  const startTracingProgressV2 = (
    conversationInfo: ConversationModel,
    initialMessages: TMessageTemp[],
    enabledChatSync: boolean
  ) => {
    if (!conversationInfo.longPollingProcess.processId) {
      return;
    }

    const conversationId = conversationInfo.id;
    const { processId } = conversationInfo.longPollingProcess;

    setConversationStates(conversationId, {
      messages: initialMessages,
      processId,
      status: "polling",
    });

    return startPolling({
      fetcher: async () => {
        const queryProcessDto = new TransformerBuilder(ChatPollingResultDTO)
          .format(
            {
              conversationId,
              processId: conversationInfo.longPollingProcess.processId,
              readSource: enabledChatSync
                ? "READ_SOURCE_CONVERSATION_NEXUS"
                : "READ_SOURCE_ENGINE",
            },
            { excludeExtraneousValues: true, exposeUnsetFields: false }
          )
          .toPlainSnakeCase() as ChatPollingResultDTO;

        const [error, data] =
          await conversationClientService.getChatPollingResult(queryProcessDto);
        if (error || !data) {
          throw error || new Error("No data received");
        }
        return data;
      },
      interval: CHAT_POLLING_INTERVAL_TIME,
      onError: (_error) => {
        setConversationErrorState(conversationId, initialMessages);
      },
      onSuccess: (data) => {
        const { message, status } = data;
        if (message && status === "done") {
          queryClient.invalidateQueries({
            queryKey: getMessagesQueryKey(conversationId),
          });
          streamingMessage(conversationId, message);
          return;
        }

        if (status === "failed") {
          setConversationErrorState(conversationId, initialMessages);
        }

        if (status === "canceled") {
          setConversationCancelledState(
            conversationId,
            initialMessages ?? [],
            conversationT("messageAnswersSkipped")
          );
        }
      },
      timeout: CHAT_POLLING_TIMEOUT,
      validate: (result) => result?.status !== "in_progress",
    });
  };

  return { startTracingProgressV2 };
};
