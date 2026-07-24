import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { ECheckoutStep } from "@/components/account-subscription-modal-v4/types";
import { ButtonV2 } from "@/components/button-v2";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_TIER } from "../../constants/subscription";
import type { TAccountSubscriptionTierProps } from "../../types/common";
import { SubscriptionActionButtonV2 } from "../account-subscription-tier1/subscription-action-button-v2";
import { PricingRadioGroupV2 } from "../pricing-radio-group-v2/pricing-radio-group-v2";
import { SubscriptionDetailMobile } from "../subscription-detail-mobile";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import ProFeatureSlider from "./pro-feature-slider";

const renderBrandChunk = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

const SubscriptionContentMobileTier2: React.FC<
  TAccountSubscriptionTierProps
> = ({
  products,
  activeProduct,
  useTrial,
  onProductSelected,
  onClickSubmitSubscription,
}) => {
  const dsT = useTranslations("ds");
  const [showDetail, setShowDetail] = useState(false);
  const user = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    activeProduct ?? null
  );
  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const isPaddleCheckoutVisible =
    checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT;
  const resetCheckoutFlow = useGlobalState((state) => state.resetCheckoutFlow);
  const guestStore = useGuestStore();

  const handleSubscriptionChange = (product: ProductModel) => {
    setSelectedProduct(product);
  };

  const handleContinue = () => {
    if (!selectedProduct) {
      return;
    }
    // Guest User when click
    if (!user.id && guestStore) {
      onClickSubmitSubscription?.(selectedProduct);
      return;
    }
    // Handle logged in user flow
    if (showDetail) {
      onClickSubmitSubscription?.(selectedProduct);
      return;
    }
    setShowDetail(true);
    onProductSelected?.(selectedProduct);
  };

  const handleBack = () => {
    if (isPaddleCheckoutVisible) {
      resetCheckoutFlow();
    }
    setShowDetail(false);
    onProductSelected?.();
  };

  useAutoSubmitPendingCheckout({
    applySelectedProduct: setSelectedProduct,
    onProductApplied: (product) => {
      setShowDetail(true);
      onProductSelected?.(product);
    },
    products,
    selectedProduct,
  });

  return (
    <>
      <div className="gap-large-4 pb-large-4 ps-medium-2 pe-small-0 md:pr-medium-2 flex h-[calc(100%-96px)] flex-col overflow-y-auto">
        {/* Subscription list */}
        <div
          className={compositeStyles(
            "pb-medium-2 w-full",
            showDetail ? "hidden" : "block"
          )}
        >
          <div className="mb-large-4 gap-large-4 flex flex-col">
            <h3 className="text-app-Title1 text-center font-medium">
              {dsT.rich("brandProFeatures", {
                brand: renderBrandChunk,
              })}
            </h3>
            <ProFeatureSlider />
          </div>
          <div className="gap-large-4 pe-medium-2 flex flex-col">
            <div className="text-app-Title1 text-text-general-secondary text-center">
              {dsT("chooseYourPlan")}
            </div>
            <PricingRadioGroupV2
              tier={SUBSCRIPTION_TIER.TIER2}
              products={products}
              defaultValue={selectedProduct}
              onSubscriptionChange={handleSubscriptionChange}
              useTrial={useTrial}
            />
          </div>
        </div>
        {/* Subscription Detail */}
        <div
          className={compositeStyles(
            "pr-medium-2 w-full",
            showDetail ? "flex" : "hidden"
          )}
        >
          {selectedProduct && (
            <div className="gap-large-4 flex w-full flex-col">
              <div className="gap-medium-2 flex items-center">
                <ButtonV2
                  color="text"
                  className="p-0!"
                  onClick={handleBack}
                  startIcon={
                    <SVGIcon
                      src="/icons/outlined/long-arrow-left-v2.svg"
                      className="text-icon-general-secondary"
                      width={24}
                      height={24}
                    />
                  }
                />
                <div className="text-app-Title1 text-text-general-secondary">
                  {dsT("info.billingDetails")}
                </div>
              </div>

              <div className="gap-large-4 relative mt-[20px] flex flex-col">
                {!isPaddleCheckoutVisible && (
                  <SubscriptionDetailMobile
                    productInfo={selectedProduct}
                    userInfo={user}
                    userSubscriptionInfo={userSubscriptionInfo}
                  />
                )}
                <PaddleCheckoutContainer
                  embedInFlow={isPaddleCheckoutVisible}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Action button */}
      {!isPaddleCheckoutVisible && (
        <div
          className="p-medium-2 fixed inset-x-0 bottom-0 z-10 h-[96px]"
          style={{
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <SubscriptionActionButtonV2
            disabled={false}
            onContinue={handleContinue}
            isTrial={useTrial && !showDetail && selectedProduct?.isTrial}
          />
        </div>
      )}
    </>
  );
};

export default SubscriptionContentMobileTier2;
