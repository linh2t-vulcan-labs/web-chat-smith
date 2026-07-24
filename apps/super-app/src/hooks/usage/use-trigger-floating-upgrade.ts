import { useEffect } from "react";

import type { EConversationMode } from "@/core/models/conversation";
import { conversationUC } from "@/core/usecases";
import type { FloatingUpgradeConfig } from "@/store/conversation/types";
import { useGlobalState } from "@/store/global/hooks";

import { useMatchRoute } from "../use-match-route";
import { useGetFloatingUpgradeConfig } from "./use-get-floating-upgrade-config";

/**
 * Checks whether the floating upgrade block should be displayed
 * based on the current question count and dismiss state via config.
 *
 * Rules:
 * - If `questionCount <= 0`: never show
 * - If `hasDismissed = true`: show when divisible by showInterval
 * - If `hasDismissed = false` or not provided: show once questionCount >= initialShowThreshold
 *
 * @param questionCount - The number of questions asked in the current session
 * @param hasDismissed - Optional flag indicating whether the user has dismissed the floating block
 * @returns `true` if the floating upgrade block should be displayed, otherwise `false`
 *
 * @example
 * checkShowFloatingUpgradeBlock(0);         // false
 * checkShowFloatingUpgradeBlock(2, true);   // true
 * checkShowFloatingUpgradeBlock(3, true);   // false
 * checkShowFloatingUpgradeBlock(4);         // true
 * checkShowFloatingUpgradeBlock(5);         // true
 */
const DEFAULT_CHECK_SHOW_FLOATING_UPGRADE_BLOCK_CONFIG: FloatingUpgradeConfig =
  {
    enabled: false,
    initialShowThreshold: 4,
    showInterval: 2,
  };

function checkShowFloatingUpgradeBlock(
  questionCount: number,
  hasDismissed?: boolean,
  config: FloatingUpgradeConfig = DEFAULT_CHECK_SHOW_FLOATING_UPGRADE_BLOCK_CONFIG
): boolean {
  if (questionCount <= 0) {
    return false;
  }

  if (hasDismissed) {
    return (
      (questionCount - config.initialShowThreshold) % config.showInterval === 0
    );
  }

  return questionCount >= config.initialShowThreshold;
}

interface UseTriggerFloatingUpgradeReturnType {
  floatingBlockVisible: boolean;
  floatingBannerVisible: boolean;
  reachMaximum: boolean;
  isInitializing: boolean;
  isEnabled: boolean;
}

const DEFAULT_FLOATING_UPGRADE_RETURN_VALUES: UseTriggerFloatingUpgradeReturnType =
  {
    floatingBannerVisible: false,
    floatingBlockVisible: false,
    isEnabled: false,
    isInitializing: false,
    reachMaximum: false,
  };

const useTriggerFloatingUpgrade = (
  mode: EConversationMode,
  enabled = false
): UseTriggerFloatingUpgradeReturnType => {
  const floatingBlockVisibleInternal = useGlobalState(
    (state) => state.visibleFloatingBlock
  );
  const floatingBannerVisibleInternal = useGlobalState(
    (state) => state.visibleFloatingBanner
  );
  const toggleFloatingBlock = useGlobalState(
    (state) => state.toggleFloatingBlock
  );
  const toggleFloatingBanner = useGlobalState(
    (state) => state.toggleFloatingBanner
  );
  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );

  const floatingUpgradeConfig = useGetFloatingUpgradeConfig();
  const isEnabledFloatingUpgrade = floatingUpgradeConfig.enabled;

  const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
  const initialChatFreeUsage = useGlobalState(
    (state) => state.initialChatFreeUsage
  );
  const hasDismissedBlock = useGlobalState(
    (state) => state.hasDismissedFloatingBlock
  );
  const hasDismissedBanner = useGlobalState(
    (state) => state.hasDismissedFloatingBanner
  );
  const matchConversationExact = useMatchRoute("/conversation");

  const useCase = conversationUC.getGuardValueFromConversationMode(mode);

  // Check condition
  const remainingMessageCount = chatFreeUsage[useCase];
  const initialMessageCount = initialChatFreeUsage[useCase];
  const askedMessageCount = initialMessageCount - remainingMessageCount;
  const reachMaximum = chatFreeUsage[useCase] === 0;
  const shouldShowBlock =
    reachMaximum ||
    checkShowFloatingUpgradeBlock(
      askedMessageCount,
      hasDismissedBlock,
      floatingUpgradeConfig
    );
  const shouldHideFloatingBanner =
    shouldShowBlock || (hasDismissedBlock && !matchConversationExact);
  const shouldShowBanner = !shouldHideFloatingBanner;
  const showBannerCondition = matchConversationExact ? true : shouldShowBanner;

  useEffect(() => {
    if (!enabled) {
      return;
    }
    toggleFloatingBlock(isValidPremiumUser ? false : shouldShowBlock);
    toggleFloatingBanner(
      !isValidPremiumUser && !hasDismissedBanner ? showBannerCondition : false
    );
  }, [
    isValidPremiumUser,
    hasDismissedBanner,
    hasDismissedBlock,
    shouldShowBlock,
    showBannerCondition,
    askedMessageCount,
    toggleFloatingBlock,
    toggleFloatingBanner,
    enabled,
  ]);

  if (!isEnabledFloatingUpgrade) {
    return DEFAULT_FLOATING_UPGRADE_RETURN_VALUES;
  }

  return {
    floatingBannerVisible: floatingBannerVisibleInternal,
    floatingBlockVisible: floatingBlockVisibleInternal,
    isEnabled: isEnabledFloatingUpgrade,
    isInitializing: isFinishFetchProfile === false,
    reachMaximum,
  };
};

export { useTriggerFloatingUpgrade };
