import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import { SubscriptionModel } from "@/core/models/subscription";
import type { TSubscriptionAPIs } from "@/core/ports/subscription";
import { TransformerBuilder } from "@/libs/class-transformer";
import { DEFAULT_PAGINATION } from "@/utils/constants/common";
import { defaultUserSubscriptionInfo } from "@/utils/constants/subscriptions";

const getSubscriptionServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SUBSCRIPTION_SERVICE_URL;
const getAppId = () => getRuntimeEnv().CS_PUBLIC_APP_ID;

export const subscriptionServiceAPIs = (client: THttp): TSubscriptionAPIs => ({
  getUserSubscriptions: async () => {
    const [error, response] = await client.get<{
      data: SubscriptionModel[];
      error: unknown;
    }>(`/api/v1/users/subscriptions`, {
      baseURL: getSubscriptionServiceUrl(),
      params: {
        app_id: getAppId(),
        limit: DEFAULT_PAGINATION.LIMIT,
        page: DEFAULT_PAGINATION.OFFSET,
      },
    });

    if (error) {
      return [error, null];
    }

    if (!response?.data) {
      return [null, defaultUserSubscriptionInfo as SubscriptionModel];
    }

    const data = new TransformerBuilder(SubscriptionModel)
      .format({
        ...defaultUserSubscriptionInfo,
        items: response?.data,
      })
      .toPlainCamelCase() as SubscriptionModel;

    return [null, data];
  },
});
