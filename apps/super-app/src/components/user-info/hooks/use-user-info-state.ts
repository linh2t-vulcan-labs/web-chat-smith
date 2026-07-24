import { useMemo } from "react";

import { useNotification } from "@/features/notification/provider/notification-provider";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";
import { useHandleUserSubscriptions } from "@/hooks/subscriptions/use-handle-user-subscriptions";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { safeJsonParse } from "@/utils/commons/helpers";

export const useUserInfoState = () => {
  const user = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const dsVersion = useGlobalState((state) => state.dsVersion);
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setIsOpenMobileSubscriptionWarningModal = useGlobalState(
    (state) => state.setIsOpenMobileSubscriptionWarningModal
  );
  // Note: need to remove logic manage subscription flow (According ticket to GU-1123)
  const setIsOpenManageSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenManageSubscriptionModal
  );
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();
  const paymentVendorOfSubscriptionUser = useGlobalState(
    (state) => state.paymentVendorOfSubscriptionUser
  );

  const resetGlobalStore = useGlobalState((state) => state.resetStore);
  const signOut = useAuthState((state) => state.signOut);
  const { firebasePushToken, unregisterPushToken } = useNotification();
  const { handleManageBillingHistory } = useHandleUserSubscriptions();
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();

  const raw = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.SOCIAL_LINKS);
  const socialLinks = useMemo(
    () => safeJsonParse<{ discord: string }>(raw),
    [raw]
  );

  const {
    isExistUserSubscription,
    isExistActiveSubscriptionFromWeb,
    isValidPremiumUser,
    isExpired,
  } = userSubscriptionInfo;

  return useMemo(
    () => ({
      dsVersion,
      firebasePushToken,
      handleManageBillingHistory,
      isEnablePaddleCheckoutFeature,
      isFinishFetchProfile,
      paymentVendorOfSubscriptionUser,
      resetGlobalStore,
      setIsOpenManageSubscriptionModal,
      setIsOpenMobileSubscriptionWarningModal,
      setIsOpenSubscriptionModal,
      signOut,
      socialLinks,
      unregisterPushToken,
      user,
      userSubscriptionInfo: {
        isExistActiveSubscriptionFromWeb,
        isExistUserSubscription,
        isExpired,
        isValidPremiumUser,
      },
    }),
    [
      user,
      isFinishFetchProfile,
      isExistUserSubscription,
      isExistActiveSubscriptionFromWeb,
      isValidPremiumUser,
      isExpired,
      dsVersion,
      paymentVendorOfSubscriptionUser,
      isEnablePaddleCheckoutFeature,
      setIsOpenSubscriptionModal,
      setIsOpenMobileSubscriptionWarningModal,
      setIsOpenManageSubscriptionModal,
      resetGlobalStore,
      signOut,
      firebasePushToken,
      unregisterPushToken,
      handleManageBillingHistory,
      socialLinks,
    ]
  );
};
