import { conversationUC } from "@/core/usecases";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { THttpError } from "@/utils/commons/error";
import { CONVERSATION_ERROR_REASON } from "@/utils/constants/error";

import type { TMessageTemp } from "../models/conversation";
import { useGuestState } from "../stores/guest-mode/hooks";
import { useGuestChat } from "./use-guest-chat";

export interface TConversationActions {
  initialMessages: TMessageTemp[];
}

function useGuestConversation({ initialMessages }: TConversationActions) {
  //Guest Mode
  const guestId = useGuestState((state) => state.anonId);
  const conversationState = useGuestState((state) => state.conversationState);
  const selectedModel = useGuestState((state) => state.selectedModel);
  const setConversationState = useGuestState(
    (state) => state.setConversationState
  );
  const setIsFetching = useGuestState((state) => state.setIsFetching);
  // API Mutations
  const guestChatMutation = useGuestChat();

  // Others
  const { status } = conversationState;
  const { messages } = conversationState;
  const { sendTrackingEvent } = useSendTrackingEvent();

  const prepareConversation = (prompt: string) => {
    const userMessage = conversationUC.createTempMessage({
      prompt,
      role: "user",
      type: "chat",
    });

    const assistantTempMessage = conversationUC.createTempMessage({
      prompt: "",
      role: "assistant",
      status: "pending",
      type: "chat",
    });

    const messages = [...initialMessages, userMessage, assistantTempMessage];

    return { assistantTempMessage, messages, userMessage };
  };

  const handleCreateConversation = async (prompt: string) => {
    const preparation = prepareConversation(prompt);
    setIsFetching(true);
    setConversationState({
      messages: preparation.messages,
    });

    try {
      const assistantMessage = await guestChatMutation.mutateAsync({
        messages: preparation.messages,
        model: selectedModel.value,
        provider: selectedModel.provider,
      });

      // Tracking Event GuestChatResponse
      if (assistantMessage && guestId) {
        sendTrackingEvent({
          name: EventKeys.GuestChatResponse,
          payload: {
            guest_id: guestId,
          },
        });
      }

      const updatedMessages = preparation.messages.map((msg) => {
        if (msg.status === "pending") {
          return { ...assistantMessage };
        }
        return msg;
      });

      setConversationState({
        messages: updatedMessages,
        status: "submitted",
      });
      setIsFetching(false);
    } catch (error) {
      if (
        error instanceof THttpError &&
        error.error?.reason === CONVERSATION_ERROR_REASON.REACHED_LIMIT
      ) {
        const messagesWithoutAssistant = preparation.messages.slice(0, -1);
        setConversationState({
          messages: messagesWithoutAssistant,
          status: "reachedLimit",
        });
        // Tracking Event GuestChatFreeHitLimit
        if (guestId) {
          sendTrackingEvent({
            name: EventKeys.GuestChatFreeHitLimit,
            payload: {
              guest_id: guestId,
            },
          });
        }
        return;
      }

      const errorMessage = conversationUC.markLastAssistantMessageAsError(
        preparation.messages
      );
      setConversationState({
        messages: errorMessage,
        status: "error",
      });
    }
  };

  return {
    handleCreateConversation,
    messages,
    status,
  };
}

export default useGuestConversation;
