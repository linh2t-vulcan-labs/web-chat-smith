import React, { useEffect, useState } from "react";

import { WelcomeSuggestion } from "@/components/welcome-suggestion";
import {
  LIMIT_ICON_ITEMS,
  LIMIT_IMAGE_ITEMS,
} from "@/components/welcome-suggestion/consts";
import type { TSuggestionCard } from "@/components/welcome-suggestion/welcome-suggestion";
import { IMAGE_MODELS } from "@/config/models";
import { EConversationMode } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import useConversationActions from "@/hooks/conversations/use-conversation-actions";
import { useValidateChat } from "@/hooks/usage/use-validate-chat";
import { useConversationSuggestions } from "@/hooks/use-conversation-suggestions";
import { useMatchRoute } from "@/hooks/use-match-route";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

const WelcomeConversation = () => {
  // Global state
  const user = useGlobalState((state) => state.user);
  const matchConversationExact = useMatchRoute("/conversation");
  const initialConversationInput = useConversationState(
    (state) => state.initialConversationInput
  );
  const setUserInput = useConversationState((state) => state.setUserInput);
  const setMode = useConversationState((state) => state.setMode);
  const setSelectedImageModel = useConversationState(
    (state) => state.setSelectedImageModel
  );
  const setIsOpenUploadFileModal = useConversationState(
    (state) => state.setIsOpenUploadFileModal
  );
  const { handleCreateConversation } = useConversationActions({
    initialMessages: [],
  });
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { handleValidateChat } = useValidateChat();

  // Get suggestions from Remote Config
  const suggestionsFromConfig = useConversationSuggestions();
  const [suggestions, setSuggestions] = useState<TSuggestionCard[]>([]);

  const imageItems = suggestions
    .filter((suggestion) => suggestion.type === "image" && suggestion.isEnabled)
    .slice(0, LIMIT_IMAGE_ITEMS);
  const iconItems = suggestions
    .filter((suggestion) => suggestion.type === "icon" && suggestion.isEnabled)
    .slice(0, LIMIT_ICON_ITEMS);

  const handleImageToImageAction = (suggestion: TSuggestionCard) => {
    setUserInput(suggestion.prompt);
    setMode(EConversationMode.AI_ART);
    setIsOpenUploadFileModal(true);
  };

  const handleTextToImageAction = (suggestion: TSuggestionCard) => {
    const defaultImageModel = IMAGE_MODELS.find(
      (model) => model.value === EAIValueModel.GPT_Image_2
    );

    if (!defaultImageModel) {
      console.error("Default image model not found");
      return;
    }

    setUserInput(suggestion.prompt);
    setMode(EConversationMode.AI_ART);
    setSelectedImageModel(defaultImageModel);

    const isNotValidChat = handleValidateChat({
      conversationMode: EConversationMode.AI_ART,
      messages: [],
    });

    if (isNotValidChat) {
      return;
    }

    initialConversationInput();

    handleCreateConversation({
      mode: EConversationMode.AI_ART,
      prompt: suggestion.prompt,
      type: "chat",
    });
  };

  const handleChatAction = (suggestion: TSuggestionCard) => {
    handleCreateConversation({
      mode: EConversationMode.CHAT,
      prompt: suggestion.prompt,
      type: "chat",
    });
  };

  const handleDeepResearchAction = (suggestion: TSuggestionCard) => {
    setUserInput(suggestion.prompt);
    setMode(EConversationMode.DEEP_RESEARCH);
  };

  const actionHandlers = {
    deep_research: handleDeepResearchAction,
    fun_social: handleChatAction,
    image_to_image: handleImageToImageAction,
    info_query: handleChatAction,
    text_to_image: handleTextToImageAction,
  } as const;

  const handleClickSuggestion = (suggestion: TSuggestionCard) => {
    const handler = actionHandlers[suggestion.actionType];

    if (handler) {
      handler(suggestion);
    }

    if (user.id) {
      sendTrackingEvent({
        name: EventKeys.NewSuggestionsClick,
        payload: { vulcan_user_id: user.id },
      });
    }
  };

  // Generate suggestions only on client-side to avoid hydration mismatch
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- defers randomized suggestions to a client-only effect specifically to avoid an SSR/client hydration mismatch, not a render derivation
    setSuggestions(suggestionsFromConfig);
  }, [suggestionsFromConfig]);

  if (!matchConversationExact) {
    return null;
  }

  return (
    <div className="flex size-full justify-center md:items-start">
      <div className="gap-medium-3 flex w-full flex-1 flex-col md:max-w-[600px]">
        <WelcomeSuggestion
          imageItems={imageItems}
          iconItems={iconItems}
          onClickSuggestion={handleClickSuggestion}
        />
      </div>
    </div>
  );
};

export default WelcomeConversation;
