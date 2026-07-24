"use client";

import type { TSelectionModelAIChipProps } from "@/components/conversation-input/features/types";
import { SelectionModelGuest } from "@/features/guest-mode/components/selection-model-guest";
import { useGlobalState } from "@/store/global/hooks";

import { useGuestConversationUrlParams } from "../../hooks/query-params";
import { useFeatureGating } from "../../hooks/use-feature-gating";
import { useGuestState } from "../../stores/guest-mode/hooks";

export const SelectionModelAIChip: React.FC<
  TSelectionModelAIChipProps
> = () => {
  const { showLoginModal } = useFeatureGating();
  const models = useGlobalState((state) => state.models);
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const selectedModel = useGuestState((state) => state.selectedModel);

  const { handleSelectChatModel } = useGuestConversationUrlParams();

  const handleSignIn = () => {
    showLoginModal("model");
  };

  return (
    <SelectionModelGuest
      models={models}
      selectedModel={selectedModel}
      isPremiumUser={isValidPremiumUser}
      isGuestUser
      onModelSelect={handleSelectChatModel}
      onSignIn={handleSignIn}
    />
  );
};
