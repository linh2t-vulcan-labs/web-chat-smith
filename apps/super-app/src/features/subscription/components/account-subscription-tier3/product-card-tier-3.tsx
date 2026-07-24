import { useTranslations } from "next-intl";
import React from "react";

import { calculateDiscountPercentage } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { SubscriptionActionButtonV2 } from "../account-subscription-tier1/subscription-action-button-v2";
import { DiscountBadge } from "../discount-badge";
import { GradientBadgeText } from "../gradient-badge-text";
import type { TProductCardTier3Props } from "./types";

import styles from "../../styles/styles.module.scss";

const renderStrongChunk = (chunk: React.ReactNode) => (
  <span className="text-bodyXL-Highlight text-text-general-primary">
    {chunk}
  </span>
);

export const ProductCardTier3: React.FC<TProductCardTier3Props> = ({
  title,
  price,
  perWeek,
  originalPrice,
  isTrial,
  useTrial,
  onContinue,
  currencySymbol = "",
  durationUnitLabel = "",
}) => {
  const dsT = useTranslations("ds");
  const discountPercent = calculateDiscountPercentage(
    originalPrice,
    price,
    currencySymbol
  );

  let badge: React.ReactNode = (
    <DiscountBadge
      saveLabel={dsT("badge.saveText")}
      percent={discountPercent}
    />
  );
  if (useTrial) {
    badge = isTrial ? null : (
      <GradientBadgeText
        content={`${dsT("badge.saveText")} ${discountPercent}%`}
        className="text-bodyL-highlight!"
      />
    );
  }

  return (
    <div
      className={compositeStyles(
        "border-border-brand-identity rounded-rounded border-thin p-medium-2 relative h-full",
        styles["shadow-base"],
        styles["subscription-card-green-tier3"]
      )}
    >
      <div className="gap-medium-2 pb-medium-1.5 flex flex-col items-center justify-between">
        <div
          className={compositeStyles(
            "py-small-0.5 text-title1 text-text-general-primary font-bold capitalize",
            useTrial ? "order-2" : "order-1"
          )}
        >
          {title}
        </div>
        <div
          className={compositeStyles(
            "h-6 min-h-6",
            useTrial ? "order-1" : "order-2"
          )}
        >
          {badge}
        </div>
      </div>

      {/* Body */}
      <div className="mt-large-6 gap-small-1 flex flex-col items-center">
        <div className="text-app-Title2 text-text-general-tertiary line-through">
          {originalPrice}
        </div>
        <div className="gap-medium-2 flex flex-col items-center">
          <div className="text-app-display-medium text-text-general-primary flex items-center gap-1">
            {currencySymbol}
            {price}
            <span className="text-app-Title2">{durationUnitLabel}</span>
          </div>
          <div className="text-bodyM-neutral">
            {dsT.rich("onlyPerWeek", {
              price: perWeek,
              strong: renderStrongChunk,
            })}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="pt-large-5">
        <div className="pt-medium-2.5">
          <SubscriptionActionButtonV2
            isTrial={isTrial}
            showCancel={false}
            onContinue={onContinue}
          />
        </div>
      </div>
      {isTrial && (
        <div className="rounded-ee-rounded rounded-es-rounded bg-gradient-green px-medium-1.5 py-small-0.5 text-memoji text-text-general-inverse absolute -top-px start-1/2 w-max -translate-x-1/2">
          {dsT("pricing.freeTrial")}
        </div>
      )}
    </div>
  );
};
