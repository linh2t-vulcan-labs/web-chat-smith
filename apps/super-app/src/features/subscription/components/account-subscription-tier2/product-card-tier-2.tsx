import { useTranslations } from "next-intl";
import React from "react";

import { Divider } from "@/components/divider";
import { calculateDiscountPercentage } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { SubscriptionActionButtonV2 } from "../account-subscription-tier1/subscription-action-button-v2";
import { DiscountBadge } from "../discount-badge";
import { GradientBadgeText } from "../gradient-badge-text";
import type { TProductCardProps } from "./types";

import styles from "../../styles/styles.module.scss";

const renderStrongChunk = (chunk: React.ReactNode) => (
  <span className="text-memoji text-text-general-primary">{chunk}</span>
);

export const ProductCardTier2: React.FC<TProductCardProps> = ({
  title,
  price,
  priceWithCurrencySymbol,
  perWeek,
  useTrial = false,
  isTrial = false,
  originalPrice,
  onContinue,
  currencySymbol = "",
}) => {
  const dsT = useTranslations("ds");
  const commonT = useTranslations("common");
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
        "border-border-brand-identity rounded-rounded border-thin p-medium-2 relative",
        styles["subscription-card-green"]
      )}
    >
      <div className="pb-medium-2 flex items-center justify-between">
        <div className="text-title1 text-text-general-primary font-bold capitalize">
          {title}
        </div>
        {badge}
      </div>
      <Divider
        direction="horizontal"
        className="border-border-inputControls-neutral-hover pt-medium-2"
      />
      {/* Body */}
      {isTrial ? (
        <div className="py-medium-2 flex flex-col items-center">
          <div style={{ minHeight: 28 }} />
          <div className="text-display-medium text-text-general-secondary uppercase">
            {commonT("free")}
          </div>
          <p className="text-bodyL-neutral text-text-general-tertiary">
            {dsT("pricing.startForFree")},{" "}
            {dsT("pricing.thenMonthly", {
              price: priceWithCurrencySymbol || "",
            })}
          </p>
        </div>
      ) : (
        <div className="py-medium-2 flex flex-col items-center">
          <div className="text-bodyL-neutral text-text-general-tertiary line-through">
            {originalPrice}
          </div>
          <div className="text-app-display-medium text-text-general-secondary">
            {price}
          </div>
          <div className="text-bodyL-neutral text-text-general-secondary">
            {dsT.rich("onlyPerWeek", {
              price: perWeek,
              strong: renderStrongChunk,
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-medium-2">
        <SubscriptionActionButtonV2 isTrial={isTrial} onContinue={onContinue} />
      </div>
      {/* Trial badge */}
      {isTrial && (
        <div className="rounded-es-rounded rounded-se-rounded bg-gradient-green px-medium-2 py-small-0.5 text-memoji text-text-general-inverse absolute -top-px -right-px hidden w-max md:block">
          {dsT("pricing.freeTrial")}
        </div>
      )}
    </div>
  );
};
