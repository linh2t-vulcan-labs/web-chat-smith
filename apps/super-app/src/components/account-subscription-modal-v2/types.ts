import type { ProductModel } from "@/core/models/product";

export interface TAccountSubscriptionModalV2Props {
  open: boolean;
  useTrial?: boolean;
  onClose?: () => void;
  onClickCloseIcon?: () => void;
  onClickManageSubscription?: () => void;
  onClickSubmitSubscription?: (product: ProductModel) => void;
}

export interface TSubscriptionInfoProps {
  isShowXIcon: boolean;
  isShowManageSubscription: boolean;
  className?: string;
  onClickManageSubscription?: () => void;
}

export interface TSubscriptionProductProps {
  onClickSubmitButton?: (product: ProductModel) => void;
}
