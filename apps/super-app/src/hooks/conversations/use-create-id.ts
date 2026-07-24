import { useQueryClient } from "@tanstack/react-query";

import { EUseCase } from "@/core/http/dto/conversation";
import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { getConversationsQueryKey } from "@/hooks/conversations/use-get-conversations";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function useCreateId() {
  const queryClient = useQueryClient();
  const { isPersistenceEnabled } = useChatSyncFlag();

  return useMutation({
    mutationFn: async () => {
      const payload = {
        use_case: EUseCase.CHAT,
      };
      const [error, conversation] = isPersistenceEnabled
        ? await conversationClientService.createConversationIdV2(payload)
        : await conversationClientService.createConversationId(payload);

      if (error) {
        throw new THttpError(error);
      }

      return [conversation.id, conversation.conversationConvId] as const;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
    },
  });
}
