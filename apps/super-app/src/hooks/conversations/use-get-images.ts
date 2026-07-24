import { useQuery } from "@tanstack/react-query";

import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { THttpError } from "@/utils/commons/error";

interface TGetImagesQuery {
  id?: string;
  limit: number;
}

function getImagesQueryKey(id?: string) {
  return ["images", id];
}

export function useGetImages(input: TGetImagesQuery) {
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  return useQuery({
    enabled: !!input.id,
    queryFn: async () => {
      if (!input.id) {
        throw new Error("Can't load images of conversation");
      }

      const [error, result] = enabledChatSync
        ? await conversationClientService.getImagesByIdV2({
            id: input.id,
            limit: input.limit,
            next_id: "",
          })
        : await conversationClientService.getImagesById({
            id: input.id,
            limit: input.limit,
            next_id: "0",
          });

      if (error) {
        throw new THttpError(error);
      }

      if (!result.data.length) {
        return [];
      }

      return result.data;
    },
    queryKey: getImagesQueryKey(input.id),
  });
}
