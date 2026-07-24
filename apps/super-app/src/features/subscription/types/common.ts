import type { ProductModel } from "@/core/models/product";
import type { SubscriptionModel } from "@/core/models/subscription";
import type { UserInfoModel } from "@/core/models/user";

export interface TAccountSubscriptionModalV5Props {
  open: boolean;
  dsVersion?: number;
  enableTrial?: boolean;
  onClose?: () => void;
  onClickCloseIcon?: () => void;
  onClickManageSubscription?: () => void;
  onClickSubmitSubscription?: (product: ProductModel) => void;
}

export interface TAccountSubscriptionTierProps {
  products: ProductModel[];
  activeProduct?: ProductModel | null;
  useTrial?: boolean;
  onProductSelected?: (product?: ProductModel) => void;
  onClickSubmitSubscription: TAccountSubscriptionModalV5Props["onClickSubmitSubscription"];
}

export interface TSubscriptionActionButtonV2Props {
  disabled?: boolean;
  showCancel?: boolean;
  theme?: "dark" | "light";
  isTrial?: boolean;
  onContinue?: () => void;
}

export interface TSubscriptionContentProps {
  products: ProductModel[];
  activeProduct?: ProductModel | null;
  useTrial?: TAccountSubscriptionTierProps["useTrial"];
  onProductSelected?: TAccountSubscriptionTierProps["onProductSelected"];
  onClickSubmitSubscription?: (product: ProductModel) => void;
}

export interface TSubscriptionDetailMobileProps {
  productInfo: ProductModel;
  userSubscriptionInfo: SubscriptionModel;
  userInfo: UserInfoModel;
}

export interface TSubscriptionPlanProps {
  packageName: string;
  subtitle?: string;
  innerClassName?: string;
  headerClassName?: string;
  color?: "default" | "primary";
}
