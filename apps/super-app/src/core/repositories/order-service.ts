import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import {
  CheckoutResponseModel,
  CreateOrderResponseModel,
  UserOrderTrialUsagesModel,
} from "@/core/models/order";
import type { TOderServiceAPIs } from "@/core/ports/order";
import { TransformerBuilder } from "@/libs/class-transformer";

const getOrderServiceUrl = () => getRuntimeEnv().CS_PUBLIC_ORDER_SERVICE_URL;

export const orderServiceAPIs = (client: THttp): TOderServiceAPIs => ({
  checkout: async (payload) => {
    const { order_id, ...restPayload } = payload;

    const [error, result] = await client.post<{
      data: CheckoutResponseModel;
      error: unknown;
    }>(`/api/v1/users/orders/${order_id}/checkout`, {
      baseURL: getOrderServiceUrl(),
      body: restPayload,
    });

    if (error) {
      return [error, null];
    }

    if (result?.data) {
      const data = new TransformerBuilder(CheckoutResponseModel)
        .format(result.data)
        .toPlainCamelCase() as CheckoutResponseModel;

      return [null, data];
    }

    return [null, { url: "" } as CheckoutResponseModel];
  },
  createOrder: async (payload) => {
    const [error, result] = await client.post<{
      data: CreateOrderResponseModel;
      error: unknown;
    }>("/api/v1/users/orders", {
      baseURL: getOrderServiceUrl(),
      body: payload,
    });

    if (error) {
      return [error, null];
    }

    if (result?.data) {
      const data = new TransformerBuilder(CreateOrderResponseModel)
        .format(result.data)
        .toPlainCamelCase() as CreateOrderResponseModel;

      return [null, data];
    }

    return [null, { orderId: "" } as CreateOrderResponseModel];
  },
  getUserOrderTrialUsages: async () => {
    const [error, response] = await client.get<{
      data: UserOrderTrialUsagesModel;
      error: unknown;
    }>(`/api/v1/users/trial-usages/last`, {
      baseURL: getOrderServiceUrl(),
    });

    if (error) {
      return [error, null];
    }

    if (!response?.data) {
      return [null, null];
    }

    const data = new TransformerBuilder(UserOrderTrialUsagesModel)
      .format(response.data)
      .toPlainCamelCase() as UserOrderTrialUsagesModel;

    return [null, data];
  },
  quickCheckout: async (payload) => {
    const { order_id, ...restPayload } = payload;

    const [error, result] = await client.post<{
      data: CheckoutResponseModel;
      error: unknown;
    }>(`/api/v1/users/orders/${order_id}/checkout/express`, {
      baseURL: getOrderServiceUrl(),
      body: restPayload,
    });

    if (error) {
      return [error, null];
    }
    if (result?.data) {
      const data = new TransformerBuilder(CheckoutResponseModel)
        .format(result.data)
        .toPlainCamelCase() as CheckoutResponseModel;

      return [null, data];
    }

    return [null, { url: "" } as CheckoutResponseModel];
  },
});
