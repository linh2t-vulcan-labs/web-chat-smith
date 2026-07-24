import { AnimatePresence, motion } from "motion/react";
import type { Transition } from "motion/react";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import type { ProductModel } from "@/core/models/product";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_PRO_FEATURES } from "../../constants/subscription";
import type { TAccountSubscriptionTierProps } from "../../types/common";
import { SubscriptionModel } from "../subscription-model";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import { ProductCardTier3 } from "./product-card-tier-3";
import SubscriptionTier3Detail from "./subscription-tier-3-detail";

const renderBrandChunk = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

const SubscriptionContentDesktopTier3: React.FC<
  TAccountSubscriptionTierProps
> = ({ products, activeProduct, useTrial, onClickSubmitSubscription }) => {
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    activeProduct ?? null
  );
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const user = useGlobalState((state) => state.user);
  const guestStore = useGuestStore();
  const handlePayment = (product: ProductModel) => {
    onClickSubmitSubscription?.(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const transition: Transition = {
    duration: 0.3,
    ease: "easeInOut",
    type: "tween",
  };
  useAutoSubmitPendingCheckout({
    applySelectedProduct: setSelectedProduct,
    products,
    selectedProduct,
  });

  return (
    <div className="w-full overflow-hidden">
      {/* Fixed Header - no animation */}
      <div className="px-medium-2 mx-auto flex w-full max-w-[1086px] flex-col">
        <div className="gap-large-4 py-large-4 flex flex-col items-center">
          <h3 className="text-app-title-0 text-center font-semibold">
            {dsT.rich("getPro", {
              brand: renderBrandChunk,
            })}
          </h3>
          <SubscriptionModel direction="horizontal" />
        </div>
      </div>
      {/* Animated content only - product grid slides left, detail slides in from right */}
      <div
        className={compositeStyles(
          "relative grid grid-cols-1 grid-rows-[auto] overflow-hidden"
        )}
      >
        {/* Product content - in flow when no selection; absolute when selected (slides left) */}
        <motion.div
          className={compositeStyles(
            "px-medium-2 col-start-1 row-start-1 mx-auto flex w-full max-w-[1086px] flex-col",
            selectedProduct && "absolute inset-x-0 top-0"
          )}
          animate={{
            opacity: selectedProduct ? 0 : 1,
            x: selectedProduct ? "-100%" : 0,
          }}
          transition={transition}
          initial={false}
        >
          <div className="py-large-4 lg:gap-large-4 xl:gap-large-10 grid w-full grid-cols-[320px_1fr]">
            <div className="gap-large-4 flex flex-col">
              <div className="text-bodyM-highlight">
                {dsT.rich("proBenefits", {
                  brand: renderBrandChunk,
                })}
              </div>
              <div className="gap-small-1 flex flex-col">
                {SUBSCRIPTION_PRO_FEATURES.map((benefit, idx) => (
                  <div
                    key={idx}
                    className={compositeStyles(
                      "gap-medium-2 py-small-0.5 flex items-center"
                    )}
                  >
                    <SVGIcon
                      className="text-border-brand-identity"
                      src={benefit.icon}
                      width={20}
                      height={20}
                    />
                    <div className="flex flex-col">
                      <div className="text-bodyS-highlight text-text-general-secondary">
                        {dsT(benefit.feature)}
                      </div>
                      <p className="text-footnoteM-neutral text-text-general-quaternary">
                        {dsT(benefit.brief)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="gap-large-4 flex flex-col">
              <div className="text-bodyM-highlight text-text-general-secondary">
                {dsT("chooseYourPlan")}
              </div>
              <div className="no-scrollbar gap-medium-2 grid auto-cols-[calc(50%-8px)] grid-flow-col overflow-x-auto">
                {products.map((product) => {
                  const durationUnitKey = `duration.${product.durationUnitLabel}`;
                  const durationUnitLabel = `/${commonT(durationUnitKey)}`;
                  return (
                    <div
                      key={product.id}
                      ref={(el) => {
                        cardRefs.current[product.id] = el;
                      }}
                      className="min-w-0"
                    >
                      <ProductCardTier3
                        title={commonT("amountPerDuration", {
                          amount: product.numberOfMonths,
                          duration: commonT(`duration.month`),
                        })}
                        durationUnit={product.durationUnit}
                        originalPrice={product.originalPrice}
                        price={product.price}
                        currencySymbol={product.currencySymbol}
                        useTrial={useTrial}
                        isTrial={useTrial && product.isTrial}
                        newPricing={apiVersion === SUBSCRIPTION_API_VERSION.V2}
                        perWeek={product.pricePerWeek}
                        onContinue={() => {
                          // Guest User when click
                          if (!user.id && guestStore) {
                            handlePayment(product);
                            return;
                          }
                          // Handle logged in user flow
                          setSelectedProduct(product);
                        }}
                        durationUnitLabel={durationUnitLabel}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>
        {/* Product detail - slides in from the right when selectedProduct is set */}
        <AnimatePresence mode="wait">
          {selectedProduct && (
            <motion.div
              key="product-detail"
              className="col-start-1 row-start-1 flex w-full justify-center"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={transition}
            >
              <div className="py-large-4 relative md:max-w-[400px]">
                <div
                  className={compositeStyles(
                    "rounded-pill bg-surface-general-tertiary dark:bg-text-general-secondary p-medium-2"
                  )}
                >
                  <SubscriptionTier3Detail
                    onBack={handleBack}
                    onContinue={() => {
                      handlePayment(selectedProduct);
                    }}
                    productInfo={selectedProduct}
                  />
                </div>
                <PaddleCheckoutContainer />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubscriptionContentDesktopTier3;
