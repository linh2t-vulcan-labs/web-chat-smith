import type {
  TGetMessagesByConversationId,
  TMessageTemp,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { getConversationsQueryKey } from "@/hooks/conversations/use-get-conversations";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { updateCacheMessagesInConversation } from "@/libs/react-query/utils";
import { THttpError } from "@/utils/commons/error";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";
import { mapLatestMessageToSyncDTO } from "@/utils/mappers/conversations";

import { getMessagesQueryKey } from "../conversations/use-get-messages";

interface TChatDeepResearchInput {
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
}

export const useChatDeepResearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TChatDeepResearchInput) => {
      const userMessageForDeepResearch =
        conversationUC.getLatestUserMessageForConversationMode(
          input.messages,
          "deep_research"
        );
      const messagesContext = conversationUC.getMessagesContextForDeepResearch(
        input.messages
      );

      if (!userMessageForDeepResearch) {
        const assistantTempMessage = conversationUC.createTempMessage({
          prompt: "",
          role: "assistant",
          status: "error",
          type: "deep_research",
        });

        return {
          processId: "",
          responseMessage: assistantTempMessage,
          status: "done",
        };
      }

      // Determine sync cross-platform
      const sync = input.shouldSyncCrossPlatform
        ? mapLatestMessageToSyncDTO({
            conversationId: input.conversationId,
            messageType: "deep_research_conversation",
            messages: input.messages,
            syncAllow: input.isRegenerate
              ? "SYNC_ALLOW_RESPONSE_ONLY"
              : "SYNC_ALLOW_REQUEST_AND_RESPONSE",
          })
        : undefined;

      const messageDto = conversationUC.transformMessageForDeepResearch(
        userMessageForDeepResearch,
        input.conversationId,
        input.isRegenerate,
        messagesContext,
        sync,
        input.enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE"
      );

      const [error, result] =
        await conversationClientService.chatWithDeepResearch(messageDto);

      if (error) {
        throw new THttpError(error);
      }

      return {
        ...result,
      };
    },
    mutationKey: ["useChatDeepResearch"],
    onError: (error: THttpError, _newMessages, context) => {
      if (error?.error?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT) {
        if (context?.conversationId && context?.previousMessages) {
          updateCacheMessagesInConversation(
            queryClient,
            context?.conversationId,
            context?.previousMessages
          );
        }

        return error;
      }

      if (context?.conversationId && context?.previousMessages) {
        updateCacheMessagesInConversation(
          queryClient,
          context.conversationId,
          context.previousMessages
        );
      }

      return error;
    },
    onMutate: (input) => {
      const previousData = queryClient.getQueryData<
        InfiniteData<TGetMessagesByConversationId>
      >(getMessagesQueryKey(input.conversationId));

      const flattedData: TMessageTemp[] = previousData
        ? previousData.pages.flatMap((page) => page.data as TMessageTemp[])
        : [];

      const previousMessages: TMessageTemp[] = [...flattedData].toReversed();

      // Return a context object with the snapshotted value
      return { conversationId: input.conversationId, previousMessages };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
    },
  });
};
