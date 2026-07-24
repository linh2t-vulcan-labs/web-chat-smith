import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";

import { ECheckoutStep } from "@/components/account-subscription-modal-v4";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import {
  SUBSCRIPTION_PRO_FEATURES_TIER1,
  SUBSCRIPTION_TIER,
} from "../../constants/subscription";
import type { TSubscriptionContentProps } from "../../types/common";
import { PricingRadioGroupV2 } from "../pricing-radio-group-v2/pricing-radio-group-v2";
import { SubscriptionModel } from "../subscription-model";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import SubscriptionCard from "./subscription-card";
import SubscriptionDesktopDetail from "./subscription-desktop-detail";

const renderBrandChunk = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

const SubscriptionContentDesktopTier1: React.FC<TSubscriptionContentProps> = ({
  products,
  activeProduct,
  useTrial,
  onClickSubmitSubscription,
}) => {
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    activeProduct ?? null
  );
  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const resetCheckoutFlow = useGlobalState((state) => state.resetCheckoutFlow);

  const handleSubscriptionChange = (product: ProductModel) => {
    if (
      product?.id !== selectedProduct?.id &&
      checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT
    ) {
      resetCheckoutFlow();
    }
    setSelectedProduct(product);
  };

  const handlePayment = useCallback(
    (product?: ProductModel) => {
      if (!product) {
        return;
      }

      // Trigger Paddle checkout flow
      onClickSubmitSubscription?.(product);
    },
    [onClickSubmitSubscription]
  );

  useAutoSubmitPendingCheckout({
    applySelectedProduct: setSelectedProduct,
    onSubmit: handlePayment,
    products,
    selectedProduct,
  });

  const renderFeature = (size: "medium" | "large") =>
    SUBSCRIPTION_PRO_FEATURES_TIER1.map((item, idx) => (
      <div className="gap-small-0.75 flex items-center" key={idx}>
        <SVGIcon
          className="text-icon-action-primary-default"
          src="/icons/outlined/check.svg"
          width={16}
          height={16}
        />
        <span
          className={compositeStyles(
            "text-text-general-secondary text-left",
            size === "large" ? "text-bodyS-neutral" : "text-footnoteM-neutral"
          )}
        >
          {dsT(item)}
        </span>
      </div>
    ));

  return (
    <div className="gap-large-4 flex flex-col items-center">
      <div className="gap-large-4 py-medium-3 flex flex-col items-center">
        <h3 className="text-app-title-0 text-center font-semibold">
          {dsT.rich("getPro", {
            brand: renderBrandChunk,
          })}
        </h3>
        <SubscriptionModel direction="horizontal" />
      </div>

      <div
        className={compositeStyles(
          "gap-medium-2 grid w-full",
          "grid-cols-[400px_400px_1fr]"
        )}
      >
        <SubscriptionCard
          className="h-full"
          packageName={commonT("free")}
          subtitle={`(${dsT("yourCurrentPlan")})`}
        >
          <div className="gap-small-1 flex flex-col">
            <div className="text-bodyM-highlight text-text-general-secondary">
              {dsT("features")}:
            </div>
            <div className="gap-small-1 flex flex-col">
              <div className="gap-small-0.75 flex items-center">
                <SVGIcon
                  className="text-icon-action-primary-default"
                  src="/icons/outlined/check.svg"
                  width={16}
                  height={16}
                />
                <span className="text-footnoteM-neutral text-text-general-secondary">
                  {dsT("desktop.features.1.title")}
                </span>
              </div>
            </div>
          </div>
        </SubscriptionCard>
        <SubscriptionCard
          packageName={commonT("pro")}
          color="primary"
          innerClassName="pl-medium-2! pb-medium-2! pt-medium-3! pr-small-1!"
          headerClassName="pl-small-1 pr-medium-2"
        >
          <div className="space-y-medium-3 px-small-1">
            <div className="gap-small-1 flex flex-col">
              <div className="text-bodyM-highlight text-text-general-secondary">
                {dsT("features")}
              </div>
              <div className="gap-small-1 flex flex-col">
                {renderFeature("medium")}
              </div>
            </div>
            <PricingRadioGroupV2
              products={products}
              defaultValue={selectedProduct}
              onSubscriptionChange={handleSubscriptionChange}
              tier={SUBSCRIPTION_TIER.TIER1}
              useTrial={useTrial}
              useShadow
            />
          </div>
        </SubscriptionCard>

        <div className="ps-large-6 pt-medium-3 md:ml-small-0.75 relative">
          {selectedProduct && (
            <SubscriptionDesktopDetail
              productInfo={selectedProduct}
              onContinue={() => handlePayment(selectedProduct)}
            />
          )}

          <PaddleCheckoutContainer />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionContentDesktopTier1;
