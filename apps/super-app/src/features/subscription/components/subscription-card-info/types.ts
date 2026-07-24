import type { ProductModel } from "@/core/models/product";
import type { SubscriptionModel } from "@/core/models/subscription";
import type { UserInfoModel } from "@/core/models/user";

export interface TSubscriptionCardInfoProps {
  productInfo?: ProductModel;
  user: UserInfoModel;
  subscriptionInfo: SubscriptionModel;
  showPlan?: boolean;
  spacing?: "large" | "medium";
  theme?: "light" | "dark";
}
