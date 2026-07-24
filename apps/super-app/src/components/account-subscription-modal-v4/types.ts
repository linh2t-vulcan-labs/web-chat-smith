import type { ProductModel } from "@/core/models/product";

import type { TAccountSubscriptionModalV2Props } from "../account-subscription-modal-v2/types";

export enum ECheckoutStep {
  SELECT_PLAN = "SELECT_PLAN",
  PAYMENT_CHECKOUT = "PAYMENT_CHECKOUT",
}

export type TAccountSubscriptionModalV4Props = TAccountSubscriptionModalV2Props;

export interface TGetFullAccessCardProps {
  products: ProductModel[];
  onClickSubmitSubscription?: TAccountSubscriptionModalV4Props["onClickSubmitSubscription"];
  onClose?: () => void;
}

export interface TPricingRadioGroupProps {
  newPricing?: boolean;
  useTrial?: boolean;
  products: TGetFullAccessCardProps["products"];
  activeProductId?: string;
  className?: string;
  isNewUI?: boolean;
  onSubscriptionChange?: (product: ProductModel) => void;
  onClickSubmitSubscription?: TAccountSubscriptionModalV4Props["onClickSubmitSubscription"];
}

export interface TSubscriptionActionButtonProps {
  submitBtnText?: string;
  onContinue?: () => void;
}
