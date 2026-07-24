import React, { useState } from "react";

import type { ProductModel } from "@/core/models/product";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useExpressCheckoutEligibility } from "@/hooks/payments/use-express-checkout-eligibility";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { useSubscriptionActions } from "@/store/subscription";

import { ExpressionPlanDetailsMobile } from "./expression-checkout-modal/expression-plan-details-mobile";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import type { TGetFullAccessCardProps } from "./types";
import { ECheckoutStep } from "./types";

/**
 * Payment Flow V2 mobile checkout (flag ON).
 *
 * - **Apple Pay available + authenticated** → the express checkout (auto Paddle iframe with the
 *   Apple Pay button). This is the ONLY case that shows the iframe instead of a Continue button.
 * - **Everyone else** (Apple Pay unavailable, or a guest, or still resolving) → the standard
 *   Continue-button flow, identical to the master mobile checkout: Continue → inline card checkout
 *   (step 2). The centralized opener still routes V1/V2 by the flag, so this stays V2 under the hood.
 *
 * Guests get the Continue button (never the express iframe, which needs an authenticated
 * `internal_customer_id`); the parent submit handler triggers login first, then the post-login
 * auto-submit re-applies the pending product.
 */
export const MobileV2Checkout: React.FC<TGetFullAccessCardProps> = ({
  products,
  onClickSubmitSubscription,
  onClose,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductModel>();
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const dsVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION
  );

  const { isExpressCheckout, isSettled, isGuest } =
    useExpressCheckoutEligibility();
  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const setCheckoutStep = useGlobalState((state) => state.setCheckoutStep);
  const subscriptionActions = useSubscriptionActions();

  const handleSubscriptionChange = (product: ProductModel) => {
    setSelectedProduct(product);
  };

  // Standard / guest flow — mirrors the master mobile checkout. Logged-in users mount the inline
  // container (step 2) then submit through the parent (→ opener picks V1/V2 by flag); guests skip
  // the step change and the parent triggers login first.
  const handleContinue = (selectedCheckoutProduct?: ProductModel) => {
    const targetProduct = selectedCheckoutProduct || selectedProduct;
    if (!targetProduct) {
      return;
    }
    if (!isGuest) {
      // setCheckoutStep must run before submit so the inline container is in the DOM when
      // Paddle opens; loading shows first to prevent the empty-container flash.
      subscriptionActions.setIsPaddleCheckoutLoading(true);
      setCheckoutStep(ECheckoutStep.PAYMENT_CHECKOUT);
    }
    onClickSubmitSubscription?.(targetProduct);
  };

  // Deep-link / post-login pending checkout. Gated on `isSettled` so we never fire the standard
  // flow before Apple Pay availability is known (which would wrongly skip express on iOS).
  // Express only needs the product applied (it auto-opens); the standard flow needs onSubmit.
  useAutoSubmitPendingCheckout({
    applySelectedProduct: setSelectedProduct,
    enabled: isSettled,
    onSubmit: isExpressCheckout ? undefined : handleContinue,
    products,
    selectedProduct,
  });

  // Step 2: inline card checkout (standard flow), shown after Continue.
  if (checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT) {
    return (
      <div className="pb-medium-2 pt-medium-3 flex flex-col">
        <PaddleCheckoutContainer />
      </div>
    );
  }

  return (
    <div className="p-medium-2 flex h-dvh flex-col overflow-hidden md:h-full">
      <ExpressionPlanDetailsMobile
        products={products}
        selectedProduct={selectedProduct}
        onSubscriptionChange={handleSubscriptionChange}
        onClose={onClose}
        apiVersion={apiVersion}
        dsVersion={dsVersion}
        isGuest={isGuest}
        isSettled={isSettled}
        isExpressCheckout={isExpressCheckout}
        handleContinue={handleContinue}
      />
    </div>
  );
};
