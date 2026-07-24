import { RadioGroup } from "radix-ui";
import React, { useEffect, useRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { PricingRadioGroupItem } from "./pricing-radio-group-item";
import type { TPricingRadioGroupProps } from "./types";

export const PricingRadioGroup: React.FC<TPricingRadioGroupProps> = ({
  newPricing,
  useTrial,
  products,
  className,
  activeProductId,
  isNewUI,
  onSubscriptionChange,
}) => {
  const setDefaultPricingRef = useRef(false);
  const [value, setValue] = React.useState("");
  useEffect(() => {
    if (!products.length || setDefaultPricingRef.current) {
      return;
    }
    const [firstProduct] = products;
    if (firstProduct && !value) {
      // oxlint-disable-next-line react/react-compiler -- effect sets default pricing selection once from props on mount, guarded by setDefaultPricingRef so it never loops
      setValue(firstProduct.id);
      // Initial get first product
      onSubscriptionChange?.(firstProduct);
    }
    setDefaultPricingRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, onSubscriptionChange]);

  const handleSubscriptionChange = (selected: string) => {
    setValue(selected);
    const selectedProduct = products.find((item) => item.id === selected);
    if (selectedProduct) {
      onSubscriptionChange?.(selectedProduct);
    }
  };

  if (isNewUI) {
    return (
      <RadioGroup.Root
        value={value}
        onValueChange={handleSubscriptionChange}
        className={compositeStyles(
          "no-scrollbar grid max-h-[248px] w-full grid-cols-1 gap-medium-2 overflow-y-auto overflow-x-hidden",
          className
        )}
        aria-label="Subscription"
      >
        {products.map((product) => (
          <PricingRadioGroupItem
            key={product.id}
            product={product}
            isNewUI={isNewUI}
            isSelected={product.id === value}
            isActive={product.id === activeProductId}
            isTrial={product.isTrial}
            newPricing={newPricing}
          />
        ))}
      </RadioGroup.Root>
    );
  }

  return (
    <RadioGroup.Root
      value={value}
      onValueChange={handleSubscriptionChange}
      className={compositeStyles(
        "no-scrollbar grid auto-cols-[calc(50%-6px)] grid-flow-col gap-3 overflow-x-auto md:max-h-[256px] md:auto-cols-auto md:grid-flow-row md:grid-cols-1 md:gap-3 md:overflow-y-auto md:overflow-x-visible",
        className
      )}
      aria-label="Subscription"
    >
      {products.map((product) => {
        const useTrialLabel = product.isTrial && useTrial;
        return (
          <PricingRadioGroupItem
            key={product.id}
            product={product}
            isSelected={product.id === value}
            isActive={product.id === activeProductId}
            isTrial={product.isTrial}
            useTrialLabel={useTrialLabel}
            newPricing={newPricing}
          />
        );
      })}
    </RadioGroup.Root>
  );
};
