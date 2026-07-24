import type { RefObject } from "react";

import { useGetUserSubscription } from "@/hooks/subscriptions/use-get-user-subscription";

import type { TCreateGlobalStore } from "../store";

export const useInitUserSubscriptions = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean
) => {
  const { data: subscriptionResponse } =
    useGetUserSubscription(isAuthenticated);

  return subscriptionResponse;
};
