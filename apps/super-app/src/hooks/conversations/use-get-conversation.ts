import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function getConversationQueryKey(id?: string) {
  return ["useGetConversationById", id];
}

export const useGetConversationById = (id?: string) => {
  const { isBeta: enabledChatSync, isReady } = useChatSyncFlag();

  return useQuery({
    enabled: !!id && isReady,
    queryFn: async () => {
      if (!id) {
        return null;
      }

      const [error, data] = enabledChatSync
        ? await conversationClientService.getConversationByIdV2({ id })
        : await conversationClientService.getConversationById({ id });

      if (error) {
        throw new THttpError(error);
      }

      return data;
    },
    queryKey: getConversationQueryKey(id),
  });
};
