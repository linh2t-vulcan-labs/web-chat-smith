import type { TChatFreeUsage } from "@/core/models/usage";
import { useGlobalState, useGlobalStore } from "@/store/global/hooks";

type TBlockedReason = "limitReached" | "notPremium";
type TOnBlocked = (
  type: keyof TChatFreeUsage,
  reason: TBlockedReason,
  isRegenerate?: boolean
) => void;
interface TUseBlockFeatureOptions {
  onBlocked?: TOnBlocked;
}
const useBlockFeature = (options: TUseBlockFeatureOptions) => {
  const { onBlocked } = options;
  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const globalStore = useGlobalStore();

  const featureRulesByTurn: Record<
    keyof TChatFreeUsage,
    (turn: number) => boolean
  > = {
    assistant: (turn) => !isValidPremiumUser && !turn, // Note: needs update when used with file
    chat: (turn) => {
      if (isValidPremiumUser) {
        return false;
      }
      return !turn;
    },
    deepResearch: (turn) => !isValidPremiumUser || turn <= 0,
    file: (turn) => !isValidPremiumUser && !turn, // Note: needs update when used with file
    imageCreation: (turn) => !isValidPremiumUser || turn <= 0,
    webSearch: (turn) => !isValidPremiumUser || turn <= 0,
  };

  const featureGuardCheck = (
    type: keyof TChatFreeUsage,
    isRegenerate?: boolean
  ): boolean => {
    const { chatFreeUsage } = globalStore.getState();

    const turn = chatFreeUsage[type];
    const isBlocked = featureRulesByTurn[type]?.(turn);

    if (isBlocked) {
      const reason = isValidPremiumUser ? "limitReached" : "notPremium";
      onBlocked?.(type, reason, isRegenerate);
    }

    return isBlocked;
  };

  return { featureGuardCheck };
};

export { useBlockFeature };
export type { TOnBlocked };
