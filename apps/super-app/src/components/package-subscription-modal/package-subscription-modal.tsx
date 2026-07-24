"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";

import { OLD_DS_VERSION } from "@/config/tracking-event";
import type { ProductModel } from "@/core/models/product";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useOnboardingDS } from "@/features/onboarding-popup-queue-manager/hooks";
import AccountSubscriptionModalV5 from "@/features/subscription/components/account-subscription-modal-v5/account-subscription-modal-v5";
import { isTrialDSVersion } from "@/features/subscription/utils/helpers";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";
import { useHandleUserSubscriptions } from "@/hooks/subscriptions/use-handle-user-subscriptions";
import dayjs from "@/libs/dayjs";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl } from "@/utils/commons/helpers";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";

import type {
  TOpenConfirmChangePackageModalConfig,
  TPackageConfirmChangeInfo,
} from "./types";

const MobileSubscriptionWarningModal = dynamic(
  () =>
    import("@/components/mobile-subscription-warning-modal/mobile-subscription-warning-modal")
);
const ConfirmChangePackageModal = dynamic(
  () => import("@/components/confirm-change-package/confirm-change-package")
);

const AccountSubscriptionModalV4 = dynamic(
  () => import("../account-subscription-modal-v4/account-subscription-modal-v4")
);

const MobileAppPaywallModal = dynamic(
  () =>
    import("@/components/mobile-app-paywall-modal/mobile-app-paywall-modal"),
  {
    ssr: false,
  }
);

