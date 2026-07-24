import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import type { SubscriptionModel } from "@/core/models/subscription";
import { usageClientService } from "@/core/repositories";
import { useFreeUsageUpdater } from "@/hooks/usage/use-free-usage-updater";
import { useQuery } from "@/libs/react-query";
import { defaultChatFreeUsage } from "@/utils/constants/user";

import type { TCreateGlobalStore } from "../store";

export const useInitFreeUsage = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean,
  subscriptionInfo?: SubscriptionModel | null
) => {
  const { updateFreeUsage } = useFreeUsageUpdater(store);
  const hasInitializedRef = useRef(false);

  const { data: chatFreeUsageResponse } = useQuery({
    enabled: isAuthenticated,
    queryFn: async () => await usageClientService.getFreeUsageCount(),
    queryKey: ["chatFreeUsage", isAuthenticated],
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
    staleTime: 0,
  });

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    const freeUsage = chatFreeUsageResponse?.[1] ?? defaultChatFreeUsage;

    if (
      subscriptionInfo?.isValidPremiumUser &&
      freeUsage?.chat &&
      freeUsage.chat > 0
    ) {
      hasInitializedRef.current = true;

      // Use the coordinator to handle the update
      updateFreeUsage();
    }
  }, [subscriptionInfo, chatFreeUsageResponse, updateFreeUsage]);

  return chatFreeUsageResponse;
};
