import type {
  TGetMessagesByConversationId,
  TMessageTemp,
} from "@/core/models/conversation";
import type { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { updateCacheMessagesInConversation } from "@/libs/react-query/utils";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { THttpError } from "@/utils/commons/error";
import { DEFAULT_CUSTOM_RESPONSE } from "@/utils/constants/common";

import { getConversationsQueryKey } from "./use-get-conversations";
import { getMessagesQueryKey } from "./use-get-messages";

interface TRegenerateMessageQuery {
  conversationId: string;
  convId?: string;
  messages: TMessageTemp[];
  model: EAIValueModel;
  provider: EAIProviderModel;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  useMemory?: boolean;
}

export function useRegenerateMessage() {
  const queryClient = useQueryClient();
  const user = useGlobalState((state) => state.user);
  const selectedCustomResponse = useGlobalState(
    (state) => state.selectedCustomResponse
  );
  const { sendTrackingEvent } = useSendTrackingEvent();

  return useMutation({
    mutationFn: async (input: TRegenerateMessageQuery) => {
      const getItemsUntilLastUserRole =
        conversationUC.getItemsUntilLastUserRole({
          messages: input.messages,
        });

      // calculate totalToken
      const totalTokens = conversationUC.getTotalTokenByMessages({
        messages: getItemsUntilLastUserRole,
      });

      // trim old messages if totalToken > maxToken
      const trimmedMessage = conversationUC.trimOldMessagesByToken({
        messages: getItemsUntilLastUserRole,
        totalTokens,
      });

      const messagesDTO = conversationUC.transformMessageBeforeSend(
        trimmedMessage,
        {
          model: input.model,
          provider: input.provider,
        }
      );

      const [error, assistantMsg] =
        await conversationClientService.createRegenerateMessage({
          convId: input.convId,
          id: input.conversationId,
          originalMessages: input.messages,
          readSource: input.enabledChatSync
            ? "READ_SOURCE_CONVERSATION_NEXUS"
            : "READ_SOURCE_ENGINE",
          selectedCustomResponse:
            selectedCustomResponse || DEFAULT_CUSTOM_RESPONSE, // Note: remove default custom response after backend support
          shouldSyncCrossPlatform: input.shouldSyncCrossPlatform,
          useMemory: input.useMemory,
          ...messagesDTO,
        });

      // Tracking ChatResponse
      sendTrackingEvent({
        name: EventKeys.ChatResponse,
        payload: {
          vulcan_status: error ? "failed" : "success",
          vulcan_user_id: user.id,
        },
      });

      if (error) {
        throw new THttpError(error);
      }

      return assistantMsg;
    },
    onError: (error: THttpError, _newMessages, context) => {
      if (context?.conversationId && context?.previousMessages) {
        updateCacheMessagesInConversation(
          queryClient,
          context.conversationId,
          context.previousMessages
        );
      }

      return error;
    },
    onMutate: (input) => {
      const previousData = queryClient.getQueryData<
        InfiniteData<TGetMessagesByConversationId>
      >(getMessagesQueryKey(input.conversationId));

      const flattedData: TMessageTemp[] = previousData
        ? previousData.pages.flatMap((page) => page.data as TMessageTemp[])
        : [];

      const previousMessages: TMessageTemp[] = [...flattedData].toReversed();

      // Return a context object with the snapshotted value
      return { conversationId: input.conversationId, previousMessages };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });
    },
  });
}
