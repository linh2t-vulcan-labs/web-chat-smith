import type { TResult } from "../models/http";
import type { SubscriptionModel } from "../models/subscription";

export interface TSubscriptionAPIs {
  getUserSubscriptions: () => TResult<SubscriptionModel>;
}

export interface TSubscriptionRepository {
  getUserSubscriptions: () => TResult<SubscriptionModel>;
}