export default function PackageSubscriptionModal() {
  const [
    openConfirmChangePackageModalConfig,
    setOpenConfirmChangePackageModalConfig,
  ] = useState<TOpenConfirmChangePackageModalConfig>({
    open: false,
    orderId: null,
    package: null,
  });
  const { sendTrackingEvent } = useSendTrackingEvent();

  const products = useGlobalState((state) => state.products);
  const isOpenMobileSubscriptionWarningModal = useGlobalState(
    (state) => state.isOpenMobileSubscriptionWarningModal
  );
  const user = useGlobalState((state) => state.user);
  const purchaseSource = useGlobalState((state) => state.purchaseSource);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const isOpenSubscriptionModal = useGlobalState(
    (state) => state.isOpenSubscriptionModal
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setIsOpenMobileSubscriptionWarningModal = useGlobalState(
    (state) => state.setIsOpenMobileSubscriptionWarningModal
  );
  const dsVersion = useGlobalState((state) => state.dsVersion);

  const guestStore = useGuestStore();
  useOnboardingDS();
  // Feature flag to enable Paddle checkout
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();

  const { isExistSubscriptionFromWeb } = userSubscriptionInfo;

  const {
    getPaymentInfo,
    handleManageBillingHistory,
    handleBuySubscription,
    handleUpdateSubscription,
  } = useHandleUserSubscriptions();

  const { handleLoginToPayment } = useFeatureGating();

  // Local transition for checkout flow
  const [, startCheckoutTransition] = useTransition();

  const handleClickSubmitSubscription = (product?: ProductModel) => {
    if (!product) {
      return;
    }

    // Guest User when click
    if (!user.id && guestStore) {
      handleLoginToPayment(product);
      return;
    }

    startCheckoutTransition(async () => {
      const packageId = product.id;

      const paymentResponse = await getPaymentInfo(purchaseSource, product);

      if (!paymentResponse) {
        await handleBuySubscription(purchaseSource, product);
        return;
      }

      const { paymentInfo, prorationInfo, orderId } = paymentResponse;

      const selectedPackageInfo = products.find(
        (product) => product.id === packageId
      ) as ProductModel;
      setOpenConfirmChangePackageModalConfig({
        open: true,
        orderId,
        package: {
          ...selectedPackageInfo,
          cardInfo: paymentInfo?.cardInfo,
          prorationPrice: prorationInfo.subTotal,
          validFrom: prorationInfo.dueAt || dayjs().format("MMM D, YYYY"),
        } as TPackageConfirmChangeInfo,
      });
    });
  };

  const handleManageSubscription = () => {
    sendTrackingEvent({
      name: EventKeys.PremiumPackageManage,
      payload: {
        vulcan_user_id: user.id,
      },
    });

    if (isExistSubscriptionFromWeb) {
      handleManageBillingHistory(user.id);
      return;
    }

    setIsOpenMobileSubscriptionWarningModal(true);
  };

  const handleAcceptConfirmChangePackage = async () => {
    if (
      !openConfirmChangePackageModalConfig.package ||
      !openConfirmChangePackageModalConfig.orderId
    ) {
      return;
    }

    try {
      // handleUpdateSubscription now handles everything: tracking, polling, toasts
      await handleUpdateSubscription(
        openConfirmChangePackageModalConfig.orderId,
        purchaseSource,
        openConfirmChangePackageModalConfig.package
      );
    } catch {
      // Error already handled in the hook with toast and tracking
      // Just close modals and let the hook's error handling take care of user feedback
      handleCancelConfirmChangePackage();
      handleCloseAccountDetail();
    }
  };

  const handleCancelConfirmChangePackage = () => {
    setOpenConfirmChangePackageModalConfig({
      open: false,
      orderId: null,
      package: null,
    });
  };

  const handleCloseAccountDetail = () => {
    setIsOpenSubscriptionModal(false, undefined);
    localStorageImpl.remove(LOCAL_STORAGE_KEY.GUEST_MODE_PRODUCT);
  };

  const handleCloseSubscription = () => {
    setIsOpenMobileSubscriptionWarningModal(false);
  };

  const handleNeedHelpSubscription = () => {
    sendTrackingEvent({
      name: EventKeys.NeedHelpPremiumClicked,
      payload: {
        vulcan_user_id: user.id,
      },
    });
    handleCloseSubscription();
  };

  // Restore logic auto show DS when free user login (According ticket to GU-1123)
  // const isShowAccountSubscriptionModal = isOpenSubscriptionModal || isOpenDSModal;
  const AccountSubscriptionModal =
    dsVersion > OLD_DS_VERSION
      ? AccountSubscriptionModalV5
      : AccountSubscriptionModalV4;

  const isShowAccountSubscriptionModal = isOpenSubscriptionModal;

  if (isEnablePaddleCheckoutFeature) {
    return (
      <>
        {isShowAccountSubscriptionModal ? (
          <AccountSubscriptionModal
            open={isShowAccountSubscriptionModal}
            onClose={handleCloseAccountDetail}
            onClickSubmitSubscription={handleClickSubmitSubscription}
            onClickManageSubscription={handleManageSubscription}
            dsVersion={dsVersion}
            useTrial={isTrialDSVersion(dsVersion)}
            enableTrial={isTrialDSVersion(dsVersion)}
          />
        ) : null}

        {openConfirmChangePackageModalConfig.open ? (
          <ConfirmChangePackageModal
            open={openConfirmChangePackageModalConfig.open}
            product={openConfirmChangePackageModalConfig.package}
            onClickConfirm={handleAcceptConfirmChangePackage}
            onClickCancel={handleCancelConfirmChangePackage}
          />
        ) : null}

        {isOpenMobileSubscriptionWarningModal ? (
          <MobileSubscriptionWarningModal
            open={isOpenMobileSubscriptionWarningModal}
            onNeedHelp={handleNeedHelpSubscription}
            onCloseSubscription={handleCloseSubscription}
          />
        ) : null}
      </>
    );
  }

  return (
    <>
      {isShowAccountSubscriptionModal ? (
        <MobileAppPaywallModal
          open={isShowAccountSubscriptionModal}
          onClose={handleCloseAccountDetail}
        />
      ) : null}

      {isOpenMobileSubscriptionWarningModal ? (
        <MobileSubscriptionWarningModal
          open={isOpenMobileSubscriptionWarningModal}
          onNeedHelp={handleNeedHelpSubscription}
          onCloseSubscription={handleCloseSubscription}
        />
      ) : null}
    </>
  );
}
