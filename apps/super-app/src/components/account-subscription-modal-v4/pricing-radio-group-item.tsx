import { useTranslations } from "next-intl";
import { RadioGroup } from "radix-ui";
import React from "react";

import type { ProductModel } from "@/core/models/product";
import { calculateDiscountPercentage } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

interface TPricingRadioGroupItemProps {
  product: ProductModel;
  isSelected: boolean;
  isActive?: boolean;
  newPricing?: boolean;
  isNewUI?: boolean;
  isTrial?: boolean;
  useTrialLabel?: boolean;
  showRadioIndicator?: boolean;
}

type Translator = ReturnType<typeof useTranslations>;

const getBadgeContent = (
  originalPrice: string,
  sellingPrice: number,
  currencySymbol: string,
  dsT: Translator
) => {
  const badgePercentage = calculateDiscountPercentage(
    originalPrice,
    sellingPrice,
    currencySymbol
  );

  if (!badgePercentage) {
    return null;
  }

  return dsT.rich("badge.save", {
    desktop: (chunks) => (
      <span className="pe-small-0.5 hidden md:inline-block">{chunks}</span>
    ),
    mobile: (chunks) => (
      <span className="inline-block md:hidden">{chunks}</span>
    ),
    percent: badgePercentage,
  });
};

const getPlanSuffix = (
  isTrial: boolean,
  isActive: boolean | undefined,
  commonT: Translator
) => {
  if (isTrial) {
    return `(${commonT("freeTrial")})`;
  }

  if (isActive) {
    return `(${commonT("currentPlan")})`;
  }

  return "";
};

interface TSharedPricingContentProps {
  badgeContent: React.ReactNode;
  commonT: Translator;
  dsT: Translator;
  isActive?: boolean;
  isSelected: boolean;
  isTrial: boolean;
  product: ProductModel;
  showRadioIndicator: boolean;
  useTrialLabel: boolean;
}

