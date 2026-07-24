import { useTranslations } from "next-intl";

import { ChatTracingDeepResearchProcessDTO } from "@/core/http/dto/conversation";
import type {
  ConversationModel,
  TMessageTemp,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQueryClient } from "@/libs/react-query";
import { useConversationState } from "@/store/conversation/hooks";
import { startPolling } from "@/utils/commons/polling";

import { getMessagesQueryKey } from "../conversations/use-get-messages";

const INTERVAL_TIME = 4 * 1000; // 4s
const TIMEOUT = 1000 * 60 * 10; // 10 minutes

export const useHandlePollingDeepResearchProcess = () => {
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

  const startTracingProgressDeepResearch = (
    conversationInfo: ConversationModel,
    initialMessages: TMessageTemp[],
    enabledChatSync: boolean
  ) => {
    if (!conversationInfo) {
      return;
    }

    if (
      !conversationInfo.longPollingProcess.processId ||
      conversationInfo.longPollingProcess.processId.length === 0
    ) {
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
        const queryProcessDto = new TransformerBuilder(
          ChatTracingDeepResearchProcessDTO
        )
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
          .toPlainSnakeCase() as ChatTracingDeepResearchProcessDTO;

        const [error, data] =
          await conversationClientService.getChatPollingResult(queryProcessDto);
        if (error || !data) {
          throw error || new Error("No data received");
        }
        return data;
      },
      interval: INTERVAL_TIME,
      onError: () => {
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
      timeout: TIMEOUT, // 1 minute
      validate: (result) => result?.status !== "in_progress",
    });
  };

  return { startTracingProgressDeepResearch };
};
