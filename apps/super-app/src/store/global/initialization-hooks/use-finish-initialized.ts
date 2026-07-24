import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import type { UserOrderTrialUsagesModel } from "@/core/models/order";
import type { SubscriptionModel } from "@/core/models/subscription";
import type { TChatFreeUsage, TFreeUsageReset } from "@/core/models/usage";
import type { UserInfoModel } from "@/core/models/user";
import { useGetPaymentVendor } from "@/hooks/payments/use-get-payment-vendor";
import { setUserIdToCoralogix } from "@/libs/coralogix/utils";
import { getFirebaseAuth } from "@/libs/firebase";

import type { TCreateGlobalStore } from "../store";

export const useFinishInitialized = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean,
  userSubscriptionInfo?: SubscriptionModel | null,
  userProfile?: UserInfoModel | null,
  chatFreeUsage?: TChatFreeUsage | null,
  freeUsageResetInfo?: TFreeUsageReset | null,
  trialUsagesResponse?: UserOrderTrialUsagesModel | null
) => {
  const hasInitializedRef = useRef(false);

  const {
    isLoading: isPaymentVendorLoading,
    isPaddle,
    isStripe,
    paddleCustomerId,
  } = useGetPaymentVendor();
  let paymentVendorOfSubscriptionUser: "paddle" | "stripe" | "unspecified" =
    "unspecified";

  if (isPaddle) {
    paymentVendorOfSubscriptionUser = "paddle";
  } else if (isStripe) {
    paymentVendorOfSubscriptionUser = "stripe";
  }

  useEffect(() => {
    if (!trialUsagesResponse || !store.current) {
      return;
    }

    const storeState = store.current.getState();
    storeState.setExistTrialUsage(Boolean(trialUsagesResponse));
  }, [trialUsagesResponse, store]);

  useEffect(() => {
    if (!chatFreeUsage || !store.current) {
      return;
    }

    const storeState = store.current.getState();
    storeState.setChatFreeUsage(chatFreeUsage);
  }, [chatFreeUsage, store]);

  useEffect(() => {
    if (!freeUsageResetInfo || !store.current) {
      return;
    }

    const storeState = store.current.getState();
    storeState.setFreeUsageResetInfo(freeUsageResetInfo);
  }, [freeUsageResetInfo, store]);

  useEffect(() => {
    // Wait for ALL required data to be loaded before setting isFinishFetchProfile
    if (
      hasInitializedRef.current ||
      !store.current ||
      !userSubscriptionInfo ||
      !userProfile ||
      isPaymentVendorLoading
    ) {
      return;
    }

    const storeState = store.current.getState();

    // Use initStates for atomic update of all related state
    // This ensures isFinishFetchProfile is only true when subscription info is also loaded
    setUserIdToCoralogix(userProfile.id);

    storeState.initStates({
      isFinishFetchProfile: true,
      paddleCustomerId,
      paymentVendorOfSubscriptionUser,
      user: userProfile,
      userSubscriptionInfo,
    });

    const firebaseAuth = getFirebaseAuth();
    if (firebaseAuth.currentUser) {
      storeState.updateUserInfo(firebaseAuth.currentUser, userProfile);
    }

    hasInitializedRef.current = true;
  }, [
    store,
    userSubscriptionInfo,
    userProfile,
    chatFreeUsage,
    paymentVendorOfSubscriptionUser,
    paddleCustomerId,
    isPaymentVendorLoading,
  ]);

  useEffect(() => {
    if (!userSubscriptionInfo || !store.current || !hasInitializedRef.current) {
      return;
    }

    store.current.getState().setUserSubscriptionInfo(userSubscriptionInfo);
  }, [userSubscriptionInfo, store]);
};
