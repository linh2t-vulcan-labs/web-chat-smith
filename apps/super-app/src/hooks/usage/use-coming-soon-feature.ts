import type { TMessageTemp } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { conversationUC } from "@/core/usecases";
import { useConversationStore } from "@/store/conversation/hooks";

interface TUseComingSoonFeatureOptions {
  messages: TMessageTemp[];
  conversationMode: EConversationMode;
  isRegenerate?: boolean;
}

export const useComingSoonFeature = () => {
  const conversationStore = useConversationStore();

  const handleCheckComingSoonFeature = (
    options: TUseComingSoonFeatureOptions
  ): boolean => {
    const { conversationMode, messages, isRegenerate } = options;
    switch (conversationMode) {
      case EConversationMode.AI_ART: {
        const conversationId = conversationStore.getState().selectedId;
        const { userInput } = conversationStore.getState();

        const selectedAttachments = conversationStore.getState().selectedFiles;
        const isExistFiles = selectedAttachments.length > 0;
        const { selectedAIArt } = conversationStore.getState();

        if (!isExistFiles || isRegenerate) {
          return false;
        }

        const userMessage = conversationUC.createTempMessage({
          imageStyle: selectedAIArt?.title,
          prompt: userInput,
          role: "user",
          type: "image_creation",
        });
        const comingSoonMessage = conversationUC.createTempMessage({
          prompt: "",
          role: "assistant",
          status: "comingSoon",
          type: "image_creation",
        });

        const updatedMessage = [...messages, userMessage, comingSoonMessage];
        conversationStore.getState().setConversationStates(conversationId, {
          isNew: false,
          messages: updatedMessage,
          status: "submitted",
        });
        conversationStore.getState().initialConversationInput();

        return true;
      }
      default: {
        return false;
      }
    }
  };

  return { handleCheckComingSoonFeature };
};
