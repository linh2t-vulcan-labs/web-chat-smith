import type {
  CheckoutPayloadDto,
  CreateOrderPayloadDto,
} from "@/core/http/dto/order";

import type { TResult } from "../models/http";
import type {
  CheckoutResponseModel,
  CreateOrderResponseModel,
  UserOrderTrialUsagesModel,
} from "../models/order";

export interface TOderServiceAPIs {
  createOrder: (
    payload: CreateOrderPayloadDto
  ) => TResult<CreateOrderResponseModel>;
  checkout: (
    payload: Partial<CheckoutPayloadDto>
  ) => TResult<CheckoutResponseModel>;
  quickCheckout: (
    payload: Partial<CheckoutPayloadDto>
  ) => TResult<CheckoutResponseModel>;
  getUserOrderTrialUsages: () => TResult<UserOrderTrialUsagesModel | null>;
}

export interface TOderRepositories {
  createOrder: (
    payload: CreateOrderPayloadDto
  ) => TResult<CreateOrderResponseModel>;
  checkout: (
    payload: Partial<CheckoutPayloadDto>
  ) => TResult<CheckoutResponseModel>;
  quickCheckout: (
    payload: Partial<CheckoutPayloadDto>
  ) => TResult<CheckoutResponseModel>;
  getUserOrderTrialUsages: () => TResult<UserOrderTrialUsagesModel | null>;
}
