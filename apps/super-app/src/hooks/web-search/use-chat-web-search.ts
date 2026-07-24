import type {
  TGetMessagesByConversationId,
  TMessageTemp,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { getConversationsQueryKey } from "@/hooks/conversations/use-get-conversations";
import { getMessagesQueryKey } from "@/hooks/conversations/use-get-messages";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { updateCacheMessagesInConversation } from "@/libs/react-query/utils";
import { THttpError } from "@/utils/commons/error";
import { mapLatestMessageToSyncDTO } from "@/utils/mappers/conversations";

interface TWebSearchInput {
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
}

export const useChatWebSearch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: TWebSearchInput) => {
      const {
        messages,
        conversationId,
        isRegenerate,
        shouldSyncCrossPlatform = false,
        enabledChatSync = false,
      } = input;
      const userMessageForWebSearch =
        conversationUC.getLatestUserMessageForConversationMode(
          messages,
          "realtime_search"
        );

      if (!userMessageForWebSearch) {
        return null;
      }

      // Determine sync cross-platform
      const sync = shouldSyncCrossPlatform
        ? mapLatestMessageToSyncDTO({
            conversationId,
            messageType: "real_time_search",
            messages,
            syncAllow: isRegenerate
              ? "SYNC_ALLOW_RESPONSE_ONLY"
              : "SYNC_ALLOW_REQUEST_AND_RESPONSE",
          })
        : undefined;

      const messageDto = conversationUC.transformMessageForWebSearch(
        userMessageForWebSearch,
        conversationId,
        isRegenerate,
        sync,
        enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE"
      );

      const [error, result] =
        await conversationClientService.webSearch(messageDto);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useChatWebSearch"],
    onError: (error: THttpError, _newMessages, context) => {
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });
    },
  });
};
