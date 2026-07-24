import type {
  BillingHistoryPayloadDto,
  GetPaymentInfoPayloadDto,
} from "@/core/http/dto/payment";

import type { TResult } from "../models/http";
import type {
  BillingHistoryModel,
  PaymentInfoModel,
  PaymentProductModel,
} from "../models/payment";

export interface TPaymentServiceAPIs {
  getPaymentInfo: (
    payload: GetPaymentInfoPayloadDto
  ) => TResult<PaymentInfoModel>;
  billingHistory: (
    payload: BillingHistoryPayloadDto
  ) => TResult<BillingHistoryModel>;
  getPaymentProducts: () => TResult<PaymentProductModel[]>;
}

export interface TPaymentRepositories {
  getPaymentInfo: (
    payload: GetPaymentInfoPayloadDto
  ) => TResult<PaymentInfoModel>;
  billingHistory: (
    payload: BillingHistoryPayloadDto
  ) => TResult<BillingHistoryModel>;
  getPaymentProducts: () => TResult<PaymentProductModel[]>;
}
