import { GetCitationParamsDTO } from "@/core/http/dto/conversation";
import { conversationClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";
import { HTTP_STATUS } from "@/utils/constants/http";

interface TGetCitationsQueryParams {
  conversationId: string;
  messageId: string;
}

export const useGetCitations = (params: TGetCitationsQueryParams) => {
  const { isBeta: enabledChatSync } = useChatSyncFlag();

  return useQuery({
    enabled: false,
    queryFn: () => {
      const payload = new TransformerBuilder(GetCitationParamsDTO)
        .format(params, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        })
        .toPlainSnakeCase() as GetCitationParamsDTO;

      return enabledChatSync
        ? conversationClientService.getInfoCitationsV2(payload)
        : conversationClientService.getInfoCitations(payload);
    },
    queryKey: ["useGetCitations", params],
    select: (response) => {
      const [error, data] = response;

      if (error) {
        throw new THttpError({
          error,
          message: error.message,
          status: HTTP_STATUS.BAD_REQUEST,
        });
      }

      return data;
    },
  });
};
