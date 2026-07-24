import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import {
  BillingHistoryModel,
  PaymentInfoModel,
  PaymentProductModel,
} from "@/core/models/payment";
import type { TPaymentServiceAPIs } from "@/core/ports/payment";
import { TransformerBuilder } from "@/libs/class-transformer";

const getPaymentServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_PAYMENT_SERVICE_URL;

export const paymentServiceAPIs = (client: THttp): TPaymentServiceAPIs => ({
  billingHistory: async (payload) => {
    const [error, result] = await client.post<{
      data: BillingHistoryModel;
      error: unknown;
    }>("/api/v1/billings/portal", {
      baseURL: getPaymentServiceUrl(),
      body: payload,
    });

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(BillingHistoryModel)
      .format(result)
      .toPlainCamelCase() as BillingHistoryModel;

    return [null, data];
  },
  getPaymentInfo: async (payload) => {
    const [error, result] = await client.get<{
      extended: PaymentInfoModel;
      error: unknown;
    }>("/api/v1/payments/payment_information", {
      baseURL: getPaymentServiceUrl(),
      params: payload,
    });

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(PaymentInfoModel)
      .format(result?.extended)
      .toPlainCamelCase() as PaymentInfoModel;

    return [null, data];
  },
  getPaymentProducts: async () => {
    const [error, result] = await client.get<{
      items: PaymentProductModel[];
      error: unknown;
    }>("/api/v1/payments/products", {
      baseURL: getPaymentServiceUrl(),
      params: { global_only: true },
    });

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(PaymentProductModel)
      .format(result?.items ?? [])
      .toPlainCamelCase() as PaymentProductModel[];

    return [null, data];
  },
});
