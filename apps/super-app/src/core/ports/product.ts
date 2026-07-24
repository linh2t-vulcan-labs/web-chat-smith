import type { TResult } from "../models/http";
import type { ProductModel } from "../models/product";
import type { SubscriptionModel } from "../models/subscription";

export interface TProductServiceAPIs {
  getProductsByAppId: (apiVersion: string) => TResult<ProductModel[]>;
}

export interface TProductRepository {
  getActiveSubscriptions: (
    products: ProductModel[],
    useMonthlyTrial?: boolean
  ) => ProductModel[];
  getActiveSubscriptionPackage: (
    userSubscriptionInfo: SubscriptionModel,
    products: ProductModel[]
  ) => ProductModel | undefined;
  getBestSubscriptionPackage: (
    products: ProductModel[]
  ) => ProductModel | undefined;
  sortedProductAfterMappingSubscription: (
    userSubscriptionInfo: SubscriptionModel,
    products: ProductModel[],
    useTrial?: boolean
  ) => ProductModel[];
  sortedProductAfterMappingActiveSubscription: (
    activeSubscriptionId: string,
    products: ProductModel[],
    useTrial?: boolean
  ) => ProductModel[];
}
