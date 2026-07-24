import { getPublicEnv } from "@cs/env/client";

import type { TUpdateMessageDTO } from "@/core/http/dto/conversation";
import { conversationUC } from "@/core/usecases";
import { useHttpClient } from "@/hooks/http-client";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";
import { mapDtoToUpdateMessage } from "@/utils/mappers/conversations";

import type { EAIProviderModel, EAIValueModel } from "../models";
import type { TMessageTemp } from "../models/conversation";

interface TGuestChatQuery {
  messages: TMessageTemp[];
  model: EAIValueModel;
  provider: EAIProviderModel;
}

export const useGuestChat = () => {
  const { httpClient } = useHttpClient("guest");

  return useMutation({
    mutationFn: async (input: TGuestChatQuery) => {
      const inputDto = conversationUC.transformMessageBeforeSend(
        input.messages,
        {
          nsfw_check: true,
        }
      );

      const [error, result] = await httpClient.post<TUpdateMessageDTO>(
        "/api/v1/guest/web/chat",
        {
          baseURL: getPublicEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL,
          body: inputDto,
        }
      );

      if (error) {
        throw new THttpError(error);
      }

      const data = mapDtoToUpdateMessage(result);

      return data;
    },
    mutationKey: ["use-guest-chat"],
  });
};
