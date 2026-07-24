import { RadioGroup } from "radix-ui";
import React, { useEffect, useRef } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import type { TPricingRadioGroupProps } from "../../types";
import { PricingRadioGroupItem } from "./pricing-radio-group-item";

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
          "gap-medium-2 grid w-full auto-rows-fr grid-cols-1",
          className
        )}
        aria-label="Subscription"
      >
        {products.map((product, index) => (
          <PricingRadioGroupItem
            key={product.id}
            product={product}
            isNewUI={isNewUI}
            isSelected={product.id === value}
            isActive={product.id === activeProductId}
            isTrial={product.isTrial}
            isFeatured={index === 0}
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
      className={compositeStyles("gap-small-1 flex w-full flex-col", className)}
      aria-label="Subscription"
    >
      {products.map((product, index) => {
        const useTrialLabel = product.isTrial && useTrial;

        return (
          <PricingRadioGroupItem
            key={product.id}
            product={product}
            isSelected={product.id === value}
            isActive={product.id === activeProductId}
            isTrial={product.isTrial}
            useTrialLabel={useTrialLabel}
            isFeatured={index === 0}
            newPricing={newPricing}
          />
        );
      })}
    </RadioGroup.Root>
  );
};
