import type { TMessageTemp } from "@/core/models/conversation";
import { conversationUC } from "@/core/usecases";
import { useConversationState } from "@/store/conversation/hooks";
import { formattedSuggestion } from "@/utils/commons/string";
import { SUGGESTION_CONVERSATION_PROMPT } from "@/utils/constants/conversation";

import { useCreatePrediction } from "./use-create-prediction";

export const useHandleSuggestionMessages = () => {
  const setSuggestions = useConversationState((state) => state.setSuggestions);
  const selectedModel = useConversationState((state) => state.selectedModel);

  const createPredictionMutation = useCreatePrediction();

  const handleSuggestion = async (
    messages: TMessageTemp[],
    isEnabled: boolean
  ) => {
    if (!isEnabled) {
      return;
    }

    const latestUserMessage = conversationUC.getLastUserMessage(messages);

    if (!latestUserMessage) {
      return;
    }

    const data = await createPredictionMutation
      .mutateAsync({
        messages: [latestUserMessage],
        model: selectedModel.value,
        promptTemplate: SUGGESTION_CONVERSATION_PROMPT,
      })
      .catch(() => null);

    if (!data) {
      return;
    }

    const suggestions = formattedSuggestion(data.content);
    setSuggestions(suggestions);
  };

  return {
    handleSuggestion,
  };
};
