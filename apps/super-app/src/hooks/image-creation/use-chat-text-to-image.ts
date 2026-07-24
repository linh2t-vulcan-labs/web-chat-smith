import type {
  TGetMessagesByConversationId,
  TMessageTemp,
  TSelectedAIArt,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { getConversationsQueryKey } from "@/hooks/conversations/use-get-conversations";
import { getMessagesQueryKey } from "@/hooks/conversations/use-get-messages";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { updateCacheMessagesInConversation } from "@/libs/react-query/utils";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { THttpError } from "@/utils/commons/error";
import { mapLatestMessageToSyncDTO } from "@/utils/mappers/conversations";

interface TChatTextToImageInput {
  messages: TMessageTemp[];
  conversationId: string;
  selectedAIArt: TSelectedAIArt;
  model?: string;
  isRegenerate?: boolean;
  enabledChatSync?: boolean;
  shouldSyncCrossPlatform?: boolean;
}

export const useChatTextToImage = () => {
  const queryClient = useQueryClient();

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  return useMutation({
    mutationFn: async (input: TChatTextToImageInput) => {
      const {
        messages,
        selectedAIArt,
        conversationId,
        model,
        isRegenerate,
        shouldSyncCrossPlatform = false,
        enabledChatSync = false,
      } = input;

      const userMessageForTextToImage =
        conversationUC.getLatestUserMessageForConversationMode(
          messages,
          "image_creation"
        );

      if (!userMessageForTextToImage) {
        return conversationUC.createTempMessage({
          prompt: "",
          role: "assistant",
          status: "error",
          type: "image_creation",
        });
      }

      let userPrompt = userMessageForTextToImage.content;
      let imageStyle = isRegenerate
        ? userMessageForTextToImage.imageCreationInfo?.style
        : selectedAIArt.value;

      // Determine sync cross-platform
      const sync = shouldSyncCrossPlatform
        ? mapLatestMessageToSyncDTO({
            conversationId,
            messageType: "text_to_image",
            messages: isRegenerate ? [] : messages,
            syncAllow: isRegenerate
              ? "SYNC_ALLOW_RESPONSE_ONLY"
              : "SYNC_ALLOW_REQUEST_AND_RESPONSE",
          })
        : undefined;

      // Need to get latest of assistant message when regenerate and isBeta is true
      if (isRegenerate && enabledChatSync) {
        const latestAssistantMessage =
          conversationUC.getLatestAssistantMessageForConversationMode(
            messages,
            "image_creation"
          );
        userPrompt =
          latestAssistantMessage?.contextJson?.textToImage?.generationPrompt ||
          "";
        imageStyle = "none";
      }

      const messageDto = conversationUC.transformMessageForTextToImage(
        userPrompt,
        conversationId,
        imageStyle,
        isRegenerate,
        model,
        sync,
        enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE"
      );

      const [error, result] =
        await conversationClientService.chatWithTextToImage(messageDto);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useChatTextToImage"],
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
      // Tracking ChatArtSuccessful
      sendTrackingEvent({
        name: EventKeys.ChatArtSuccessful,
        payload: {
          vulcan_status: "success",
          vulcan_user_id: user.id,
        },
      });
      queryClient.invalidateQueries({
        queryKey: getMessagesQueryKey(variables.conversationId),
      });
      queryClient.invalidateQueries({ queryKey: getConversationsQueryKey() });
    },
  });
};
