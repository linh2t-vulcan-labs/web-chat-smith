import { RadioGroup } from "radix-ui";
import React, { useEffect, useRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_TIER } from "../../constants/subscription";
import { PricingRadioGroupItemV2 } from "./pricing-radio-group-item-v2";
import type { TPricingRadioGroupProps } from "./types";

function getAutoColsClassName(
  useShadow: boolean,
  productsCount: number,
  tier: number
) {
  if ((useShadow && productsCount > 2) || tier === SUBSCRIPTION_TIER.TIER3) {
    return "auto-cols-[calc(50%-6px)]";
  }
  if (tier === SUBSCRIPTION_TIER.TIER1) {
    return "auto-cols-[calc(50%-12px)]";
  }
  return "auto-cols-[calc(50%-10px)]";
}

export const PricingRadioGroupV2: React.FC<TPricingRadioGroupProps> = ({
  newPricing,
  products,
  defaultValue,
  className,
  extraContent,
  activeProductId,
  tier = SUBSCRIPTION_TIER.TIER1,
  useShadow = false,
  useTrial = false,
  useTrialUI = false,
  onSubscriptionChange,
}) => {
  const setDefaultPricingRef = useRef(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [value, setValue] = React.useState<string | undefined>(
    defaultValue?.id
  );

  useEffect(() => {
    if (!products.length || setDefaultPricingRef.current) {
      return;
    }
    const [firstProduct] = products;
    const productToSetInit = defaultValue || firstProduct;
    if (productToSetInit && !value) {
      // oxlint-disable-next-line react/react-compiler -- one-time init of selected pricing on mount guarded by setDefaultPricingRef, not a per-render derivation
      setValue(productToSetInit.id);
      // Initial get first product
      onSubscriptionChange?.(productToSetInit);
    }
    setDefaultPricingRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue, products, onSubscriptionChange]);

  useEffect(() => {
    if (!value) {
      return;
    }
    const node = itemRefs.current[value];
    if (!node) {
      return;
    }
    requestAnimationFrame(() => {
      node.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    });
  }, [value]);

  const handleSubscriptionChange = (selected: string) => {
    setValue(selected);
    const selectedProduct = products.find((item) => item.id === selected);
    if (selectedProduct) {
      onSubscriptionChange?.(selectedProduct);
    }
  };

  return (
    <RadioGroup.Root
      value={value}
      onValueChange={handleSubscriptionChange}
      className={compositeStyles(
        "no-scrollbar grid w-full overflow-x-auto",
        tier === SUBSCRIPTION_TIER.TIER1 && "gap-medium-2",
        tier === SUBSCRIPTION_TIER.TIER2 && "gap-medium-1.5",
        tier === SUBSCRIPTION_TIER.TIER3 && "gap-medium-1.25",
        (tier === SUBSCRIPTION_TIER.TIER1 ||
          tier === SUBSCRIPTION_TIER.TIER3) &&
          "grid-flow-col",
        getAutoColsClassName(useShadow, products.length, tier),
        useShadow && products.length > 2 && "pr-medium-2",
        tier === SUBSCRIPTION_TIER.TIER2 &&
          "no-scrollbar grid-cols-1 grid-rows-2",
        useShadow && "pb-small-1",
        className
      )}
      aria-label="Subscription"
    >
      {products.map((product) => (
        <div
          key={product.id}
          ref={(el) => {
            itemRefs.current[product.id] = el;
          }}
          className="min-w-0"
        >
          <PricingRadioGroupItemV2
            tier={tier}
            product={product}
            isSelected={product.id === value}
            isActive={product.id === activeProductId}
            isTrial={product.isTrial}
            useTrial={useTrial}
            useTrialUI={useTrialUI}
            newPricing={newPricing}
            extraContent={extraContent}
            useShadow
          />
        </div>
      ))}
    </RadioGroup.Root>
  );
};
