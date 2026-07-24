import type { TChatFreeUsage } from "@/core/models/usage";
import { useGlobalState, useGlobalStore } from "@/store/global/hooks";

export const useFreeUsageTracker = () => {
  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const globalStore = useGlobalStore();
  const setUsageDecrement = useGlobalState((state) => state.setUsageDecrement);

  const featureRules: Record<keyof TChatFreeUsage, (count: number) => boolean> =
    {
      assistant: (count) => !isValidPremiumUser && count > 0,
      chat: (count) => !isValidPremiumUser && count > 0,
      deepResearch: (count) => count > 0,
      file: (count) => !isValidPremiumUser && count > 0,
      imageCreation: (count) => count > 0,
      webSearch: (count) => count > 0,
    };

  const consumeFreeChat = (type: keyof TChatFreeUsage) => {
    const freeUsage = globalStore.getState().chatFreeUsage;

    const currentValue = freeUsage[type];
    const shouldConsume = featureRules[type](currentValue);

    if (shouldConsume && currentValue > 0) {
      setUsageDecrement(type);
    }
  };

  return { consumeFreeChat };
};
