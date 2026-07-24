import type {
  TGetMessagesByConversationId,
  TMessageTemp,
} from "@/core/models/conversation";
import type { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { useMutation, useQueryClient } from "@/libs/react-query";
import type { InfiniteData } from "@/libs/react-query";
import {
  updateCacheMessagesInConversation,
  updateMessagesQuery,
} from "@/libs/react-query/utils";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { THttpError } from "@/utils/commons/error";

import { getConversationsQueryKey } from "./use-get-conversations";
import { getMessagesQueryKey } from "./use-get-messages";

const formatPromptByReplacements = (
  template: string,
  replacements: Record<string, string>
) => {
  let result = template;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replaceAll(new RegExp(key, "gu"), value);
  }
  return result;
};

const getReplacements = (messages: TMessageTemp[]) => {
  const acc: Record<string, string> = {};
  const userMessages = messages.filter((msg) => msg.role === "user");
  let index = 0;
  for (const msg of userMessages) {
    acc[`input${index + 1}`] = msg.content;
    index += 1;
  }
  return acc;
};

interface TCreateConversationQuery {
  id: string;
  messages: TMessageTemp[];
  promptTemplate: string;
  model: EAIValueModel;
  provider: EAIProviderModel;
  shouldSyncCrossPlatform?: boolean;
}

export function useCreateUseCases() {
  const queryClient = useQueryClient();
  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  return useMutation({
    mutationFn: async (input: TCreateConversationQuery) => {
      const {
        messages,
        shouldSyncCrossPlatform = false,
        ...restInfoInput
      } = input;
      const messageDto = conversationUC.transformMessageBeforeSend(messages, {
        ...restInfoInput,
      });

      // Update message by ConversationId without vendor, no response from AI
      const [messageError] =
        await conversationClientService.updateConversationMessagesWithoutVendor(
          {
            id: input.id,
            ...messageDto,
          }
        );

      if (messageError) {
        throw new THttpError(messageError);
      }

      // Create final prompt with template prompt
      const replacements = getReplacements(input.messages);
      const prompt = formatPromptByReplacements(
        input.promptTemplate,
        replacements
      );
      // Get final prompt to update message By ConversationId
      const tempDeveloperMsg = conversationUC.createTempMessage({
        prompt,
        role: "developer",
        type: "chat",
      });

      queryClient.setQueryData<InfiniteData<TGetMessagesByConversationId>>(
        getMessagesQueryKey(input.id),
        (oldData) => updateMessagesQuery(oldData, input.messages)
      );

      const developerMessageDto = conversationUC.transformMessageBeforeSend(
        [tempDeveloperMsg],
        {
          ...restInfoInput,
        }
      );

      const [assistantError, assistantMsg] =
        await conversationClientService.updateUsecaseMessages(
          {
            id: input.id,
            ...developerMessageDto,
            shouldSyncCrossPlatform,
          },
          {
            originInput: [...messages, tempDeveloperMsg],
          }
        );

      if (assistantError) {
        throw new THttpError(assistantError);
      }
      const fullMessages = conversationUC.updateAssistantTempMessage(
        input.messages,
        assistantMsg
      );

      queryClient.setQueryData<InfiniteData<TGetMessagesByConversationId>>(
        getMessagesQueryKey(input.id),
        (oldData) => updateMessagesQuery(oldData, fullMessages)
      );

      return assistantMsg;
    },
    onError: () => {
      // Tracking ChatResponse
      sendTrackingEvent({
        name: EventKeys.ChatResponse,
        payload: {
          vulcan_status: "failed",
          vulcan_user_id: user.id,
        },
      });
    },
    onMutate: (input: TCreateConversationQuery) => {
      const previousData = queryClient.getQueryData<
        InfiniteData<TGetMessagesByConversationId>
      >(getMessagesQueryKey(input.id));
      const flattedData: TMessageTemp[] = previousData
        ? previousData.pages.flatMap((page) => page.data as TMessageTemp[])
        : [];

      const previousMessages: TMessageTemp[] = [...flattedData].toReversed();

      const updatedMessages = input.messages;

      updateCacheMessagesInConversation(queryClient, input.id, updatedMessages);

      // Return a context object with the snapshotted value
      return { conversationId: input.id, previousMessages };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
      // Tracking ChatResponse
      sendTrackingEvent({
        name: EventKeys.ChatResponse,
        payload: {
          vulcan_status: "success",
          vulcan_user_id: user.id,
        },
      });
    },
  });
}
