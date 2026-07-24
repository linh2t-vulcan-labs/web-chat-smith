import type { RefObject } from "react";

import { useGetUserSubscriptionUsages } from "@/hooks/subscriptions/use-get-user-subscription-usages";

import type { TCreateGlobalStore } from "../store";

export const useInitUserTrialUsages = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean
) => {
  const { data: subscriptionResponse } =
    useGetUserSubscriptionUsages(isAuthenticated);

  return subscriptionResponse;
};
