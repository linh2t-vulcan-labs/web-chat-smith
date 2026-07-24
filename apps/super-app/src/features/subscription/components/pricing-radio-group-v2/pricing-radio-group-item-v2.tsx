import { useTranslations } from "next-intl";
import { RadioGroup } from "radix-ui";
import React from "react";

import { Divider } from "@/components/divider";
import type { ProductModel } from "@/core/models/product";
import { calculateDiscountPercentage } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_TIER } from "../../constants/subscription";
import { GradientBadgeText } from "../gradient-badge-text";
import type { TPricingRadioGroupProps } from "./types";

import styles from "../../styles/styles.module.scss";

interface TPricingRadioGroupItemProps {
  product: ProductModel;
  isSelected: boolean;
  isActive?: boolean;
  newPricing?: boolean;
  isNewUI?: boolean;
  useShadow?: boolean;
  useTrial?: boolean;
  useTrialUI?: boolean;
  isTrial?: boolean;
  tier?: number;
  extraContent?: TPricingRadioGroupProps["extraContent"];
  showRadioIndicator?: boolean;
}

interface TBadgeContentOptions {
  newPricing?: boolean;
  tier?: number;
}

type TTranslateFn = ReturnType<typeof useTranslations>;

interface TTierVariantProps {
  product: ProductModel;
  isSelected: boolean;
  isTrial?: boolean;
  useTrial?: boolean;
  badgeContent: React.ReactNode;
  commonT: TTranslateFn;
  dsT: TTranslateFn;
}

const getBadgeContent = (
  originalPrice: string,
  sellingPrice: number,
  currencySymbol: string,
  dsT: ReturnType<typeof useTranslations>,
  options?: TBadgeContentOptions
) => {
  const { tier = SUBSCRIPTION_TIER.TIER1 } = options || {};
  const badgePercentage = calculateDiscountPercentage(
    originalPrice,
    sellingPrice,
    currencySymbol
  );

  if (!badgePercentage) {
    return null;
  }

  const saveText = dsT("badge.saveText");

  return (
    <span className="flex items-center">
      <span
        className={compositeStyles(
          "pr-small-0.25",
          tier === SUBSCRIPTION_TIER.TIER1 && "hidden md:inline-block",
          tier === SUBSCRIPTION_TIER.TIER2 && "inline-block font-medium",
          tier === SUBSCRIPTION_TIER.TIER3 && "inline-block font-semibold"
        )}
      >
        {saveText}{" "}
      </span>
      <span
        className={compositeStyles(
          "inline-block md:hidden",
          tier === SUBSCRIPTION_TIER.TIER1 ? "" : "hidden!"
        )}
      >
        -
      </span>
      <span
        className={compositeStyles(
          tier === SUBSCRIPTION_TIER.TIER1 && "font-bold md:font-semibold",
          tier === SUBSCRIPTION_TIER.TIER2 && "font-medium",
          tier === SUBSCRIPTION_TIER.TIER3 && "font-semibold"
        )}
      >
        {badgePercentage}
      </span>
      %
    </span>
  );
};

function renderTier2Badge({
  useTrial,
  isTrial,
  isSelected,
  badgeContent,
}: {
  useTrial?: boolean;
  isTrial?: boolean;
  isSelected: boolean;
  badgeContent: React.ReactNode;
}) {
  if (useTrial) {
    if (isTrial) {
      return null;
    }
    return (
      <GradientBadgeText
        className="text-bodyM-highlight! end-medium-1.5 top-medium-2 absolute z-10"
        content={badgeContent}
      />
    );
  }
  return (
    <span className="relative">
      <span
        className={compositeStyles(
          "rounded-half bg-surface-action-default-default px-small-0.75 relative inline-flex w-max items-center justify-center",
          isSelected && "light bg-gradient-green"
        )}
      >
        <span className="py-small-0.5 text-footnoteM-highlight dark:text-text-general-inverse md:py-small-0 md:text-bodyM-highlight relative z-10">
          {badgeContent}
        </span>
        {isSelected && (
          <span className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]" />
        )}
      </span>
    </span>
  );
}

