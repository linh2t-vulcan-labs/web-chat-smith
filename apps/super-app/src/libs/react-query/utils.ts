import type {
  InfiniteData,
  QueryClient,
  QueryKey,
} from "@tanstack/react-query";

import type {
  TGetMessagesByConversationId,
  TMessageTemp,
} from "@/core/models/conversation";
import { getMessagesQueryKey } from "@/hooks/conversations/use-get-messages";

export const updateMessagesQuery = (
  oldData: InfiniteData<TGetMessagesByConversationId, unknown> | undefined,
  messages: TMessageTemp[]
) => {
  const firstPage = oldData?.pages[0];
  const reversedArr = [...messages].toReversed();

  if (firstPage) {
    return {
      ...oldData,
      pages: [
        {
          ...firstPage,
          data: reversedArr,
        },
      ],
    };
  }

  return {
    pageParams: [0],
    pages: [
      {
        data: reversedArr,
        has_more: false,
        next_id: "",
      },
    ],
  };
};

export const updateCacheMessagesInConversation = (
  queryClient: QueryClient,
  conversationId: string,
  messages: TMessageTemp[]
) => {
  const key = getMessagesQueryKey(conversationId);
  queryClient.setQueryData<InfiniteData<TGetMessagesByConversationId>>(
    key,
    (oldData) => updateMessagesQuery(oldData, messages)
  );
};

export const invalidateWithIntervals = (
  queryClient: QueryClient,
  queryKey: QueryKey,
  intervalMs = 3000,
  times = 2
) => {
  let count = 0;

  const run = () => {
    if (count >= times) {
      return;
    }

    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey });
      count += 1;
      run();
    }, intervalMs);
  };

  run();
};
