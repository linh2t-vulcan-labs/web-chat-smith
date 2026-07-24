import { useTranslations } from "next-intl";
import React, { useMemo, useState } from "react";

import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import { SUBSCRIPTION_UI_VERSION } from "@/config/tracking-event";
import type { ProductModel } from "@/core/models/product";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { PricingRadioGroup } from "./pricing-radio-group";
import { SubscriptionActionButton } from "./subscription-action-button";
import type { TGetFullAccessCardProps } from "./types";
import { ECheckoutStep } from "./types";

const renderBreak = () => <br />;

const renderBrand = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

export const GetFullAccessCard: React.FC<TGetFullAccessCardProps> = ({
  products,
  onClickSubmitSubscription,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<ProductModel>();
  const dsT = useTranslations("ds");
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const dsVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION
  );

  const isPaddleCheckoutLoaded =
    checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT;

  const handleContinue = (selectedCheckoutProduct?: ProductModel) => {
    const targetProduct = selectedCheckoutProduct || selectedProduct;
    if (!targetProduct) {
      return;
    }

    onClickSubmitSubscription?.(targetProduct);
  };

  const handleSubscriptionChange = (product: ProductModel) => {
    setSelectedProduct(product);
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

  return (
    <div
      className={compositeStyles(
        "flex size-full items-center justify-center bg-transparent transition-all duration-300 ease-in-out",
        isPaddleCheckoutLoaded
          ? "pointer-events-none scale-95 opacity-0"
          : "scale-100 opacity-100"
      )}
    >
      <div
        className={compositeStyles(
          "rounded-default size-full p-px",
          isPaddleCheckoutLoaded ? "" : "bg-gradient-green"
        )}
      >
        <div className="rounded-default bg-surface-general-tertiary size-full">
          <div className="gap-y-large-5 p-large-4 flex flex-col overflow-hidden">
            <h3 className="text-app-title-0 text-center font-semibold">
              {dsT.rich("getFullAccess", {
                brand: renderBrand,
                break: renderBreak,
              })}
            </h3>
            {/* Body */}
            {/* GU-1573 */}
            <PricingRadioGroup
              products={products}
              newPricing={apiVersion === SUBSCRIPTION_API_VERSION.V2}
              useTrial={SUBSCRIPTION_UI_VERSION.V_5 === dsVersion}
              onSubscriptionChange={handleSubscriptionChange}
            />
            {/* Action button */}
            <SubscriptionActionButton
              onContinue={handleContinue}
              submitBtnText={
                isSelectTrialProduct ? dsT("trialSubmit") : dsT("submit")
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
