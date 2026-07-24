import type {
  TGetMessagesByConversationId,
  TMessageTemp,
  TSelectedAIArt,
  TSelectedFile,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { conversationUC, fileUC } from "@/core/usecases";
import { getConversationsQueryKey } from "@/hooks/conversations/use-get-conversations";
import { getMessagesQueryKey } from "@/hooks/conversations/use-get-messages";
import type { InfiniteData } from "@/libs/react-query";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { updateCacheMessagesInConversation } from "@/libs/react-query/utils";
import { THttpError } from "@/utils/commons/error";
import { mapLatestMessageToSyncDTO } from "@/utils/mappers/conversations";

interface TChatImageToImageInput {
  messages: TMessageTemp[];
  conversationId: string;
  selectedAIArt: TSelectedAIArt;
  selectedFiles: TSelectedFile[];
  isRegenerate?: boolean;
  model?: string;
  shouldSaveToLocalStorage?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
}

export const useChatImageToImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TChatImageToImageInput) => {
      const {
        messages,
        conversationId,
        selectedFiles: selectedFilesProps,
        selectedAIArt,
        isRegenerate,
        model,
        shouldSaveToLocalStorage = true,
        shouldSyncCrossPlatform,
        enabledChatSync,
      } = input;
      const userMessageForImageToImage =
        conversationUC.getLatestUserMessageWithType(messages, "image_creation");

      if (!userMessageForImageToImage) {
        return null;
      }

      const selectedFiles = isRegenerate
        ? fileUC.convertFileMessageToSelectedFile(
            userMessageForImageToImage.files
          )
        : selectedFilesProps;

      const aiArtPrompt = isRegenerate
        ? userMessageForImageToImage.imageCreationInfo?.style
        : selectedAIArt.value;

      // Determine sync cross-platform
      const sync = shouldSyncCrossPlatform
        ? mapLatestMessageToSyncDTO({
            conversationId,
            messageType: "image_to_image",
            messages,
            syncAllow: isRegenerate
              ? "SYNC_ALLOW_RESPONSE_ONLY"
              : "SYNC_ALLOW_REQUEST_AND_RESPONSE",
          })
        : undefined;

      const imageIds = selectedFiles.map((file) => file.fileId || "");
      const imageUrls = selectedFiles.map((file) => file.fileUrl || "");

      const messageDto = conversationUC.transformMessageForImageToImage(
        userMessageForImageToImage,
        conversationId,
        imageIds,
        aiArtPrompt,
        isRegenerate,
        model,
        sync,
        enabledChatSync
          ? "READ_SOURCE_CONVERSATION_NEXUS"
          : "READ_SOURCE_ENGINE"
      );

      const regenerateMessageDto =
        conversationUC.transformMessageForRegenerateImageToImage(
          userMessageForImageToImage,
          conversationId,
          imageUrls,
          aiArtPrompt,
          isRegenerate,
          model,
          sync,
          enabledChatSync
            ? "READ_SOURCE_CONVERSATION_NEXUS"
            : "READ_SOURCE_ENGINE"
        );

      const [error, result] = isRegenerate
        ? await conversationClientService.regenerateImageToImage(
            regenerateMessageDto,
            selectedFiles,
            shouldSaveToLocalStorage
          )
        : await conversationClientService.chatWithImageToImage(
            messageDto,
            selectedFiles,
            shouldSaveToLocalStorage
          );

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useChatImageToImage"],
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
    },
  });
};
