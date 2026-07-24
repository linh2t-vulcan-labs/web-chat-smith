import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";

import { useMediaQuery } from "@/hooks/use-media-query";

import { Badge } from "../badge-ds";
import { BASE_STATE_WRAPPER_BASE_STYLES, cn } from "../utils/cn";
import type { IPackageItemProps } from "./types";

const packageItemVariants = tv({
  base: cn(
    "group cursor-pointer w-full",
    "flex items-center",
    "gap-v1-structural-component-small",
    "p-v1-structural-content-relaxed",
    "rounded-v1-2xl",
    "bg-v1-surface-hierarchy-raised",
    "thickness-v1-strong border-v1-border-structural-default before:rounded-v1-xl",
    "transition-all duration-150",
    "data-[state=checked]:border-v1-form-border-active",
    "dark:data-disabled:before:bg-transparent! data-disabled:before:bg-transparent!",
    "focus-visible:outline-none"
  ),
  extend: BASE_STATE_WRAPPER_BASE_STYLES,
});

const radioCircleClasses = cn(
  "flex shrink-0 items-center justify-center",
  "p-v1-optical-subtle rounded-v1-circle",
  "min-w-v1-5 min-h-v1-5",
  "thickness-v1-subtle border-v1-form-border-default bg-transparent",
  "group-data-[state=checked]:bg-v1-form-background-active",
  "group-data-[state=checked]:border-v1-form-background-active"
);

const indicatorClasses =
  "h-v1-optical-4 w-v1-optical-4 p-v1-optical-1 rounded-v1-circle bg-v1-form-inverse flex shrink-0";

const PackageItem = forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  IPackageItemProps
>(
  (
    {
      className,
      label,
      savingText,
      currentText,
      originalPrice,
      currentPrice,
      weeklyPrice,
      weeklyPriceLabel,
      isShowIndicator = true,
      badgeLayout = "inline",
      ...props
    },
    ref
  ) => {
    const isLargeScreen = useMediaQuery("md");
    const badgeSize = isLargeScreen ? "md" : "sm";

    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(packageItemVariants(), className)}
        {...props}
      >
        <div
          className={cn(radioCircleClasses, {
            invisible: !isShowIndicator,
          })}
        >
          <RadioGroupPrimitive.Indicator className={indicatorClasses} />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1",
            badgeLayout === "inline"
              ? "gap-v1-structural-component-micro md:gap-v1-structural-component-small flex-wrap items-center"
              : "gap-v1-structural-component-small flex-col"
          )}
        >
          <span
            className={cn(
              "typo-v1-heading-h5 md:typo-v1-heading-h4 text-v1-text-hierarchy-tertiary",
              "group-data-disabled:text-v1-text-hierarchy-tertiary",
              "group-data-[state=checked]:text-v1-text-hierarchy-primary"
            )}
          >
            {label} {currentText ? `(${currentText})` : null}
          </span>
          {savingText ? (
            <Badge.Pricing size={badgeSize}>{savingText}</Badge.Pricing>
          ) : null}
        </div>

        <div className="ms-auto flex shrink-0 flex-col items-end">
          {originalPrice && (
            <span
              className={cn(
                "typo-v1-price-old text-v1-text-hierarchy-secondary",
                "group-data-[disabled]:text-v1-text-hierarchy-tertiary",
                "line-through"
              )}
            >
              {originalPrice}
            </span>
          )}
          <span
            className={cn(
              "typo-v1-price-new group-data-[state=checked]:text-v1-text-hierarchy-primary",
              "group-data-disabled:text-v1-text-hierarchy-tertiary",
              "text-v1-text-hierarchy-tertiary"
            )}
          >
            {currentPrice}
          </span>
          {weeklyPrice && (
            <div className="gap-v1-structural-content-micro flex items-baseline">
              <span
                className={cn(
                  "typo-v1-price-weekly text-v1-text-hierarchy-tertiary",
                  "group-data-disabled:text-v1-text-hierarchy-tertiary group-data-[state=checked]:text-v1-text-hierarchy-primary"
                )}
              >
                {weeklyPrice}
              </span>
              {weeklyPriceLabel && (
                <span
                  className={cn(
                    "typo-v1-support-default text-v1-text-hierarchy-tertiary",
                    "group-data-disabled:text-v1-text-hierarchy-tertiary group-data-[state=checked]:text-v1-text-hierarchy-primary"
                  )}
                >
                  {weeklyPriceLabel}
                </span>
              )}
            </div>
          )}
        </div>
      </RadioGroupPrimitive.Item>
    );
  }
);

PackageItem.displayName = "PackageItem";

export { PackageItem };
