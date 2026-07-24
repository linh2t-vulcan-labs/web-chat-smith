import { AnimatePresence, motion } from "motion/react";
import type { Transition } from "motion/react";
import { useTranslations } from "next-intl";
import React, { useRef, useState } from "react";

import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import type { ProductModel } from "@/core/models/product";
import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useAutoSubmitPendingCheckout } from "@/features/subscription/hooks/use-auto-submit-pending-checkout";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import type { TAccountSubscriptionTierProps } from "../../types/common";
import { SubscriptionModel } from "../subscription-model";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import ProFeatureSlider from "./pro-feature-slider";
import { ProductCardTier2 } from "./product-card-tier-2";
import SubscriptionTier2Detail from "./subscription-tier-2-detail";

const renderBrandChunk = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

const SubscriptionContentDesktopTier2: React.FC<
  TAccountSubscriptionTierProps
> = ({ products, activeProduct, useTrial, onClickSubmitSubscription }) => {
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
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");

  const handlePayment = (product: ProductModel | null) => {
    if (!product) {
      return;
    }
    onClickSubmitSubscription?.(product);
  };

  const handleBack = () => {
    setSelectedProduct(null);
  };

  const proFeatureText = dsT.rich("proFeatures", {
    brand: renderBrandChunk,
  });
  const getProText = dsT.rich("getPro", {
    brand: renderBrandChunk,
  });

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
      <div
        className={compositeStyles(
          "grid grid-cols-1 grid-rows-[auto] overflow-hidden",
          "relative"
        )}
      >
        {/* Product section - in flow when no selection (drives height); absolute when selected (slides left) */}
        <motion.div
          className={compositeStyles(
            "px-medium-2 col-start-1 row-start-1 flex flex-col",
            selectedProduct && "absolute inset-x-0 top-0"
          )}
          animate={{
            opacity: selectedProduct ? 0 : 1,
            x: selectedProduct ? "-100%" : 0,
          }}
          transition={transition}
          initial={false}
        >
          <h3 className="mb-medium-2 text-app-title-0 text-center font-semibold">
            {proFeatureText}
          </h3>
          <ProFeatureSlider isDesktop={true} />
          <div className="mt-medium-2 gap-medium-2 flex flex-col">
            <h3 className="text-app-title-0 text-center font-semibold">
              {getProText}
            </h3>
            <div className="flex justify-center">
              <div className="no-scrollbar mx-auto grid w-full max-w-[800px]">
                <div className="no-scrollbar gap-large-4 grid auto-cols-[calc(50%-16px)] grid-flow-col overflow-x-auto lg:auto-cols-[calc(50%-32px)]">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      ref={(el) => {
                        cardRefs.current[product.id] = el;
                      }}
                      className="min-w-0"
                    >
                      <ProductCardTier2
                        title={commonT("amountPerDuration", {
                          amount: product.numberOfMonths,
                          duration: commonT(`duration.month`),
                        })}
                        priceWithCurrencySymbol={
                          product.priceWithCurrencySymbol
                        }
                        newPricing={apiVersion === SUBSCRIPTION_API_VERSION.V2}
                        durationUnit={product.durationUnit}
                        originalPrice={product.originalPrice}
                        price={product.price}
                        perWeek={product.pricePerWeek}
                        useTrial={useTrial}
                        isTrial={useTrial && product.isTrial}
                        currencySymbol={product.currencySymbol}
                        onContinue={() => {
                          // Guest User when click
                          if (!user.id && guestStore) {
                            onClickSubmitSubscription?.(product);
                            return;
                          }
                          setSelectedProduct(product);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Product detail section - slides in from the right when selectedProduct is set */}
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
              <div className="flex flex-col items-center">
                <div className="mb-large-4 gap-medium-2 flex flex-col">
                  <h3 className="text-app-title-0 text-center font-semibold">
                    {getProText}
                  </h3>
                  <SubscriptionModel direction="horizontal" />
                </div>
                <div className="relative md:max-w-[400px]">
                  <div
                    className={compositeStyles(
                      "rounded-pill border-thin dark:bg-text-general-secondary p-medium-2"
                    )}
                  >
                    <SubscriptionTier2Detail
                      onBack={handleBack}
                      onContinue={() => handlePayment(selectedProduct)}
                      productInfo={selectedProduct}
                    />
                  </div>
                  <PaddleCheckoutContainer />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubscriptionContentDesktopTier2;
