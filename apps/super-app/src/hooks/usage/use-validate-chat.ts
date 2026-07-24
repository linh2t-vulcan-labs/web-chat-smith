import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { EConversationMode } from "@/core/models/conversation";
import type { TMessageTemp, TMessageType } from "@/core/models/conversation";
import type { TChatFreeUsage } from "@/core/models/usage";
import { conversationUC } from "@/core/usecases";
import type { TOnBlocked } from "@/hooks/usage/use-block-feature";
import { useBlockFeature } from "@/hooks/usage/use-block-feature";
import { useComingSoonFeature } from "@/hooks/usage/use-coming-soon-feature";
import type { TDSAutoOpenSource } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { defaultChatModel } from "@/store/conversation/constants";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import type { TPurchaseSource } from "@/utils/commons/types";
import {
  defaultConversationState,
  FREE_USER_DIALOG_TRIGGERS,
} from "@/utils/constants/conversation";

import { useGetFloatingUpgradeConfig } from "./use-get-floating-upgrade-config";

interface THandleValidateChatOptions {
  conversationMode: EConversationMode;
  messages: TMessageTemp[];
  guardCheck?: keyof TChatFreeUsage;
  isRegenerate?: boolean;
}

const mappingConversationModeToGuardCheck = (
  conversationMode: EConversationMode
): keyof TChatFreeUsage => {
  const objMapping: Record<EConversationMode, keyof TChatFreeUsage> = {
    [EConversationMode.CHAT]: "chat",
    [EConversationMode.AI_ART]: "imageCreation",
    [EConversationMode.DEEP_RESEARCH]: "deepResearch",
    [EConversationMode.WEB_SEARCH]: "webSearch",
  };

  return objMapping[conversationMode];
};

export const useValidateChat = () => {
  const { isValidPremiumUser } = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const floatingUpgradeConfig = useGetFloatingUpgradeConfig();
  const toggleFloatingBlock = useGlobalState(
    (state) => state.toggleFloatingBlock
  );
  const toggleFloatingBanner = useGlobalState(
    (state) => state.toggleFloatingBanner
  );
  const selectedModel = useConversationState((state) => state.selectedModel);
  const setSelectedModel = useConversationState(
    (state) => state.setSelectedModel
  );
  const user = useGlobalState((state) => state.user);
  const dsVersion = useGlobalState((state) => state.dsVersion);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const conversationT = useTranslations("conversationPage");

  const conversationStore = useConversationStore();
  const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
  const sourceEventMap: Record<keyof TChatFreeUsage, TPurchaseSource> = {
    assistant: "assistant-writing",
    chat: "free_turn",
    deepResearch: "deep_research",
    file: "attach_file",
    imageCreation: "ai_art",
    webSearch: "web_search",
  };

  const handleReachedLimit = ({
    type,
    isRegenerate = false,
  }: {
    type: "deep_research" | "image_creation" | "realtime_search";
    isRegenerate?: boolean;
  }) => {
    const {
      selectedId,
      conversationStates,
      selectedFiles,
      selectedAIArt,
      userInput,
      setConversationStates,
      initialConversationInput,
    } = conversationStore.getState();

    const conversationState =
      conversationStates[selectedId] || defaultConversationState;
    const isReached = conversationState.messages.some(
      (message) => message.status === "reachedLimit"
    );

    if (isReached) {
      return;
    }

    const userMessage = conversationUC.createTempMessage({
      files: selectedFiles,
      prompt: userInput,
      role: "user",
      type,
      ...(type === "image_creation" && { imageStyle: selectedAIArt?.value }),
    });

    const reachedLimitMessage = conversationUC.createTempMessage({
      prompt: "",
      role: "assistant",
      status: "reachedLimit",
      type,
    });

    const updatedMessages = isRegenerate
      ? [...conversationState.messages, reachedLimitMessage]
      : [...conversationState.messages, userMessage, reachedLimitMessage];

    setConversationStates(selectedId, {
      isNew: false,
      messages: updatedMessages,
      status: "submitted",
    });

    initialConversationInput();
  };

  const handleFeatureOnlyForPremium = (messageType: TMessageType) => {
    const conversationId = conversationStore.getState().selectedId;
    const conversationState =
      conversationStore.getState().conversationStates[conversationId] ||
      defaultConversationState;
    const { selectedFiles } = conversationStore.getState();
    const { selectedAIArt } = conversationStore.getState();

    const isNeedPremium = conversationState.messages.some(
      (message) => message.status === "premiumOnly"
    );

    if (isNeedPremium) {
      return;
    }

    const { userInput } = conversationStore.getState();
    const currentMessages = conversationState.messages;

    const userMessage = conversationUC.createTempMessage({
      files: selectedFiles,
      prompt: userInput,
      role: "user",
      type: messageType,
      ...(messageType === "image_creation" && {
        imageStyle: selectedAIArt?.value,
      }),
    });
    const needPremiumMessage = conversationUC.createTempMessage({
      prompt: "",
      role: "assistant",
      status: "premiumOnly",
      type: messageType,
    });

    const updatedMessage = [
      ...currentMessages,
      userMessage,
      needPremiumMessage,
    ];

    if (floatingUpgradeConfig.enabled) {
      toggleFloatingBlock(false);
      toggleFloatingBanner(false);
    }
    conversationStore.getState().setConversationStates(conversationId, {
      isNew: false,
      messages: updatedMessage,
      status: "submitted",
    });
    conversationStore.getState().initialConversationInput();
  };

  const handleBlockDeepResearch = (...args: Parameters<TOnBlocked>) => {
    const [_type, reason, isRegenerate] = args;

    if (reason === "limitReached") {
      // Tracking ChatDeepResearchHitLimit
      sendTrackingEvent({
        name: EventKeys.ChatDeepResearchHitLimit,
        payload: {
          vulcan_user_id: user.id,
        },
      });
      handleReachedLimit({
        isRegenerate,
        type: "deep_research",
      });

      return;
    }

    if (reason === "notPremium") {
      handleFeatureOnlyForPremium("deep_research");
    }
  };

  const handleBlockImageCreation = (...args: Parameters<TOnBlocked>) => {
    const [_type, reason, isRegenerate] = args;

    if (reason === "limitReached") {
      // Tracking ChatArtHitLimit
      sendTrackingEvent({
        name: EventKeys.ChatArtHitLimit,
        payload: {
          vulcan_user_id: user.id,
        },
      });
      handleReachedLimit({
        isRegenerate,
        type: "image_creation",
      });

      return;
    }

    if (reason === "notPremium") {
      // Tracking ChatArtFreeUserTry
      sendTrackingEvent({
        name: EventKeys.ChatArtFreeUserTry,
        payload: {
          vulcan_user_id: user.id,
        },
      });

      handleFeatureOnlyForPremium("image_creation");
    }
  };

  const handleBlockWebSearch = (...args: Parameters<TOnBlocked>) => {
    const [, reason, isRegenerate] = args;

    if (reason === "limitReached") {
      // Tracking ChatWebSearchHitLimit
      sendTrackingEvent({
        name: EventKeys.ChatWebSearchHitLimit,
        payload: {
          vulcan_user_id: user.id,
        },
      });
      handleReachedLimit({
        isRegenerate,
        type: "realtime_search",
      });

      return;
    }

    if (reason === "notPremium") {
      // Tracking ChatWebSearchFreeUserTry
      sendTrackingEvent({
        name: EventKeys.ChatWebSearchFreeUserTry,
        payload: {
          vulcan_user_id: user.id,
        },
      });
      handleFeatureOnlyForPremium("realtime_search");
    }
  };

  const handleBlockChat = (...args: Parameters<TOnBlocked>) => {
    const [, reason] = args;
    const isNotAllowedToUsePremiumModel =
      !isValidPremiumUser && selectedModel.availableRoles.includes("premium");

    if (isNotAllowedToUsePremiumModel) {
      setSelectedModel(defaultChatModel);
      toast.error(null, {
        description: conversationT("toast.error.modelExpired"),
      });
    }

    if (reason === "notPremium") {
      handleFeatureOnlyForPremium("chat");
    }
  };

  const handleBlockFeature: TOnBlocked = (type, reason, isRegenerate) => {
    const sourceEventType = sourceEventMap[type];

    if (type === "deepResearch") {
      handleBlockDeepResearch(type, reason, isRegenerate);
    }

    if (type === "imageCreation") {
      handleBlockImageCreation(type, reason, isRegenerate);
    }

    if (type === "webSearch") {
      handleBlockWebSearch(type, reason, isRegenerate);
    }

    // Tracking ChatFreeHitLimit
    if (type === "chat") {
      handleBlockChat(type, reason, isRegenerate);
      if (chatFreeUsage.chat === 0 && !isValidPremiumUser) {
        sendTrackingEvent({
          name: EventKeys.ChatFreeHitLimit,
          payload: {
            vulcan_user_id: user.id,
          },
        });
      }
    }

    if (reason === "notPremium") {
      setIsOpenSubscriptionModal(true, sourceEventType);
      sendTrackingEvent({
        name: EventKeys.DSAutoOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: sourceEventType as TDSAutoOpenSource,
          vulcan_user_id: user.id,
        },
      });
    }
  };

  const { featureGuardCheck } = useBlockFeature({
    onBlocked: handleBlockFeature,
  });
  useComingSoonFeature();

  const handleValidateChat = (options: THandleValidateChatOptions) => {
    const { conversationMode, messages, guardCheck, isRegenerate } = options;

    const guardValueFromConversationMode =
      mappingConversationModeToGuardCheck(conversationMode);

    const guardValue: keyof TChatFreeUsage =
      guardCheck ?? guardValueFromConversationMode;

    if (featureGuardCheck(guardValue, isRegenerate)) {
      return true;
    }

    // if (handleCheckComingSoonFeature({ messages, conversationMode, isRegenerate })) {
    //   return true;
    // }

    const sourceEventType = sourceEventMap[guardValue];
    const assistantMessages =
      messages?.filter((msg) => msg.role === "assistant" && msg.models) || [];

    if (
      !isValidPremiumUser &&
      FREE_USER_DIALOG_TRIGGERS.includes(assistantMessages.length)
    ) {
      setIsOpenSubscriptionModal(true, sourceEventType);
      sendTrackingEvent({
        name: EventKeys.DSAutoOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: sourceEventType as TDSAutoOpenSource,
          vulcan_user_id: user.id,
        },
      });
    }

    return false;
  };

  return { handleValidateChat };
};
