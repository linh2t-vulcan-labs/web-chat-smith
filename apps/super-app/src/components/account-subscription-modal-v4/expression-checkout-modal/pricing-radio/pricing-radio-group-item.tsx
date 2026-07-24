import { useTranslations } from "next-intl";
import { RadioGroup } from "radix-ui";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import type { ProductModel } from "@/core/models/product";
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
  isFeatured?: boolean;
}

export const PricingRadioGroupItem: React.FC<TPricingRadioGroupItemProps> = ({
  product,
  isSelected,
  isActive,
  showRadioIndicator = true,
  isTrial = false,
  useTrialLabel = false,
  isFeatured = false,
}) => {
  const Container = (
    showRadioIndicator ? RadioGroup.Item : "div"
  ) as React.ElementType;

  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");

  function safeTranslateDuration(advLabel: string) {
    const advLabelTranslated = commonT(`frequency.${advLabel}`);
    return advLabelTranslated ?? advLabel;
  }

  const planLabel = product?.advDurationUnitLabel
    ? safeTranslateDuration(product.advDurationUnitLabel)
    : commonT("amountPerDuration", {
        amount: product.numberOfMonths,
        duration: commonT("duration.month"),
      });

  const rightTopLabel = useTrialLabel
    ? dsT("pricing.dayFree")
    : `${product.sellingPrice}/${commonT(`duration.${product.durationUnitLabel}`)}`;

  const rightBottomLabel = useTrialLabel
    ? dsT("pricing.thenWeekly", {
        price: product.pricePerWeek || "",
      })
    : `${product.pricePerWeek}/${commonT("duration.week")}`;

  const getCardVariantClassName = () => {
    if (isFeatured) {
      return "bg-surface-general-inverse rounded-pill-default border-transparent";
    }
    if (isSelected) {
      return "border-border-brand-identity rounded-default bg-surface-general-highlight";
    }
    return "border-border-general-secondary rounded-default bg-surface-general-primary";
  };

  const card = (
    <Container
      {...(showRadioIndicator ? { value: product.id } : {})}
      className={compositeStyles(
        "thickness-standard gap-medium-1.5 px-medium-2 py-medium-1.5 relative flex h-fit w-full cursor-pointer items-start border transition-all focus-visible:outline-hidden",
        getCardVariantClassName()
      )}
    >
      {showRadioIndicator && (
        <span
          className={cn(
            "thickness-standard relative flex size-[20px] min-w-[20px] items-center justify-center rounded-full transition-colors",
            isSelected
              ? "border-border-brand-identity"
              : "border-icon-general-tertiary"
          )}
        >
          <RadioGroup.Indicator className="Indicator bg-surface-general-highlight-lighten dark:bg-gradient-green p-small-0.25 rounded-full text-[0px]">
            <span className="after:dark:bg-gradient-green after:bg-border-brand-identity relative after:block after:size-[10px] after:rounded-full" />
          </RadioGroup.Indicator>
        </span>
      )}

      <div className="gap-medium-1 flex min-w-0 flex-1 items-start justify-between">
        <div className="gap-small-0.5 flex min-w-0 flex-col">
          <span
            className={compositeStyles(
              "text-bodyS-highlight inline-block items-center uppercase",
              isSelected
                ? "bg-gradient-green text-text-general-secondary bg-clip-text dark:text-transparent"
                : "text-text-general-secondary"
            )}
          >
            {planLabel}{" "}
            {(() => {
              if (isTrial) {
                return `(${commonT("freeTrial")})`;
              }
              if (isActive) {
                return `(${commonT("currentPlan")})`;
              }
              return "";
            })()}
          </span>
        </div>

        <div className="gap-small-0.5 flex shrink-0 flex-col items-end text-end">
          <span
            className={compositeStyles(
              "text-bodyS-highlight",
              useTrialLabel
                ? "text-text-general-primary uppercase"
                : "text-text-general-secondary"
            )}
          >
            {rightTopLabel}
          </span>
          <span className="text-bodyS-neutral text-text-general-tertiary">
            {rightBottomLabel}
          </span>
        </div>
      </div>
    </Container>
  );

  if (isFeatured || product.isTrial) {
    return (
      <div className="bg-gradient-green rounded-default flex h-full w-full flex-col p-0.5">
        <div className="gap-small-1 my-small-0.5 flex items-center justify-center">
          <SVGIcon
            src="/icons/v2-best-offer-icon.svg"
            width={16}
            height={16}
            className="text-surface-general-primary"
          />
          <span className="text-footnoteM-highlight dark:text-text-general-primary text-white capitalize">
            {dsT("bestOffer")}
          </span>
        </div>
        <div
          className={cn(
            "rounded-default",
            isSelected
              ? "bg-surface-general-primary/85"
              : "bg-surface-general-primary"
          )}
        >
          {card}
        </div>
      </div>
    );
  }

  return card;
};
