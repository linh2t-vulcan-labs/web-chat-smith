import { useTranslations } from "next-intl";
import { toast } from "sonner";

import type {
  TMessageTemp,
  TSelectedAIArt,
  TSelectedFile,
  TTracingProcessResponse,
} from "@/core/models/conversation";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useChatTextToImage } from "@/hooks/image-creation/use-chat-text-to-image";
import { useHandleChatImageToImage } from "@/hooks/image-creation/use-handle-chat-image-to-image";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import type { THttpError } from "@/utils/commons/error";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";
import { HTTP_STATUS } from "@/utils/constants/http";

import { useConversationUrlParams } from "../conversations/query-params";

interface THandleStartChatImageCreationOptions {
  files?: TSelectedFile[];
  selectedAIArt?: TSelectedAIArt;
  messages: TMessageTemp[];
  conversationId: string;
  isRegenerate?: boolean;
  model?: string;
  shouldSaveToLocalStorage?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  onSuccess?: (result: TTracingProcessResponse) => void;
  onError?: (error?: unknown) => void;
  onErrorChat?: (error?: unknown) => void;
}

export const useChatImageCreation = () => {
  const conversationT = useTranslations("conversationPage");
  const { isBeta: enabledChatSync } = useChatSyncFlag();
  const { handleSetSeenImageModels } = useConversationUrlParams();
  const { handleStartChatImageToImage } = useHandleChatImageToImage();
  const chatTextToImageMutation = useChatTextToImage();

  const selectedAIArt = useConversationState((state) => state.selectedAIArt);
  const selectedFiles = useConversationState((state) => state.selectedFiles);
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );

  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const setConversationErrorState = useConversationState(
    (state) => state.setConversationErrorState
  );

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const handleErrorImageCreation = (
    rawError: unknown,
    messages: TMessageTemp[],
    conversationId: string
  ): null => {
    const error = rawError as THttpError | undefined;
    if (error?.error?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT) {
      // Tracking ChatArtHitLimit
      sendTrackingEvent({
        name: EventKeys.ChatArtHitLimit,
        payload: {
          vulcan_user_id: user.id,
        },
      });

      const updatedMessage: TMessageTemp[] = messages.map((message, index) => {
        if (index === messages.length - 1) {
          return {
            ...message,
            content: "Limit reached. Limit is reset after 3 hours",
            status: "reachedLimit",
            type: "image_creation",
          };
        }

        return message;
      });
      setConversationStates(conversationId, {
        isNew: false,
        messages: updatedMessage,
        status: "submitted",
      });
      return null;
    }

    // CHATS-1329: Only catch error when chat sync enable
    if (
      enabledChatSync &&
      (error?.status === HTTP_STATUS.CONFLICT || error?.error?.code === 6)
    ) {
      toast.info(null, {
        description: conversationT("toast.error.conversationUpdated"),
      });
      setTimeout(() => {
        globalThis.location.reload();
      }, 1000);
      return null;
    }

    const updatedMessage: TMessageTemp[] = messages.map((message, index) => {
      if (index === messages.length - 1) {
        return {
          ...message,
          content: error?.error?.message ?? "",
        };
      }

      return message;
    });

    setConversationErrorState(conversationId, updatedMessage);
    return null;
  };

  const handleStartChatImageCreation = async (
    options: THandleStartChatImageCreationOptions
  ) => {
    const {
      messages,
      conversationId,
      selectedAIArt: selectedAIArtProps,
      isRegenerate,
      model,
      files,
      shouldSaveToLocalStorage = true,
      shouldSyncCrossPlatform = false,
      enabledChatSync = false,
      onError,
      onErrorChat,
      onSuccess,
    } = options;
    let temporaryFiles: TSelectedFile[] = [];
    handleSetSeenImageModels(selectedImageModel);

    if (files && files.length > 0) {
      temporaryFiles = files;
    }

    if (selectedFiles && selectedFiles.length > 0) {
      temporaryFiles = selectedFiles;
    }

    const userMessageForImageToImage =
      conversationUC.getLatestUserMessageWithType(messages, "image_creation");

    const hasPreviousFile =
      userMessageForImageToImage?.files?.length !== undefined &&
      userMessageForImageToImage.files.length > 0;

    const isExistFile = isRegenerate
      ? hasPreviousFile
      : temporaryFiles.length > 0;

    if (isExistFile) {
      //Tracking ChatArtType image2image case
      sendTrackingEvent({
        name: EventKeys.ChatArtType,
        payload: {
          model,
          vulcan_type: "image2image",
          vulcan_user_id: user.id,
        },
      });

      const response = await handleStartChatImageToImage({
        conversationId,
        enabledChatSync,
        isRegenerate,
        messages,
        model,
        onErrorChat: (error) => {
          onErrorChat?.(error);
          handleErrorImageCreation(error, messages, conversationId);
          return null;
        },
        onErrorTracing: onError,
        onSuccess,
        selectedAIArt: selectedAIArtProps || selectedAIArt,
        selectedFiles: temporaryFiles,
        shouldSaveToLocalStorage,
        shouldSyncCrossPlatform,
      });
      if (!response?.message) {
        return null;
      }

      return response.message;
    }
    //Tracking ChatArtType text2image case
    sendTrackingEvent({
      name: EventKeys.ChatArtType,
      payload: {
        model,
        vulcan_type: "text2image",
        vulcan_user_id: user.id,
      },
    });
    try {
      return await chatTextToImageMutation.mutateAsync({
        conversationId,
        enabledChatSync,
        isRegenerate,
        messages,
        model,
        selectedAIArt,
        shouldSyncCrossPlatform,
      });
    } catch (error) {
      return handleErrorImageCreation(error, messages, conversationId);
    }
  };

  return { handleStartChatImageCreation };
};
