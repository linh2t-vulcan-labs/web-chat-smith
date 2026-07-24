import { useCallback, useTransition } from "react";

import type { TPaymentVendorOfSubscriptionUser } from "@/core/models/payment";
import { EManageAccountModalTab } from "@/features/manage-account-modal/types";
import { useRouter } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { openNewTab } from "@/utils/commons/helpers";
import { MANAGE_ACCOUNT_URL } from "@/utils/constants/url";

import type { useUserInfoState } from "./use-user-info-state";

type TUseUserInfoActionsProps = ReturnType<typeof useUserInfoState>;

export const useUserInfoActions = ({
  user,
  userSubscriptionInfo,
  dsVersion,
  setIsOpenManageSubscriptionModal,
  setIsOpenSubscriptionModal,
  setIsOpenMobileSubscriptionWarningModal,
  resetGlobalStore,
  signOut,
  firebasePushToken,
  unregisterPushToken,
  handleManageBillingHistory,
}: TUseUserInfoActionsProps) => {
  const router = useRouter();
  const { sendTrackingEvent } = useSendTrackingEvent();
  const [isPendingSignOut, startTransitionSignOut] = useTransition();
  const [isPendingManageSubscription, startTransitionManageSubscription] =
    useTransition();
  // Note: Subscription loading is now handled by SubscriptionLoadingIndicator
  // This isLoading only covers non-subscription operations (sign out, manage subscription navigation)
  const isLoading = isPendingSignOut || isPendingManageSubscription;

  const handleLogOut = useCallback(() => {
    sendTrackingEvent({
      name: EventKeys.MainLogout,
    });

    startTransitionSignOut(async () => {
      if (firebasePushToken) {
        await unregisterPushToken(firebasePushToken, true);
      }
      resetGlobalStore();
      await signOut();
    });
  }, [
    sendTrackingEvent,
    firebasePushToken,
    unregisterPushToken,
    resetGlobalStore,
    signOut,
    startTransitionSignOut,
  ]);

  const handleUpgradePlan = useCallback(() => {
    sendTrackingEvent({
      name: EventKeys.DSOpen,
      payload: {
        ds_version: dsVersion,
        vulcan_source: "user_menu",
        vulcan_user_id: user.id,
      },
    });
    setIsOpenSubscriptionModal(true, "user_menu");
  }, [sendTrackingEvent, user.id, dsVersion, setIsOpenSubscriptionModal]);

  const handleOpenManageAccountModal = useCallback(() => {
    router.push(`${MANAGE_ACCOUNT_URL}/${EManageAccountModalTab.GENERAL}`);
  }, [router]);

  const handleManageSubscription = useCallback(
    (
      isInlineManageSubscriptionMechanism: boolean,
      isEnablePaddleCheckoutFeature: boolean,
      paymentVendorOfSubscriptionUser: TPaymentVendorOfSubscriptionUser
    ) => {
      startTransitionManageSubscription(() => {
        sendTrackingEvent({
          name: EventKeys.PremiumPackageManage,
          payload: {
            vulcan_user_id: user.id,
          },
        });

        if (!userSubscriptionInfo.isExistActiveSubscriptionFromWeb) {
          setIsOpenMobileSubscriptionWarningModal(true);
          return;
        }

        // Remove this logic: When not enable Paddle checkout feature, check payment vendor of subscription user to handle flow
        // 1. From stripe => go to stripe
        // 2. From paddle => show popup warning info
        // When Paddle checkout feature enable or not, force open stripe when payment vendor is stripe
        if (paymentVendorOfSubscriptionUser === "stripe") {
          handleManageBillingHistory(user.id);
          return;
        }

        // Handle manage subscription flow by using url from Backend API
        if (!isInlineManageSubscriptionMechanism) {
          handleManageBillingHistory(user.id);
          return;
        }

        // When enable flow manage subscription inline and enable Paddle checkout feature, go to my plan check
        if (isEnablePaddleCheckoutFeature) {
          router.push(
            `${MANAGE_ACCOUNT_URL}/${EManageAccountModalTab.MY_PLAN}`
          );
          return;
        }

        setIsOpenManageSubscriptionModal(true);
      });
    },
    [
      sendTrackingEvent,
      user.id,
      userSubscriptionInfo.isExistActiveSubscriptionFromWeb,
      setIsOpenMobileSubscriptionWarningModal,
      setIsOpenManageSubscriptionModal,
      handleManageBillingHistory,
      router,
      startTransitionManageSubscription,
    ]
  );

  const handleSuggestionToggle = useCallback(
    (checked: boolean) => {
      sendTrackingEvent({
        name: EventKeys.ChatSuggestion,
        payload: {
          vulcan_status: checked ? "on" : "off",
          vulcan_user_id: user.id,
        },
      });
    },
    [sendTrackingEvent, user.id]
  );

  const handleContactUs = useCallback(() => {
    sendTrackingEvent({
      name: EventKeys.MainContactUs,
      payload: {
        vulcan_user_id: user.id,
      },
    });
  }, [sendTrackingEvent, user.id]);

  const handlePrivacyPolicy = useCallback(
    (url: string) => {
      sendTrackingEvent({
        name: EventKeys.MainPrivacy,
        payload: {
          vulcan_user_id: user.id,
        },
      });
      openNewTab(url);
    },
    [sendTrackingEvent, user.id]
  );

  const handleOpenLink = useCallback((url: string) => {
    openNewTab(url);
  }, []);

  return {
    handleContactUs,
    handleLogOut,
    handleManageSubscription,
    handleOpenLink,
    handleOpenManageAccountModal,
    handlePrivacyPolicy,
    handleSuggestionToggle,
    handleUpgradePlan,
    isLoading,
  };
};
