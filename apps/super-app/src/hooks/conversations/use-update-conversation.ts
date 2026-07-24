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
import { recordLastChatAt } from "@/utils/commons/helpers";
import { FileManager } from "@/utils/file-manager";

import { getConversationsQueryKey } from "./use-get-conversations";
import { getMessagesQueryKey } from "./use-get-messages";

interface TUpdateConversationQuery {
  conversationId: string;
  convId?: string;
  messages: TMessageTemp[];
  model: EAIValueModel;
  provider: EAIProviderModel;
  type?: "usecase" | "chat";
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  useMemory?: boolean;
}

export function useUpdateConversation() {
  const queryClient = useQueryClient();
  // For Tracking
  const user = useGlobalState((state) => state.user);
  const selectedCustomResponse = useGlobalState(
    (state) => state.selectedCustomResponse
  );
  const { sendTrackingEvent } = useSendTrackingEvent();

  const handleAttachmentHasFileType = (hasPdf: boolean, hasImg: boolean) => {
    if (hasPdf) {
      sendTrackingEvent({
        name: EventKeys.ChatWithFile,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    }
    if (hasImg) {
      sendTrackingEvent({
        name: EventKeys.ChatWithImageSend,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    }
  };

  return useMutation({
    mutationFn: async (input: TUpdateConversationQuery) => {
      let selectedCustomResponseTemp = selectedCustomResponse;

      if (input.type === "usecase") {
        selectedCustomResponseTemp = null;
      }

      // calculate totalToken
      const totalTokens = conversationUC.getTotalTokenByMessages({
        messages: input.messages,
      });
      // trim old messages if totalToken > maxToken
      const trimmedMessages = conversationUC.trimOldMessagesByToken({
        messages: input.messages,
        totalTokens,
      });

      const messagesDto = conversationUC.transformMessageBeforeSend(
        trimmedMessages,
        {
          model: input.model,
          provider: input.provider,
        }
      );

      // Tracking Event
      FileManager.handleDetectFileTypes(
        messagesDto,
        handleAttachmentHasFileType
      );
      const [error, assistantMsg] =
        await conversationClientService.updateConversationMessages(
          {
            ...messagesDto,
            convId: input.convId,
            id: input.conversationId,
            readSource: input.enabledChatSync
              ? "READ_SOURCE_CONVERSATION_NEXUS"
              : "READ_SOURCE_ENGINE",
            selectedCustomResponse: selectedCustomResponseTemp,
            shouldSyncCrossPlatform: input.shouldSyncCrossPlatform,
            useMemory: input.useMemory,
          },
          {
            originInput: input.messages,
          }
        );

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
      recordLastChatAt(user.id);
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });
    },
  });
}