const PricingRadioGroupItemTier2: React.FC<TTierVariantProps> = ({
  product,
  isSelected,
  isTrial,
  useTrial,
  badgeContent,
  commonT,
  dsT,
}) => (
  <RadioGroup.Item
    value={product.id}
    className={compositeStyles(
      "data-[state=checked]:border-border-brand-identity rounded-rounded border-standard border-border-general-secondary p-medium-1.5 data-[state=checked]:bg-surface-general-highlight md:border-thin relative flex size-full flex-col items-baseline justify-between transition-all after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none data-[state=unchecked]:border-white/20",
      !isSelected && styles["subscription-card-tier2"]
    )}
  >
    <div className="gap-medium-2 z-10 flex w-full flex-col items-start">
      <div className="gap-small-1 flex w-full flex-col items-start">
        <div className="gap-small-1 flex w-full items-center justify-between">
          <div className="gap-small-1 flex items-center">
            <span className="border-standard border-icon-general-tertiary relative flex size-[18px] min-w-[18px] items-center justify-center rounded-full transition-colors">
              <RadioGroup.Indicator className="bg-gradient-green p-small-0.25 rounded-full text-[0px]">
                <span className="p-small-0.25 bg-surface-general-highlight-lighten inline-block rounded-full dark:bg-[#273d38]">
                  <span className="after:bg-gradient-green relative after:block after:size-[10px] after:rounded-full" />
                </span>
              </RadioGroup.Indicator>
            </span>
            <span
              className={compositeStyles(
                "text-app-Title2 lowercase",
                isSelected && "bg-gradient-green bg-clip-text text-transparent"
              )}
            >
              {commonT("amountPerDuration", {
                amount: product.numberOfMonths,
                duration: commonT(`duration.month`),
              })}
            </span>
          </div>
          {badgeContent && (
            <>
              {renderTier2Badge({
                badgeContent,
                isSelected,
                isTrial,
                useTrial,
              })}
            </>
          )}
        </div>
      </div>
      <div className="gap-medium-2 flex w-full items-end justify-between">
        {isTrial ? (
          <div
            className="text-app-title-0 text-text-general-secondary flex flex-col justify-end uppercase"
            style={{ minHeight: 64 }}
          >
            <span>{commonT("free")}</span>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-bodyL-neutral text-text-general-tertiary flex min-h-6 line-through">
              {product.originalPrice}
            </span>
            <span className="text-app-title-0 text-text-general-secondary">
              {product.sellingPrice}
            </span>
          </div>
        )}
        {isTrial ? (
          <div className="flex flex-col">
            <div
              className="text-bodyL-neutral text-text-general-tertiary text-end"
              style={{
                maxWidth: 156,
              }}
            >
              {dsT("pricing.startForFree")},{" "}
              {dsT("pricing.thenMonthly", {
                price: product.priceWithCurrencySymbol || "",
              })}
            </div>
          </div>
        ) : (
          <div className="gap-small-0.5 flex items-center">
            <span className="text-app-Title1 text-text-general-secondary">
              {product.pricePerWeek}
            </span>
            <span className="text-bodyL-neutral text-text-general-tertiary">
              {" "}
              /{commonT(`duration.week`)}
            </span>
          </div>
        )}
      </div>
    </div>
    {isTrial && (
      <div className="rounded-es-rounded rounded-se-rounded bg-gradient-green px-small-1 py-small-0.25 text-app-Title3 text-text-general-inverse absolute -top-px -right-px w-max">
        {dsT("pricing.freeTrial")}
      </div>
    )}
  </RadioGroup.Item>
);

function renderTier3Badge({
  useTrial,
  isTrial,
  isSelected,
  badgeContent,
}: {
  useTrial?: boolean;
  isTrial?: boolean;
  isSelected: boolean;
  badgeContent: React.ReactNode;
}) {
  if (useTrial) {
    if (isTrial) {
      return null;
    }
    return (
      <GradientBadgeText
        className="text-bodyS-highlight absolute"
        content={badgeContent}
      />
    );
  }
  return (
    <span className={compositeStyles("relative")}>
      <span
        className={compositeStyles(
          "rounded-half bg-neutral-150 px-small-0.75 relative inline-flex w-max items-center justify-center",
          isSelected && "light bg-gradient-green"
        )}
      >
        <span className="py-small-0.5 text-footnoteM-highlight dark:text-text-general-inverse md:py-small-0 md:text-bodyM-highlight relative z-10">
          {badgeContent}
        </span>
      </span>
    </span>
  );
}

const PricingRadioGroupItemTier3: React.FC<TTierVariantProps> = ({
  product,
  isSelected,
  isTrial,
  useTrial,
  badgeContent,
  commonT,
  dsT,
}) => (
  <RadioGroup.Item
    value={product.id}
    className={compositeStyles(
      "data-[state=checked]:border-border-brand-identity rounded-rounded border-standard border-border-general-secondary p-medium-1.5 data-[state=checked]:bg-surface-general-highlight md:border-thin md:data-[state=unchecked]:bg-surface-general-soft relative flex size-full flex-col items-baseline justify-between transition-all after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none data-[state=unchecked]:border-white/20 data-[state=unchecked]:after:content-[''] md:data-[state=unchecked]:after:content-none",
      !isSelected && styles["subscription-card-tier3"]
    )}
  >
    <div className="gap-large-4 z-10 flex w-full flex-col items-start">
      <div className="gap-small-1 flex w-full flex-col items-start">
        <span className="border-standard dark:border-neutral-150 border-neutral-350 relative flex size-[18px] min-w-[18px] items-center justify-center rounded-full transition-colors">
          <RadioGroup.Indicator className="bg-gradient-green p-small-0.25 rounded-full text-[0px]">
            <span className="p-small-0.25 bg-surface-general-highlight-lighten inline-block rounded-full dark:bg-[#0e251f]">
              <span className="after:bg-gradient-green relative after:block after:size-[10px] after:rounded-full" />
            </span>
          </RadioGroup.Indicator>
        </span>
        <div className="mt-small-0.5 text-app-Title3">
          {commonT("amountPerDuration", {
            amount: product.numberOfMonths,
            duration: commonT(`duration.month`),
          })}
        </div>
        <div className="min-h-6">
          {badgeContent && (
            <>
              {renderTier3Badge({
                badgeContent,
                isSelected,
                isTrial,
                useTrial,
              })}
            </>
          )}
        </div>
      </div>
      <div className="gap-medium-2 flex flex-col">
        <div className="gap-medium-2 flex flex-col items-start">
          {isTrial ? (
            <div
              className="text-app-title-0 text-text-general-secondary uppercase"
              style={{ minHeight: 64 }}
            >
              {commonT("free")}
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="text-bodyM-neutral text-text-general-tertiary flex min-h-6 line-through">
                {product.originalPrice}
              </span>
              <span className="text-app-title-0 text-text-general-secondary">
                {product.sellingPrice}
              </span>
            </div>
          )}

          {isTrial ? (
            <div className="text-bodyS-neutral text-text-general-tertiary text-start">
              {dsT("pricing.startForFree")},{" "}
              {dsT("pricing.thenMonthly", {
                price: product.priceWithCurrencySymbol || "",
              })}
            </div>
          ) : (
            <div
              className={compositeStyles(
                "gap-small-0.5 flex items-center",
                useTrial && "mt-medium-1.5"
              )}
            >
              <span className="text-bodyM-highlight text-text-general-secondary">
                {product.pricePerWeek}
              </span>
              <span className="text-footnoteM-neutral text-text-general-tertiary">
                {" "}
                /{commonT(`duration.week`)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
    {isTrial && (
      <div className="-right-small-0.25 -top-small-0.25 rounded-es-rounded rounded-se-rounded bg-gradient-green px-small-1 py-small-0.5 text-app-Title3 text-text-general-inverse absolute z-10 w-max">
        {dsT("pricing.freeTrial")}
      </div>
    )}
  </RadioGroup.Item>
);

interface TTrialUIVariantProps {
  product: ProductModel;
  isSelected: boolean;
  isTrial?: boolean;
  badgeContent: React.ReactNode;
  extraContent?: TPricingRadioGroupProps["extraContent"];
  commonT: TTranslateFn;
  dsT: TTranslateFn;
}

const PricingRadioGroupItemTrialUI: React.FC<TTrialUIVariantProps> = ({
  product,
  isSelected,
  isTrial,
  badgeContent,
  extraContent,
  commonT,
  dsT,
}) => (
  <RadioGroup.Item
    value={product.id}
    className={compositeStyles(
      "data-[state=checked]:border-border-brand-identity rounded-pill border-standard border-border-general-secondary p-medium-3 data-[state=checked]:bg-surface-general-highlight md:border-thin md:data-[state=unchecked]:bg-surface-general-soft relative flex w-full flex-col items-baseline justify-between transition-all after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none data-[state=unchecked]:border-white/20 data-[state=unchecked]:after:content-[''] md:data-[state=unchecked]:after:content-none",
      !isSelected && styles["subscription-card-tier3"]
    )}
  >
    <div className="gap-medium-3 z-10 flex w-full flex-col items-start">
      <div className="gap-small-1 flex w-full flex-col items-start">
        <div className="flex w-full items-center justify-between">
          <div className="gap-medium-2 flex flex-col">
            {!isTrial && badgeContent ? (
              <span className="bg-gradient-green text-bodyM-highlight bg-clip-text text-transparent capitalize">
                {badgeContent}
              </span>
            ) : (
              <div className="min-h-medium-3" />
            )}
            <div className="text-app-title-0 text-text-general-secondary capitalize">
              {commonT("amountPerDuration", {
                amount: product.numberOfMonths,
                duration: commonT(`duration.month`),
              })}
            </div>
          </div>
          <span className="mt-small-0.25 border-icon-general-tertiary relative flex size-[34px] min-w-[34px] items-center justify-center rounded-full border-[3px] transition-colors">
            <RadioGroup.Indicator className="bg-gradient-green rounded-full p-[3px] text-[0px]">
              <span className="p-small-0.5 inline-block rounded-full bg-[#0e251f]">
                <span className="after:bg-gradient-green relative after:block after:size-[20px] after:rounded-full" />
              </span>
            </RadioGroup.Indicator>
          </span>
        </div>
      </div>
      <Divider
        direction="horizontal"
        className="border-border-general-primary! w-full"
      />
      {extraContent && <div>{extraContent}</div>}

      <Divider
        direction="horizontal"
        className="border-border-general-primary! w-full"
      />
      {isTrial ? (
        <div className="gap-small-1 flex flex-col items-start">
          <div className="text-app-display-medium text-text-general-secondary uppercase">
            {commonT("free")}
          </div>
          <div className="text-bodyL-neutral text-text-general-tertiary">
            {dsT("pricing.startForFree")},{" "}
            {dsT("pricing.thenMonthly", {
              price: product.priceWithCurrencySymbol || "",
            })}
          </div>
        </div>
      ) : (
        <div className="gap-medium-2 flex flex-col">
          <div className="gap-small-0.75 flex flex-col items-start">
            <div className="gap-medium-1.5 flex items-center">
              <span className="text-app-display-medium text-text-general-secondary">
                {product.sellingPrice}
              </span>
              <span className="text-bodyL-neutral text-text-general-tertiary flex min-h-6 line-through">
                {product.originalPrice}
              </span>
            </div>
            <div className="gap-small-0.5 flex items-center">
              <span className="text-memoji text-text-general-secondary">
                {product.pricePerWeek}
              </span>
              <span className="text-bodyL-neutral text-text-general-secondary">
                {" "}
                {commonT("perDuration", {
                  duration: commonT(`duration.week`),
                })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
    {isTrial && (
      <div className="rounded-ee-pill rounded-ss-pill bg-gradient-green px-medium-3 py-small-0.75 text-app-Title1 text-text-general-inverse absolute -top-px -left-px z-10 w-max font-bold">
        {dsT("pricing.freeTrial")}
      </div>
    )}
  </RadioGroup.Item>
);

function renderDefaultBadge({
  useTrial,
  isTrial,
  isSelected,
  badgeContent,
}: {
  useTrial?: boolean;
  isTrial?: boolean;
  isSelected: boolean;
  badgeContent: React.ReactNode;
}) {
  if (useTrial) {
    if (isTrial) {
      return null;
    }
    return (
      <GradientBadgeText
        className="end-medium-1.5 top-medium-1.5 absolute inline-block md:hidden"
        content={badgeContent}
      />
    );
  }
  return (
    <span
      className={compositeStyles(
        "right-medium-1.5 top-medium-1.5 md:mt-small-1 absolute md:relative md:top-auto md:right-auto md:w-max"
      )}
    >
      <span
        className={compositeStyles(
          "rounded-half bg-text-general-secondary px-small-0.75 relative inline-flex w-max items-center justify-center",
          isSelected && "light bg-gradient-green"
        )}
      >
        <span className="py-small-0.25 text-footnoteS-highlight text-text-general-inverse md:py-small-0 md:text-bodyM-highlight relative z-10">
          {badgeContent}
        </span>
      </span>
      {isSelected && (
        <span
          className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]"
          style={{
            zIndex: -1,
          }}
        />
      )}
    </span>
  );
}

function renderDefaultTrialFooter({
  isTrial,
  isSelected,
  useTrial,
  badgeContent,
  dsT,
}: {
  isTrial?: boolean;
  isSelected: boolean;
  useTrial?: boolean;
  badgeContent: React.ReactNode;
  dsT: TTranslateFn;
}) {
  if (isTrial) {
    return (
      <div className="rounded-half bg-gradient-green px-small-1 py-small-0.25 text-bodyM-highlight text-text-general-inverse relative hidden w-max md:inline-block">
        {dsT("pricing.freeTrial")}
        {isSelected && (
          <span
            className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]"
            style={{
              zIndex: -1,
            }}
          />
        )}
      </div>
    );
  }
  if (useTrial) {
    return (
      <GradientBadgeText
        className="text-bodyM-highlight! mt-auto hidden md:inline-block"
        content={badgeContent}
      />
    );
  }
  return null;
}

interface TDefaultVariantProps {
  product: ProductModel;
  isSelected: boolean;
  isTrial?: boolean;
  useTrial?: boolean;
  useShadow?: boolean;
  badgeContent: React.ReactNode;
  commonT: TTranslateFn;
  dsT: TTranslateFn;
  safeTranslateDuration: (advLabel: string) => string;
}

const PricingRadioGroupItemDefault: React.FC<TDefaultVariantProps> = ({
  product,
  isSelected,
  isTrial,
  useTrial,
  useShadow,
  badgeContent,
  commonT,
  dsT,
  safeTranslateDuration,
}) => (
  <RadioGroup.Item
    value={product.id}
    className={compositeStyles(
      "data-[state=checked]:border-border-brand-identity rounded-rounded border-standard border-e-border-general-tertiary dark:border-border-general-secondary dark:bg-gradient-glassmorphism p-medium-1.5 data-[state=checked]:bg-surface-general-highlight data-[state=unchecked]:after:bg-gradiant-glassmorphism md:border-thin md:data-[state=unchecked]:bg-surface-general-soft relative flex size-full h-full flex-col items-baseline justify-between transition-all after:absolute after:inset-0 after:rounded-[10px] focus-visible:outline-none data-[state=unchecked]:border-white/20 data-[state=unchecked]:after:content-[''] md:data-[state=unchecked]:after:content-none",
      isSelected && useShadow && styles["subscription-card-shadow"]
    )}
  >
    <div className="gap-small-0.75 md:gap-medium-2 z-10 flex size-full flex-col items-start">
      <div className="flex w-full items-center justify-between">
        <div
          className={compositeStyles(
            "text-bodyM-highlight md:text-headingS-Bold capitalize lg:uppercase",
            isSelected && "bg-gradient-green bg-clip-text text-transparent"
          )}
        >
          <span className="inline-block md:hidden">
            {product?.advDurationUnitLabel
              ? safeTranslateDuration(product.advDurationUnitLabel)
              : ""}
          </span>
          <span className="hidden md:inline-block">
            {commonT("amountPerDuration", {
              amount: product.numberOfMonths,
              duration: commonT(`duration.month`),
            })}
          </span>
        </div>
        <span className="border-standard border-neutral-150 relative hidden size-[21px] min-w-[21px] items-center justify-center rounded-full transition-colors md:flex">
          <RadioGroup.Indicator className="bg-gradient-green p-small-0.25 rounded-full text-[0px]">
            <span className="bg-surface-general-highlight-light inline-block rounded-full p-[3px] dark:bg-[#0a6750]">
              <span className="after:bg-gradient-green relative after:block after:size-[12px] after:rounded-full" />
            </span>
          </RadioGroup.Indicator>
        </span>
      </div>
      <div className="gap-medium-2 flex flex-col">
        <div className="flex flex-col items-start">
          {!isTrial && (
            <span className="text-footnoteM-neutral text-text-general-tertiary hidden line-through md:flex">
              {product.originalPrice}
            </span>
          )}
          <span
            className={compositeStyles(
              "text-bodyS-neutral text-text-general-secondary md:text-app-Title2",
              {
                "mt-small-0 md:mt-small-1 uppercase": isTrial,
              }
            )}
          >
            {isTrial && (
              <span className="hidden md:block" style={{ height: 12 }} />
            )}
            {isTrial ? commonT("free") : product.sellingPrice}
          </span>

          {isTrial ? (
            <p className="mt-medium-1.25 text-footnoteM-neutral text-text-general-secondary hidden text-start opacity-60 md:block">
              {dsT("pricing.startForFree")},{" "}
              {dsT("pricing.thenMonthly", {
                price: product.priceWithCurrencySymbol || "",
              })}
            </p>
          ) : (
            <div className="mt-small-1 gap-small-0.5 hidden items-center md:flex">
              <span className="text-bodyM-highlight text-text-general-secondary">
                {product.pricePerWeek}
              </span>
              <span className="text-footnoteM-neutral text-text-general-secondary">
                {commonT("perDuration", {
                  duration: commonT(`duration.week`),
                })}
              </span>
            </div>
          )}
        </div>
        {badgeContent && (
          <>
            {renderDefaultBadge({
              badgeContent,
              isSelected,
              isTrial,
              useTrial,
            })}
          </>
        )}
      </div>
      {renderDefaultTrialFooter({
        badgeContent,
        dsT,
        isSelected,
        isTrial,
        useTrial,
      })}
      {useTrial && isTrial && (
        <div className="rounded-es-default rounded-se-soft bg-gradient-green px-small-1 py-small-0.25 text-footnoteS-highlight text-text-general-inverse absolute -top-px -right-px mt-auto inline-block w-max md:hidden">
          {dsT("pricing.freeTrial")}
        </div>
      )}
    </div>
  </RadioGroup.Item>
);

export const PricingRadioGroupItemV2: React.FC<TPricingRadioGroupItemProps> = ({
  product,
  isSelected,
  newPricing,
  isTrial,
  useTrial,
  useTrialUI,
  tier,
  extraContent,
  useShadow,
}) => {
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");

  const badgeContent = getBadgeContent(
    product.originalPrice,
    product.defaultPrice.price,
    product.currencySymbol,
    dsT,
    {
      newPricing,
      tier,
    }
  );

  function safeTranslateDuration(advLabel: string) {
    const advLabelTranslated = commonT(`frequency.${advLabel}`);
    return advLabelTranslated ?? advLabel;
  }

  if (tier === SUBSCRIPTION_TIER.TIER2) {
    return (
      <PricingRadioGroupItemTier2
        badgeContent={badgeContent}
        commonT={commonT}
        dsT={dsT}
        isSelected={isSelected}
        isTrial={isTrial}
        product={product}
        useTrial={useTrial}
      />
    );
  }

  if (tier === SUBSCRIPTION_TIER.TIER3) {
    return (
      <PricingRadioGroupItemTier3
        badgeContent={badgeContent}
        commonT={commonT}
        dsT={dsT}
        isSelected={isSelected}
        isTrial={isTrial}
        product={product}
        useTrial={useTrial}
      />
    );
  }

  if (useTrialUI) {
    return (
      <PricingRadioGroupItemTrialUI
        badgeContent={badgeContent}
        commonT={commonT}
        dsT={dsT}
        extraContent={extraContent}
        isSelected={isSelected}
        isTrial={isTrial}
        product={product}
      />
    );
  }

  return (
    <PricingRadioGroupItemDefault
      badgeContent={badgeContent}
      commonT={commonT}
      dsT={dsT}
      isSelected={isSelected}
      isTrial={isTrial}
      product={product}
      safeTranslateDuration={safeTranslateDuration}
      useShadow={useShadow}
      useTrial={useTrial}
    />
  );
};
