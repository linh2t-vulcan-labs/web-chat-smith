import { useTranslations } from "next-intl";
import type { FC } from "react";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import { SUBSCRIPTION_UI_VERSION } from "@/config/tracking-event";
import type { ProductModel } from "@/core/models/product";

import { MobileExpressCheckout } from "../mobile-express-checkout";
import { BenefitSection } from "./benefit-section";
import { ExpressSubscriptionActionButton } from "./express-subcription-button";
import { ExpressionSubscriptionBuildOn } from "./expression-subcription-build-on";
import { PricingRadioGroup } from "./pricing-radio/pricing-radio-group";

const CheckoutActionSkeleton: FC = () => (
  <div
    className="gap-small-1 flex animate-pulse flex-col"
    style={{ minWidth: 312 }}
  >
    <div className="rounded-pill-soft bg-surface-general-quaternary h-11 w-full" />
    <div className="rounded-pill-soft bg-surface-general-quaternary h-11 w-full" />
  </div>
);

const renderEmptyBreak = () => null;

const renderBrand = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

interface TSubscriptionPlanDetailsMobileProps {
  products: ProductModel[];
  selectedProduct?: ProductModel;
  onSubscriptionChange: (product: ProductModel) => void;
  onClose?: () => void;
  apiVersion: string;
  dsVersion: number;
  isGuest: boolean;
  isSettled: boolean;
  isExpressCheckout: boolean;
  handleContinue?: () => void;
}

/**
 * Shared mobile plan-selector + pricing-card + benefits scroll region. Rendered identically by both
 * the flag-OFF (master) mobile checkout and the V2 mobile checkout, so the divergence between V1/V2
 * stays confined to the bottom action area.
 */
export const ExpressionPlanDetailsMobile: React.FC<
  TSubscriptionPlanDetailsMobileProps
> = ({
  products,
  selectedProduct,
  onSubscriptionChange,
  onClose,
  apiVersion,
  dsVersion,
  isGuest,
  isSettled,
  isExpressCheckout,
  handleContinue,
}) => {
  const dsT = useTranslations("ds");
  const priceWidthRef = useRef<HTMLSpanElement>(null);
  const [, setPriceWidth] = useState(0);

  useLayoutEffect(() => {
    if (priceWidthRef.current) {
      setPriceWidth(priceWidthRef.current.clientWidth);
    }
  }, [selectedProduct?.price]);

  const isSelectTrialProduct = useMemo(
    () => selectedProduct?.isTrial,
    [selectedProduct]
  );

  const renderCheckoutAction = () => {
    // Guests: Continue immediately (profile never settles for a guest). Continue → login.
    if (isGuest) {
      return (
        <ExpressSubscriptionActionButton
          onContinue={() => handleContinue?.()}
          submitBtnText={
            isSelectTrialProduct ? dsT("trialSubmit") : dsT("submit")
          }
        />
      );
    }
    if (!isSettled) {
      return <CheckoutActionSkeleton />;
    }
    if (isExpressCheckout) {
      return <MobileExpressCheckout product={selectedProduct} />;
    }
    // Apple Pay unavailable → standard Continue button (no auto-opened iframe).
    return (
      <ExpressSubscriptionActionButton
        onContinue={() => handleContinue?.()}
        submitBtnText={
          isSelectTrialProduct ? dsT("trialSubmit") : dsT("submit")
        }
      />
    );
  };

  return (
    <div className="mt-small-0.5 gap-medium-2.5 flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="-mb-large-4 relative z-10 flex justify-end">
        <SVGIcon
          src="/icons/outlined/closed.svg"
          width={24}
          height={24}
          className="text-text-general-tertiary hover:text-text-general-secondary cursor-pointer"
          onClick={onClose}
        />
      </div>

      <ExpressionSubscriptionBuildOn />

      <h3 className="text-app-Title1 text-text-general-secondary text-center leading-[28px] font-medium">
        {dsT.rich("getPro", {
          brand: renderBrand,
          break: renderEmptyBreak,
        })}
      </h3>
      <span className="text-bodyS-neutral text-text-general-secondary text-center">
        {dsT("expressDescription")}
      </span>
      <div className="gap-medium-1.5 flex flex-col">
        <PricingRadioGroup
          newPricing={apiVersion === SUBSCRIPTION_API_VERSION.V2}
          useTrial={SUBSCRIPTION_UI_VERSION.V_5 === dsVersion}
          products={products}
          onSubscriptionChange={onSubscriptionChange}
        />

        {renderCheckoutAction()}

        <BenefitSection className="mt-medium-2.5" />
      </div>
    </div>
  );
};