const NewPricingContent: React.FC<TSharedPricingContentProps> = ({
  badgeContent,
  commonT,
  isActive,
  isSelected,
  isTrial,
  product,
  showRadioIndicator,
}) => {
  const Container = (
    showRadioIndicator ? RadioGroup.Item : "div"
  ) as React.ElementType;

  return (
    <Container
      {...(showRadioIndicator ? { value: product.id } : {})}
      className={compositeStyles(
        "thickness-standard data-[state=checked]:border-border-brand-identity rounded-default border-border-general-secondary bg-gradiant-glassmorphism px-medium-2.5 py-medium-2 flex min-h-[108px] w-full items-baseline justify-between transition-all focus-visible:outline-hidden md:items-center md:border md:px-4 md:py-3",
        {
          "cursor-pointer": showRadioIndicator,
        }
      )}
    >
      <div className="md:mb-small-0.25 md:mt-small-0.25 md:py-medium-2.5 flex w-full items-center gap-3">
        {showRadioIndicator && (
          <span className="thickness-standard border-icon-general-tertiary relative flex size-[18px] min-w-[18px] items-center justify-center rounded-full transition-colors">
            <RadioGroup.Indicator className="Indicator bg-gradient-green p-small-0.25 rounded-full text-[0px]">
              <span className="bg-surface-general-highlight-lighten dark:bg-surface-general-tertiary p-small-0.25 inline-block rounded-full">
                <span className="after:bg-gradient-green relative after:block after:size-[10px] after:rounded-full" />
              </span>
            </RadioGroup.Indicator>
          </span>
        )}

        <div className="gap-small-0.5 relative flex w-full flex-col items-start">
          <div
            className={compositeStyles(
              "pb-small-0.25 text-headingS-Bold text-text-general-secondary inline-block uppercase",
              isSelected && "bg-gradient-green bg-clip-text text-transparent"
            )}
          >
            <span className="inline-block">
              {commonT("amountPerDuration", {
                amount: product.numberOfMonths,
                duration: commonT(`duration.month`),
              })}{" "}
              {getPlanSuffix(isTrial, isActive, commonT)}
            </span>
          </div>
          <div className="gap-medium-1.5 flex w-full items-center justify-between">
            <div className="gap-small-0.5 flex items-center">
              <span className="text-bodyM-highlight text-text-general-secondary">
                {product.sellingPrice}
              </span>
              {product.originalPrice && (
                <span className="text-bodyS-neutral text-text-general-quaternary line-through">
                  {product.originalPrice}
                </span>
              )}
            </div>
            <div className="gap-small-0.5 text-text-general-secondary flex items-center text-[0px]">
              <span className="text-bodyL-highlight block">
                {product.pricePerWeek}
              </span>
              <span className="text-bodyS-neutral">
                /
                {commonT("perDuration", {
                  duration: commonT(`duration.week`),
                })}
              </span>
            </div>
          </div>
          <div className="gap-small-1 text-footnoteS-highlight md:text-bodyM-highlight flex items-center">
            {badgeContent && (
              <span
                className={compositeStyles(
                  "rounded-half bg-surface-action-default-default px-small-0.75 relative inline-flex items-center justify-center",
                  isSelected && "light bg-gradient-green"
                )}
              >
                <span className="py-small-0.5 text-footnoteM-highlight text-text-general-inverse md:py-small-0 md:text-bodyM-highlight relative z-10 text-nowrap">
                  {badgeContent}
                </span>
                {isSelected && (
                  <span className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

const LegacyPricingContent: React.FC<TSharedPricingContentProps> = ({
  badgeContent,
  commonT,
  dsT,
  isActive,
  isSelected,
  product,
  showRadioIndicator,
  useTrialLabel,
}) => {
  const Container = (
    showRadioIndicator ? RadioGroup.Item : "div"
  ) as React.ElementType;

  const safeTranslateDuration = (advLabel: string) => {
    const advLabelTranslated = commonT(`frequency.${advLabel}`);
    return advLabelTranslated ?? advLabel;
  };

  return (
    <Container
      {...(showRadioIndicator ? { value: product.id } : {})}
      className={compositeStyles(
        "thickness-standard data-[state=checked]:border-border-brand-identity rounded-default border-border-general-secondary bg-gradiant-glassmorphism-light dark:bg-gradiant-glassmorphism px-medium-1.5 py-medium-1.5 relative flex w-full items-baseline justify-between transition-all focus-visible:outline-hidden md:items-center md:border md:px-4 md:py-3",
        {
          "cursor-pointer": showRadioIndicator,
        }
      )}
    >
      <div className="md:mb-small-0.25 md:mt-small-0.25 md:py-medium-2.5 flex w-full items-center gap-3">
        {showRadioIndicator && (
          <span className="thickness-standard border-icon-general-tertiary relative hidden size-[18px] min-w-[18px] items-center justify-center rounded-full transition-colors md:flex">
            <RadioGroup.Indicator className="Indicator bg-text-action-primary-default dark:bg-gradient-green p-small-0.25 rounded-full text-[0px]">
              <span className="bg-surface-general-highlight-lighten dark:bg-surface-general-tertiary p-small-0.25 inline-block rounded-full">
                <span className="after:bg-text-action-primary-default dark:after:bg-gradient-green relative after:block after:size-[10px] after:rounded-full" />
              </span>
            </RadioGroup.Indicator>
          </span>
        )}

        <div className="relative flex w-full flex-col items-start">
          <div
            className={compositeStyles(
              "pb-small-0.25 text-bodyM-highlight md:text-heading-highlight inline-block capitalize md:uppercase",
              isSelected
                ? "dark:bg-gradient-green text-text-action-primary-default dark:bg-clip-text dark:text-transparent"
                : "text-text-general-secondary"
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
              })}{" "}
              {isActive ? `(${commonT("currentPlan")})` : ""}
            </span>
          </div>
          {useTrialLabel ? (
            <>
              <div className="text-bodyS-neutral text-text-general-tertiary md:py-small-0.5 md:text-footnoteM-neutral md:text-text-general-secondary flex items-center text-start md:text-right md:font-normal!">
                {dsT("pricing.startForFree")}{" "}
                <span className="hidden md:inline-block">
                  ,{" "}
                  {dsT("pricing.thenMonthly", {
                    price: product.priceWithCurrencySymbol || "",
                  })}
                </span>
              </div>
              {product.isTrial && (
                <div className="end-small-0 top-small-0 rounded-half bg-gradient-green px-small-0.75 py-small-0.25 text-footnoteS-highlight text-text-general-inverse absolute block w-max md:hidden">
                  <span className="relative z-10">
                    {dsT("pricing.freeTrial")}
                  </span>
                  {isSelected && (
                    <span className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]" />
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="gap-medium-1.5 flex items-center">
              <span className="text-bodyS-neutral text-text-general-tertiary md:text-bodyM-highlight md:text-text-general-secondary">
                {product.sellingPrice}
              </span>
              {product.originalPrice && (
                <span className="text-bodyS-highlight text-text-general-quaternary hidden line-through md:block">
                  {product.originalPrice}
                </span>
              )}
              {badgeContent && (
                <span
                  className={compositeStyles(
                    "rounded-half bg-surface-action-default-default px-small-0.75 absolute top-0 right-0 inline-flex items-center justify-center md:relative",
                    isSelected && "light bg-gradient-green"
                  )}
                >
                  <span className="py-small-0.5 text-footnoteM-highlight dark:text-text-general-inverse md:py-small-0 md:text-bodyM-highlight relative z-10 text-nowrap">
                    {badgeContent}
                  </span>
                  {isSelected && (
                    <span className="rounded-half bg-gradient-green absolute inset-0 blur-[7px]" />
                  )}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {product.isTrial && (
        <div className="rounded-ee-default rounded-ss-default bg-gradient-green px-medium-2 py-small-0.25 text-bodyS-highlight text-text-general-inverse absolute -top-px -left-px hidden w-max font-medium md:block">
          {dsT("pricing.freeTrial")}
        </div>
      )}

      <div className="text-text-general-secondary hidden text-end text-[0px] md:block">
        <span className="text-app-Title1 block font-bold">
          {useTrialLabel
            ? `${product.currencySymbol}0.00`
            : product.pricePerWeek}
        </span>
        <span className="text-footnoteM-neutral text-nowrap">
          {useTrialLabel
            ? dsT("threeDayTrial")
            : commonT("perDuration", {
                duration: commonT(`duration.week`),
              })}
        </span>
      </div>
    </Container>
  );
};

export const PricingRadioGroupItem: React.FC<TPricingRadioGroupItemProps> = ({
  product,
  isSelected,
  newPricing: _newPricing,
  isActive,
  showRadioIndicator = true,
  isNewUI = false,
  isTrial = false,
  useTrialLabel = false,
}) => {
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");

  const badgeContent = getBadgeContent(
    product.originalPrice,
    product.defaultPrice.price,
    product.currencySymbol,
    dsT
  );

  if (isNewUI) {
    return (
      <NewPricingContent
        badgeContent={badgeContent}
        commonT={commonT}
        dsT={dsT}
        isActive={isActive}
        isSelected={isSelected}
        isTrial={isTrial}
        product={product}
        showRadioIndicator={showRadioIndicator}
        useTrialLabel={useTrialLabel}
      />
    );
  }

  return (
    <LegacyPricingContent
      badgeContent={badgeContent}
      commonT={commonT}
      dsT={dsT}
      isActive={isActive}
      isSelected={isSelected}
      isTrial={isTrial}
      product={product}
      showRadioIndicator={showRadioIndicator}
      useTrialLabel={useTrialLabel}
    />
  );
};
