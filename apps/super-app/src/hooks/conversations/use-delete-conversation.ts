import type { TDeleteConversationByIdInput } from "@/core/http/dto/conversation";
import type { TResponseGetConversations } from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { getConversationsQueryKey } from "./use-get-conversations";

export function getDeleteConversationQueryKey() {
  return ["conversation", "delete"];
}

interface TDeleteConversationOptions {
  onSuccess?: () => void;
}

export function useDeleteConversation(options?: TDeleteConversationOptions) {
  const queryClient = useQueryClient();
  const { isPersistenceEnabled } = useChatSyncFlag();

  return useMutation({
    mutationKey: getDeleteConversationQueryKey(),
    mutationFn: async (input: TDeleteConversationByIdInput) => {
      const [error, result] = isPersistenceEnabled
        ? await conversationClientService.deleteConversationByIdV2({
            id: input.id,
          })
        : await conversationClientService.deleteConversationById({
            id: input.id,
          });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    // When mutate is called:
    onMutate: async () => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: getConversationsQueryKey() });

      // Snapshot the previous value
      const previousThreads = queryClient.getQueryData<
        InfiniteData<TResponseGetConversations>
      >(getConversationsQueryKey());

      // Return a context object with the snapshotted value
      return { previousThreads };
    },
    onError: (_err, newThreads, context) => {
      const defaultPreviousThreads = {
        pageParams: ["0"],
        pages: [],
      };
      queryClient.setQueryData(
        getConversationsQueryKey(),
        context?.previousThreads ?? defaultPreviousThreads
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
      options?.onSuccess?.();
    },
  });
}
