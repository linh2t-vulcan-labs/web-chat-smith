import type { TUpdateConversationNameByIdInput } from "@/core/http/dto/conversation";
import type { TResponseGetConversations } from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { getConversationsQueryKey } from "./use-get-conversations";

const updateOptimistically = (
  old: InfiniteData<TResponseGetConversations, unknown> | undefined,
  input: TUpdateConversationNameByIdInput
) => {
  const newData = old?.pages.map((page) => ({
    ...page,
    data: page.data.map((thread) => {
      if (thread.id === input.id) {
        return { ...thread, name: input.name };
      }
      return thread;
    }),
  }));

  return {
    ...old,
    pages: newData,
  } as InfiniteData<TResponseGetConversations>;
};

export function useEditTitleConversation() {
  const queryClient = useQueryClient();
  const { isPersistenceEnabled } = useChatSyncFlag();

  return useMutation({
    mutationFn: async (input: TUpdateConversationNameByIdInput) => {
      const [error, result] = isPersistenceEnabled
        ? await conversationClientService.updateConversationNameByIdV2({
            id: input.id,
            title: input.name,
          })
        : await conversationClientService.updateConversationNameById({
            id: input.id,
            name: input.name,
          });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    // When mutate is called:
    onMutate: async (input) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: getConversationsQueryKey() });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<
        InfiniteData<TResponseGetConversations>
      >(getConversationsQueryKey());

      // Optimistically update to the new value
      queryClient.setQueryData<InfiniteData<TResponseGetConversations>>(
        getConversationsQueryKey(),
        (old) => updateOptimistically(old, input)
      );

      // Return a context object with the snapshotted value
      return { previousThreads };
    },
    onError: (_err, newThreads, context) => {
      queryClient.setQueryData(
        getConversationsQueryKey(),
        context?.previousThreads
      );
    },
  });
}
