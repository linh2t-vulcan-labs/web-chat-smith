import { useTranslations } from "next-intl";

import { ChatTracingImageToImageProcessDTO } from "@/core/http/dto/conversation";
import type {
  TMessageTemp,
  TSelectedAIArt,
  TSelectedFile,
  TTracingProcessResponse,
} from "@/core/models/conversation";
import { conversationClientService } from "@/core/repositories";
import { E_PERMISSION_REQUEST_TYPE } from "@/features/notification/enum/permission";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useChatImageToImage } from "@/hooks/image-creation/use-chat-image-to-image";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQueryClient } from "@/libs/react-query";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import type { THttpError } from "@/utils/commons/error";
import { startPolling } from "@/utils/commons/polling";
import { defaultConversationState } from "@/utils/constants/conversation";

import { registerTracingController } from "../conversations/use-conversation-tracing";
import { getMessagesQueryKey } from "../conversations/use-get-messages";

export interface THandleStartChatImageToImageOptions {
  messages: TMessageTemp[];
  conversationId: string;
  selectedAIArt: TSelectedAIArt;
  selectedFiles: TSelectedFile[];
  isRegenerate?: boolean;
  model?: string;
  shouldSaveToLocalStorage?: boolean;
  shouldSyncCrossPlatform?: boolean;
  enabledChatSync?: boolean;
  onSuccess?: (result: TTracingProcessResponse) => void;
  onErrorTracing?: (error?: unknown) => void;
  onErrorChat?: (error?: unknown) => null;
}

const INTERVAL_TIME = 5 * 1000; // 5s
const TIMEOUT = 1000 * 60 * 10; // 10 minutes

export const useHandleChatImageToImage = () => {
  const conversationT = useTranslations("conversationPage");
  const queryClient = useQueryClient();

  const chatImageToImageMutation = useChatImageToImage();
  const conversationStore = useConversationStore();

  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const setConversationWarningState = useConversationState(
    (state) => state.setConversationWarningState
  );
  const setConversationCancelledState = useConversationState(
    (state) => state.setConversationCancelledState
  );
  const { canShowSoftPermission, setConfirmToastState } = useNotification();

  const handleStartChatImageToImage = async (
    options: THandleStartChatImageToImageOptions
  ) => {
    const {
      messages,
      conversationId,
      isRegenerate,
      shouldSaveToLocalStorage = true,
      shouldSyncCrossPlatform = false,
      selectedAIArt,
      selectedFiles,
      model,
      enabledChatSync,
      onSuccess,
      onErrorTracing,
      onErrorChat,
    } = options;
    const response = await chatImageToImageMutation
      .mutateAsync({
        conversationId,
        enabledChatSync,
        isRegenerate,
        messages,
        model,
        selectedAIArt,
        selectedFiles,
        shouldSaveToLocalStorage,
        shouldSyncCrossPlatform,
      })
      .catch((error: THttpError) => onErrorChat?.(error));

    if (!response) {
      return;
    }

    const { processId } = response;

    const currentState =
      conversationStore.getState().conversationStates[conversationId] ||
      defaultConversationState;
    const currentMessages = currentState.messages;
    const updatedMessage: TMessageTemp[] = currentMessages.map(
      (message, index) => {
        if (index === currentMessages.length - 1) {
          return {
            ...message,
            status: "pending",
            type: "image_creation",
          };
        }

        return message;
      }
    );

    setConversationStates(conversationId, {
      isNew: false,
      messages: updatedMessage,
      processId,
      status: "polling",
    });

    const queryProcessDto = new TransformerBuilder(
      ChatTracingImageToImageProcessDTO
    )
      .format(
        {
          conversationId,
          processId,
          readSource: enabledChatSync
            ? "READ_SOURCE_CONVERSATION_NEXUS"
            : "READ_SOURCE_ENGINE",
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatTracingImageToImageProcessDTO;

    // [Notification] Show soft request
    if (canShowSoftPermission()) {
      setConfirmToastState(
        true,
        E_PERMISSION_REQUEST_TYPE.NOTIFICATION_LONG_RUNNING_TASK,
        {
          triggerName: "create_image",
        }
      );
    }

    return new Promise<TTracingProcessResponse>((resolve, reject) => {
      const controller = startPolling({
        fetcher: async () => {
          const [error, data] =
            await conversationClientService.getTracingImageToImageProgress(
              queryProcessDto
            );
          if (error || !data) {
            throw error || new Error("No data received");
          }
          return data;
        },
        interval: INTERVAL_TIME,
        onError: (error) => {
          onErrorTracing?.(error);
          reject(error instanceof Error ? error : new Error("Unknown error"));
        },
        onSuccess: (data) => {
          const { message, status } = data;

          if (status === "failed") {
            const { failedReason } = data;
            setConversationWarningState(conversationId, messages, failedReason);
            return;
          }

          if (status === "canceled") {
            setConversationCancelledState(
              conversationId,
              messages ?? [],
              conversationT("messageAnswersSkipped")
            );
          }

          if (message && status === "done") {
            queryClient.invalidateQueries({
              queryKey: getMessagesQueryKey(conversationId),
            });
          }

          onSuccess?.(data);
          resolve(data);
        },
        timeout: TIMEOUT,
        validate: (result) => result?.status !== "in_progress",
      });
      if (controller?.stop) {
        registerTracingController(conversationId, controller.stop);
      }
    });
  };

  return { handleStartChatImageToImage };
};
