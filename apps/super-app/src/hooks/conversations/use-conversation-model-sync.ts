import { usePrevious } from "@uidotdev/usehooks";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { toast } from "sonner";

import type { ConversationModel } from "@/core/models/conversation";
import type { AIModelItem } from "@/core/models/model";
import { defaultChatModel } from "@/store/conversation/constants";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

interface TUseConversationModelSyncProps {
  conversationId?: string;
  conversationInfo: ConversationModel | null | undefined;
  isBeta: boolean;
}

/**
 * Hook to sync selected model with conversation's last used model.
 * Only active when isBeta = true (feature flag).
 *
 * Behavior (when isBeta = true):
 * - Existing conversation with lastModel/lastProvider: sync to that model
 * - Existing conversation without lastModel/lastProvider: keep current model
 * - New chat: reset to defaultChatModel (GPT-4o mini)
 *
 * Behavior (when isBeta = false):
 * - No changes to selected model (keep existing behavior)
 */
export function useConversationModelSync({
  conversationId,
  conversationInfo,
  isBeta,
}: TUseConversationModelSyncProps) {
  const conversationT = useTranslations("conversationPage");
  const chatModels = useGlobalState((state) => state.models);
  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const prevConversationId = usePrevious(conversationId);

  const setSelectedModel = useConversationState(
    (state) => state.setSelectedModel
  );

  // Handle new chat: reset to default model when navigating from conversation to new chat
  useEffect(() => {
    // Skip if feature flag is off
    if (!isBeta) {
      return;
    }

    const isNewChat = !conversationId;

    if (isNewChat && prevConversationId) {
      setSelectedModel(defaultChatModel);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, prevConversationId, isBeta]);

  // Handle existing conversation: sync model from conversation's lastModel/lastProvider
  useEffect(() => {
    // Skip if feature flag is off
    if (!isBeta) {
      return;
    }

    // Skip if new chat or no conversation info
    if (!conversationId || !conversationInfo) {
      return;
    }

    // Skip if conversation doesn't have last model info
    if (!conversationInfo.lastModel || !conversationInfo.lastProvider) {
      setSelectedModel(defaultChatModel);
      return;
    }

    // Skip if chat models haven't loaded yet
    if (!chatModels?.length) {
      return;
    }

    // Find the matching model from available models
    const matchingModel = findMatchingModel(
      chatModels,
      conversationInfo.lastModel,
      conversationInfo.lastProvider
    );

    if (!matchingModel) {
      toast.error(null, {
        description: conversationT("toast.error.modelUnAvailable", {
          model: defaultChatModel.title,
        }),
      });
      return;
    }

    setSelectedModel(matchingModel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    conversationId,
    conversationInfo,
    chatModels,
    isBeta,
    isValidPremiumUser,
  ]);
}

/**
 * Find a matching AIModelItem from the available models list
 */
function findMatchingModel(
  chatModels: { models: AIModelItem[] }[],
  lastModel: string,
  lastProvider: string
): AIModelItem | null {
  const allModels = chatModels.flatMap((group) => group.models);

  const matchingModel = allModels.find(
    (model) =>
      model.value === lastModel &&
      model.provider === lastProvider &&
      model.isActive
  );

  return matchingModel ?? null;
}
