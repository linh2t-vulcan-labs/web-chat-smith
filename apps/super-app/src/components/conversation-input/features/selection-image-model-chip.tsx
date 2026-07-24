"use client";

import { IMAGE_MODELS } from "@/config/models";
import { useConversationUrlParams } from "@/hooks/conversations/query-params/conversation-url-params-context";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

import { SelectionImageModel } from "../../selection-image-model";
import type { TSelectionModelAIChipProps } from "./types";

export const SelectionImageModelChip: React.FC<TSelectionModelAIChipProps> = (
  props
) => {
  const { disabled } = props;
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const selectedImageModel = useConversationState(
    (state) => state.selectedImageModel
  );

  const { handleSelectImageModel, seenImageModels } =
    useConversationUrlParams();

  return (
    <SelectionImageModel
      models={IMAGE_MODELS}
      seenModels={seenImageModels}
      selectedModel={selectedImageModel}
      isPremiumUser={isValidPremiumUser}
      onModelSelect={handleSelectImageModel}
      disabled={disabled}
    />
  );
};
