import { useMemo } from "react";

import type { TMessageType } from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useGetConversationById } from "@/hooks/conversations/use-get-conversation";
import { useInfiniteQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";
import { insertAssistantPendingBeforeUserMessage } from "@/utils/mappers/conversations";

interface TGetMessagesQuery {
  id?: string;
  limit: number;
  sortBy: "SORT_DESC" | "SORT_ASC";
}

export function getMessagesQueryKey(id?: string) {
  return ["messages", id];
}

const INITIAL_PAGE_PARAM_V1 = "0";
const INITIAL_PAGE_PARAM_V2 = "";

export function useGetMessages(input: TGetMessagesQuery) {
  const { data: conversationInfo, isLoading } = useGetConversationById(
    input.id
  );
  const { isBeta: enabledChatSync, isReady } = useChatSyncFlag();
  const initialPageParam = enabledChatSync
    ? INITIAL_PAGE_PARAM_V2
    : INITIAL_PAGE_PARAM_V1;

  return useInfiniteQuery({
    enabled: !!input.id && !isLoading && !!conversationInfo && isReady,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_id : undefined,
    initialPageParam,
    queryFn: async ({ pageParam }) => {
      if (!input.id) {
        throw new Error("Can't load conversation");
      }

      const payload = {
        id: input.id,
        limit: input.limit,
        next_id: pageParam,
        sortBy: input.sortBy,
      };

      const payloadV2 = {
        id: input.id,
        limit: input.limit,
        prev_cursor: pageParam,
      };

      const messageResponse = enabledChatSync
        ? await conversationClientService.getMessagesByIdV2(payloadV2)
        : await conversationClientService.getMessagesById(payload);

      const [errorMessage, resultMessage] = messageResponse;

      if (errorMessage) {
        throw new THttpError(errorMessage);
      }

      if (!resultMessage.data.length) {
        return {
          data: [],
          has_more: false,
          next_id: "",
        };
      }

      const data = conversationUC.preprocessContentMessages(resultMessage.data);

      return {
        data,
        has_more: resultMessage.has_more,
        next_id: resultMessage.next_id,
      };
    },
    queryKey: getMessagesQueryKey(input.id),
  });
}

export const useHandleGetMessagesFromConversationId = (
  input: TGetMessagesQuery
) => {
  const {
    data: conversationInfo,
    isLoading: isLoadingConversation,
    isError: isErrorConversation,
  } = useGetConversationById(input.id);

  const {
    isLoading,
    isError,
    isFetchNextPageError,
    hasNextPage,
    data,
    isFetched,
    isFetchingNextPage,
    refetch: refetchMessages,
    fetchNextPage: fetchNextPageConversation,
  } = useGetMessages(input);

  const originalData = useMemo(() => {
    const messages = data?.pages?.flatMap((page) => page.data) ?? [];

    const processingType = conversationInfo
      ? conversationUC.detectConversationProcessing(conversationInfo)
      : null;

    const isProcessing = Boolean(processingType);
    const longPollingType = conversationInfo?.longPollingProcess?.type;
    const shouldInsertPending = isProcessing && longPollingType;

    if (shouldInsertPending) {
      const processedData = insertAssistantPendingBeforeUserMessage(
        messages,
        conversationInfo.longPollingProcess.type as TMessageType
      );
      return [...processedData].toReversed();
    }

    return [...messages].toReversed();
  }, [data, conversationInfo]);

  return {
    conversationInfo,
    fetchNextPageConversation,
    hasNextPage,
    isError,
    isErrorConversation,
    isFetchNextPageError,
    isFetched,
    isFetchingNextPage,
    isLoading,
    isLoadingConversation,
    originalData,
    refetchMessages,
  };
};
