import { useQuery } from "@tanstack/react-query";

import { assistantWritingClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { THttpError } from "@/utils/commons/error";

export function getAssistantWritingQueryKey(id?: string) {
  return ["assistant-writing", id];
}

interface TGetAssistantWritingQuery {
  id?: string;
}

function useGetAssistantWriting(input: TGetAssistantWritingQuery) {
  const { isBeta: enabledChatSync, isReady } = useChatSyncFlag();

  return useQuery({
    enabled: !!input.id && isReady,
    queryFn: async () => {
      if (!input.id) {
        throw new Error("Can't load assistant writing");
      }

      const [error, assistantWriting] = enabledChatSync
        ? await assistantWritingClientService.getAssistantWritingByIdV2({
            id: input.id,
          })
        : await assistantWritingClientService.getAssistantWritingById({
            id: input.id,
          });

      if (error) {
        throw new THttpError(error);
      }

      return assistantWriting;
    },
    queryKey: getAssistantWritingQueryKey(input.id),
  });
}

export default useGetAssistantWriting;
