import { useTranslations } from "next-intl";
import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { Divider } from "@/components/divider";
import { SVGIcon } from "@/components/svg-icon";
import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import { SUBSCRIPTION_UI_VERSION } from "@/config/tracking-event";
import type { ProductModel } from "@/core/models/product";
import { compositeStyles } from "@/utils/commons/styles";

import { productBenefits } from "./constants";
import { PricingRadioGroup } from "./pricing-radio-group";
import { SubscriptionBuildOn } from "./subscription-build-on";

interface TSubscriptionPlanDetailsMobileProps {
  products: ProductModel[];
  selectedProduct?: ProductModel;
  onSubscriptionChange: (product: ProductModel) => void;
  onClose?: () => void;
  apiVersion: string;
  dsVersion: number;
}

const renderGetFullAccessBreak = () => <br />;

const renderGetFullAccessBrand = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

/**
 * Shared mobile plan-selector + pricing-card + benefits scroll region. Rendered identically by both
 * the flag-OFF (master) mobile checkout and the V2 mobile checkout, so the divergence between V1/V2
 * stays confined to the bottom action area.
 */
export const SubscriptionPlanDetailsMobile: React.FC<
  TSubscriptionPlanDetailsMobileProps
> = ({
  products,
  selectedProduct,
  onSubscriptionChange,
  onClose,
  apiVersion,
  dsVersion,
}) => {
  const dsT = useTranslations("ds");
  const commonT = useTranslations("common");
  const priceWidthRef = useRef<HTMLSpanElement>(null);
  const [priceWidth, setPriceWidth] = useState(0);

  useLayoutEffect(() => {
    if (priceWidthRef.current) {
      setPriceWidth(priceWidthRef.current.clientWidth);
    }
  }, [selectedProduct?.price]);

  const isSelectTrialProduct = useMemo(
    () => selectedProduct?.isTrial,
    [selectedProduct]
  );

  return (
    <div className="mt-small-0.5 gap-large-4 flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="-mb-large-4 flex justify-end">
        <SVGIcon
          src="/icons/outlined/closed.svg"
          width={24}
          height={24}
          className="text-text-general-tertiary hover:text-text-general-secondary cursor-pointer"
          onClick={onClose}
        />
      </div>
      <SubscriptionBuildOn />
      <h3 className="text-app-Title1 text-text-general-secondary text-center leading-[28px] font-medium">
        {dsT.rich("getFullAccess", {
          brand: renderGetFullAccessBrand,
          break: renderGetFullAccessBreak,
        })}
      </h3>
      <div className="gap-medium-1.5 flex flex-col">
        <PricingRadioGroup
          newPricing={apiVersion === SUBSCRIPTION_API_VERSION.V2}
          useTrial={SUBSCRIPTION_UI_VERSION.V_5 === dsVersion}
          products={products}
          onSubscriptionChange={onSubscriptionChange}
        />
        <div className="gap-y-medium-2 rounded-default thickness-standard border-border-general-disabled bg-surface-general-tertiary px-medium-3 py-medium-2 flex flex-col overflow-hidden">
          <div className="flex flex-col">
            <div
              className={compositeStyles(
                "pb-small-0.25 text-headingS-Bold text-text-general-secondary uppercase",
                "bg-gradient-green bg-clip-text text-transparent"
              )}
            >
              {commonT("amountPerDuration", {
                amount: selectedProduct?.numberOfMonths ?? 0,
                duration: commonT(`duration.month`),
              })}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="gap-small-1 relative flex items-center">
                  <span
                    className="text-app-title-0 absolute text-transparent"
                    aria-hidden="true"
                    ref={priceWidthRef}
                  >
                    {selectedProduct?.price}
                  </span>

                  <span
                    className="text-app-title-0 text-text-general-secondary"
                    style={{
                      minWidth: priceWidth + 22,
                    }}
                  >
                    {selectedProduct?.currencySymbol}
                    {isSelectTrialProduct ? "0.00" : selectedProduct?.price}
                  </span>
                  {!isSelectTrialProduct && (
                    <span className="text-bodyS-highlight text-text-general-quaternary line-through">
                      {selectedProduct?.originalPrice}
                    </span>
                  )}
                </div>
                {isSelectTrialProduct && (
                  <div className="text-footnoteM-neutral text-text-general-tertiary">
                    {dsT("pricing.dayTrial")},{" "}
                    {dsT("pricing.thenMonthly", {
                      price: selectedProduct?.priceWithCurrencySymbol || "",
                    })}
                  </div>
                )}
              </div>
              {!isSelectTrialProduct && (
                <div className="text-text-general-secondary text-end text-[0px]">
                  <span className="text-bodyM-highlight inline-block">
                    {selectedProduct?.pricePerWeek}
                  </span>
                  <span className="text-footnoteM-neutral">
                    {" "}
                    /{commonT("duration.week")}
                  </span>
                </div>
              )}
            </div>
          </div>
          <Divider
            direction="horizontal"
            className="bg-border-general-secondary!"
          />
          <div className="gap-small-1 flex flex-col">
            {productBenefits.map((benefit, idx) => (
              <div
                key={idx}
                className={compositeStyles(
                  "gap-medium-1.5 flex items-center",
                  benefit.mobileHidden && "hidden"
                )}
              >
                <SVGIcon
                  className="rounded-soft text-icon-general-primary h-6"
                  src={benefit.icon}
                  width={24}
                  height={24}
                />
                <div className="flex flex-col">
                  <div className="text-footnoteM-highlight text-text-action-primary-default">
                    {dsT(benefit.feature)}
                  </div>
                  {!benefit.mobileHideBrief && (
                    <p className="text-footnoteS-neutral text-text-general-secondary">
                      {dsT(benefit.brief)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Divider
            direction="horizontal"
            className="bg-border-general-secondary!"
          />
          <div className="gap-small-1 flex flex-col">
            <div className="text-footnoteM-highlight text-text-general-quaternary">
              {dsT("upcomingFeatures")}
            </div>
            <div className="gap-small-0.75 flex items-center">
              <SVGIcon
                className="text-text-general-primary"
                src="/icons/outlined/check.svg"
                width={16}
                height={16}
              />
              <span className="text-footnoteM-highlight text-text-general-secondary">
                {dsT("AIAgents")}
              </span>
            </div>
            <div className="gap-small-0.75 flex items-center">
              <SVGIcon
                className="text-text-general-primary"
                src="/icons/outlined/check.svg"
                width={16}
                height={16}
              />
              <span className="text-footnoteM-highlight text-text-general-secondary">
                {dsT("videoGeneration")}
              </span>
            </div>
            <div className="gap-small-0.75 flex items-center">
              <SVGIcon
                className="text-text-general-primary"
                src="/icons/outlined/check.svg"
                width={16}
                height={16}
              />
              <span className="text-footnoteM-highlight text-text-general-secondary">
                {dsT("aiCompanion")}
              </span>
            </div>
            <p className="text-footnoteM-neutral text-text-general-quaternary">
              {dsT("moreFeature")}
            </p>
          </div>
        </div>
      </div>

      <div className="gap-small-1 order-0 -mt-5 flex items-center justify-center md:order-2">
        <SVGIcon
          className="text-text-general-primary"
          src="/icons/filled/time.svg"
          width={16}
          height={16}
        />
        <span className="text-bodyS-highlight text-text-general-secondary uppercase">
          {dsT("cancelAnytime")}
        </span>
      </div>
    </div>
  );
};
