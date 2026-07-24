"use client";

import { useLocale } from "next-intl";
import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";

import { EPaymentSubscriptionStatus } from "@/core/models/payment";
import type { SubscriptionModel } from "@/core/models/subscription";
import { useGetPaymentSubscriptions } from "@/features/manage-account-modal/hooks";
import { useGetUserSubscription } from "@/hooks/subscriptions/use-get-user-subscription";
import { useClientMounted } from "@/hooks/use-client-mounted";
import { useAuthState } from "@/store/auth";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

import { checkStatusSubscription } from "../utils/check-status-subscription";
import {
  getPricingCtaPaths,
  resolvePricingCtaVariant,
} from "../utils/pricing-cta";

function readPersistedAccessToken(): boolean {
  try {
    const raw = globalThis.localStorage?.getItem(
      LOCAL_STORAGE_KEY.AUTH_STORE_DATA
    );
    if (!raw) {
      return false;
    }
    const parsed = JSON.parse(raw) as {
      state?: { accessToken?: string };
    } | null;
    return Boolean(parsed?.state?.accessToken);
  } catch {
    return false;
  }
}

function resolveActiveProductId(
  subscription: SubscriptionModel | undefined,
  paymentSubscriptions: ReturnType<typeof useGetPaymentSubscriptions>["data"]
): string | undefined {
  const activePayment = paymentSubscriptions?.find(
    (item) =>
      checkStatusSubscription(item.status, item.nextBillingDate) ===
      EPaymentSubscriptionStatus.ACTIVE
  );

  if (activePayment?.sourceProductId) {
    return activePayment.sourceProductId;
  }

  return subscription?.currentSubscriptionInfo?.metadata?.subscriptionId;
}

export function usePricingAuth() {
  const locale = useLocale();
  const mounted = useClientMounted();
  const { isAuthenticated, accessToken } = useAuthState(
    useShallow((state) => ({
      accessToken: state.accessToken,
      isAuthenticated: state.isAuthenticated,
    }))
  );

  const hasStoreSession = isAuthenticated || Boolean(accessToken);

  const hasLocalToken = useMemo(() => {
    if (!mounted || hasStoreSession) {
      return false;
    }
    return readPersistedAccessToken();
  }, [mounted, hasStoreSession]);

  const isLoggedIn = mounted && (hasStoreSession || hasLocalToken);

  const { data: subscriptionResponse, isLoading: isSubscriptionLoading } =
    useGetUserSubscription(isLoggedIn);

  const subscription =
    subscriptionResponse?.[0] === null ? subscriptionResponse[1] : undefined;

  const shouldFetchPaymentSubscriptions = Boolean(
    isLoggedIn && subscription?.isExistUserSubscription
  );

  const {
    data: paymentSubscriptions,
    isLoading: isPaymentSubscriptionsLoading,
  } = useGetPaymentSubscriptions(shouldFetchPaymentSubscriptions);

  const isAuthLoading =
    !mounted ||
    (isLoggedIn && (isSubscriptionLoading || isPaymentSubscriptionsLoading));

  const isPremium = Boolean(subscription?.isValidPremiumUser);

  const activeProductId = useMemo(
    () => resolveActiveProductId(subscription, paymentSubscriptions),
    [subscription, paymentSubscriptions]
  );

  const manageCtaVariant = useMemo(
    () => resolvePricingCtaVariant(isLoggedIn, isPremium),
    [isLoggedIn, isPremium]
  );

  const ctaPaths = useMemo(() => getPricingCtaPaths(locale), [locale]);

  return {
    isLoggedIn,
    isPremium,
    isAuthLoading,
    locale,
    ...ctaPaths,
    manageCtaVariant,
    activeProductId,
    subscription,
  };
}
