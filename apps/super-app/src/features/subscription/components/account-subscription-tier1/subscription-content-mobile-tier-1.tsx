import { useTranslations } from "next-intl";
import React, { useLayoutEffect, useRef, useState } from "react";

import { ECheckoutStep } from "@/components/account-subscription-modal-v4";
import { Button } from "@/components/button";
import { Divider } from "@/components/divider";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_PRO_FEATURES } from "../../constants/subscription";
import type { TSubscriptionContentProps } from "../../types/common";
import { PricingRadioGroupV2 } from "../pricing-radio-group-v2/pricing-radio-group-v2";
import { SubscriptionDetailMobile } from "../subscription-detail-mobile";
import { SubscriptionModel } from "../subscription-model";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import { SubscriptionActionButtonV2 } from "./subscription-action-button-v2";

import styles from "../../styles/styles.module.scss";

const renderLineBreak = () => <br />;

const renderBrandChunk = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

interface TPriceDisplayProps {
  selectedProduct: ProductModel | null;
  commonT: ReturnType<typeof useTranslations>;
  dsT: ReturnType<typeof useTranslations>;
  priceWidthRef: React.RefObject<HTMLSpanElement | null>;
}

const PriceDisplay: React.FC<TPriceDisplayProps> = ({
  selectedProduct,
  commonT,
  dsT,
  priceWidthRef,
}) => {
  if (selectedProduct?.isTrial) {
    return (
      <p className="pb-medium-1.25 pt-medium-1.25 text-bodyS-highlight text-text-general-tertiary">
        {dsT("pricing.startForFree")},{" "}
        {dsT("pricing.thenMonthly", {
          price: selectedProduct?.priceWithCurrencySymbol || "",
        })}
      </p>
    );
  }
  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-col">
        <div className="gap-small-1 relative flex items-center">
          <span
            className="text-app-title-0 absolute text-transparent"
            aria-hidden="true"
            ref={priceWidthRef}
          >
            {selectedProduct?.price}
          </span>

          <span className="text-app-Title1 text-text-general-secondary md:text-app-title-0">
            {selectedProduct?.currencySymbol}
            {selectedProduct?.price || 0}
          </span>
          <span className="text-bodyS-highlight text-text-general-quaternary line-through">
            {selectedProduct?.originalPrice}
          </span>
        </div>
      </div>
      <div className="text-text-general-secondary text-end text-[0px]">
        <span className="text-bodyL-highlight inline-block">
          {selectedProduct?.pricePerWeek}
        </span>
        <span className="text-bodyS-neutral"> /{commonT(`duration.week`)}</span>
      </div>
    </div>
  );
};

const SubscriptionContentMobileTier1: React.FC<TSubscriptionContentProps> = ({
  products,
  activeProduct,
  useTrial,
  onProductSelected,
  onClickSubmitSubscription,
}) => {
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");
  const priceWidthRef = useRef<HTMLSpanElement>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    activeProduct ?? null
  );
  const [_priceWidth, setPriceWidth] = useState(0);

  const user = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const checkoutStep = useGlobalState((state) => state.checkoutStep);
  const isPaddleCheckoutVisible =
    checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT;
  const resetCheckoutFlow = useGlobalState((state) => state.resetCheckoutFlow);
  const guestStore = useGuestStore();
  const { handleLoginToPayment } = useFeatureGating();

  const handleSubscriptionChange = (product: ProductModel) => {
    setSelectedProduct(product);
  };

  const handleContinue = () => {
    if (!selectedProduct) {
      return;
    }
    // Guest User when click
    if (!user.id && guestStore) {
      handleLoginToPayment(selectedProduct);
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

  useLayoutEffect(() => {
    if (priceWidthRef.current) {
      setPriceWidth(priceWidthRef.current.clientWidth);
    }
  }, [selectedProduct?.price]);

  return (
    <>
      <div
        className={compositeStyles(
          "gap-large-4 px-medium-2 flex flex-col overflow-y-auto",
          isPaddleCheckoutVisible ? "h-full" : "h-[calc(100%-96px)]"
        )}
      >
        {/* Subscription list */}
        <div
          className={compositeStyles(
            "gap-large-4 pb-medium-2 flex flex-col",
            showDetail ? "hidden" : "flex"
          )}
        >
          <h3 className="text-app-Title1 text-text-general-secondary text-center leading-[28px] font-medium">
            {dsT.rich("getFullAccess", {
              brand: renderBrandChunk,
              break: renderLineBreak,
            })}
          </h3>
          <SubscriptionModel direction="vertical" />
          <div className="gap-medium-1.5 flex flex-col">
            <div
              className={compositeStyles(
                "gap-y-small-1 rounded-default py-medium-2 pl-medium-2 pr-small-1 flex flex-col overflow-hidden",
                styles["subscription-card-green"]
              )}
            >
              <PricingRadioGroupV2
                products={products}
                defaultValue={selectedProduct}
                onSubscriptionChange={handleSubscriptionChange}
                useTrial={useTrial}
                useShadow
              />
              <div className="gap-small-0 pe-small-1 flex flex-col">
                <div
                  className={compositeStyles(
                    "pb-small-1 text-headingS-Bold text-text-general-secondary uppercase",
                    "bg-gradient-green bg-clip-text text-transparent"
                  )}
                >
                  {commonT("amountPerDuration", {
                    amount: selectedProduct?.numberOfMonths ?? 0,
                    duration: commonT(`duration.month`),
                  })}
                </div>
                <PriceDisplay
                  commonT={commonT}
                  dsT={dsT}
                  priceWidthRef={priceWidthRef}
                  selectedProduct={selectedProduct}
                />
              </div>
              <div className="pe-small-1">
                <Divider
                  direction="horizontal"
                  className="border-border-general-primary! my-small-1"
                />
              </div>
              <div className="gap-small-1 pe-small-1 flex flex-col">
                {SUBSCRIPTION_PRO_FEATURES.map((benefit, idx) => (
                  <div
                    key={idx}
                    className={compositeStyles(
                      "gap-medium-1.5 flex items-center"
                    )}
                  >
                    <SVGIcon
                      className="text-text-general-brand-identity"
                      src={benefit.icon}
                      width={24}
                      height={24}
                    />
                    <div className="flex flex-col">
                      <div className="text-footnoteM-highlight text-text-general-primary">
                        {dsT(benefit.feature)}
                      </div>
                      {!benefit.mobileHideBrief && (
                        <p className="text-footnoteS-neutral text-text-general-tertiary">
                          {dsT(benefit.brief)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Subscription Detail */}
        <div
          className={compositeStyles(
            "pb-medium-2 w-full",
            showDetail ? "flex min-h-0 flex-1 flex-col" : "hidden"
          )}
        >
          {selectedProduct && (
            <div
              className={compositeStyles(
                "flex min-h-0 w-full flex-col",
                isPaddleCheckoutVisible && "min-h-0 flex-1"
              )}
            >
              <div className="gap-medium-2 z-[100] flex items-center md:mb-0">
                <Button
                  color="none"
                  size="none"
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
              <div
                className={compositeStyles(
                  "gap-large-4 relative mt-[20px] flex flex-col md:mt-0",
                  isPaddleCheckoutVisible ? "min-h-0 flex-1" : "min-h-[480px]"
                )}
              >
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
          className="p-medium-2 fixed inset-x-0 bottom-0 h-[96px]"
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

export default SubscriptionContentMobileTier1;
