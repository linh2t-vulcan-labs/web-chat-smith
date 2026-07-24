"use client";

import { useConversationUrlParams } from "@/hooks/conversations/query-params/conversation-url-params-context";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

import { SelectionModel } from "../../selection-model";
import type { TSelectionModelAIChipProps } from "./types";

export const SelectionModelAIChip: React.FC<TSelectionModelAIChipProps> = (
  props
) => {
  const { disabled } = props;
  const models = useGlobalState((state) => state.models);
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const selectedModel = useConversationState((state) => state.selectedModel);

  const { handleSelectChatModel, seenChatModels } = useConversationUrlParams();

  return (
    <SelectionModel
      models={models}
      seenModels={seenChatModels}
      selectedModel={selectedModel}
      isPremiumUser={isValidPremiumUser}
      onModelSelect={handleSelectChatModel}
      disabled={disabled}
    />
  );
};
