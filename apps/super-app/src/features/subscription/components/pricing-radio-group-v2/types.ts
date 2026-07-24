import type { ReactNode } from "react";

import type { ProductModel } from "@/core/models/product";

export interface TPricingRadioGroupProps {
  newPricing?: boolean;
  defaultValue?: ProductModel | null;
  products: ProductModel[];
  activeProductId?: string;
  className?: string;
  isNewUI?: boolean;
  useTrialUI?: boolean;
  useShadow?: boolean;
  extraContent?: ReactNode;
  useTrial?: boolean;
  tier?: number;
  onSubscriptionChange?: (product: ProductModel) => void;
  onClickSubmitSubscription?: (product: ProductModel) => void;
}
