import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

import type { ProductModel } from "@/core/models/product";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { useSubscriptionActions } from "@/store/subscription";

import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import { SubscriptionActionButton } from "./subscription-action-button";
import { SubscriptionPlanDetailsMobile } from "./subscription-plan-details-mobile";
import type { TGetFullAccessCardProps } from "./types";
import { ECheckoutStep } from "./types";

/**
 * Flag-OFF (V1) mobile checkout — the original `master` flow: Continue button → V1 order-service
 * checkout, with the Paddle inline iframe shown as step 2. NO express checkout (express is V2-only).
 */
export const OriginalMasterMobileCheckout: React.FC<
  TGetFullAccessCardProps
> = ({ products, onClickSubmitSubscription, onClose }) => {
  const dsT = useTranslations("ds");
  const [selectedProduct, setSelectedProduct] = useState<ProductModel>();
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const dsVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION
  );

  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const guestStore = useGuestStore();
  const setCheckoutStep = useGlobalState((state) => state.setCheckoutStep);
  const subscriptionActions = useSubscriptionActions();

  const handleSubscriptionChange = (product: ProductModel) => {
    setSelectedProduct(product);
  };

  const handleContinue = (selectedCheckoutProduct?: ProductModel) => {
    const targetProduct = selectedCheckoutProduct || selectedProduct;
    if (!targetProduct) {
      return;
    }

    // setCheckoutStep must run before onClickSubmitSubscription so the
    // .container-paddle-checkout div is in the DOM when Paddle opens inline checkout.
    // Loading is set first so LoadingProcessing is already visible when the UI switches,
    // preventing the empty-container flash.
    if (!guestStore) {
      subscriptionActions.setIsPaddleCheckoutLoading(true);
      setCheckoutStep(ECheckoutStep.PAYMENT_CHECKOUT);
    }

    onClickSubmitSubscription?.(targetProduct);
  };

  const isSelectTrialProduct = useMemo(
    () => selectedProduct?.isTrial,
    [selectedProduct]
  );

  useAutoSubmitPendingCheckout({
    applySelectedProduct: setSelectedProduct,
    onSubmit: handleContinue,
    products,
    selectedProduct,
  });

  // Step 2: Show Paddle checkout
  if (checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT) {
    return (
      <div className="pb-medium-2 pt-medium-3 flex flex-col">
        <PaddleCheckoutContainer />
      </div>
    );
  }

  return (
    <div className="p-medium-2 flex h-dvh flex-col overflow-hidden md:h-full">
      <SubscriptionPlanDetailsMobile
        products={products}
        selectedProduct={selectedProduct}
        onSubscriptionChange={handleSubscriptionChange}
        onClose={onClose}
        apiVersion={apiVersion}
        dsVersion={dsVersion}
      />
      {/* Action button */}
      <SubscriptionActionButton
        onContinue={handleContinue}
        submitBtnText={
          isSelectTrialProduct ? dsT("trialSubmit") : dsT("submit")
        }
      />
    </div>
  );
};
