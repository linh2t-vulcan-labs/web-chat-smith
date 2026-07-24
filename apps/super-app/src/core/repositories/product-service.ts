import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import { ProductModel } from "@/core/models/product";
import type { TProductServiceAPIs } from "@/core/ports/product";
import { TransformerBuilder } from "@/libs/class-transformer";
import {
  EDURATION_UNIT,
  EPRODUCT_STATUS,
  ESUBSCRIPTION_SOURCE,
} from "@/utils/commons/enums";
import { DEFAULT_PAGINATION } from "@/utils/constants/common";

const getProductServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_PRODUCT_SERVICE_URL;
const getAppId = () => getRuntimeEnv().CS_PUBLIC_APP_ID;

const DURATION_ORDER: Partial<Record<EDURATION_UNIT, number>> = {
  [EDURATION_UNIT.WEEK]: 1,
  [EDURATION_UNIT.MONTH]: 2,
  [EDURATION_UNIT.QUARTERLY]: 3,
  [EDURATION_UNIT.YEAR]: 4,
};

export const productServiceAPIs = (client: THttp): TProductServiceAPIs => ({
  getProductsByAppId: async (apiVersion) => {
    const [_error, response] = await client.get<{
      data: ProductModel[];
      error: unknown;
    }>(`/api/${apiVersion}/users/apps/${getAppId()}/subscriptions`, {
      baseURL: getProductServiceUrl(),
      params: {
        limit: DEFAULT_PAGINATION.LIMIT,
        page_token: DEFAULT_PAGINATION.OFFSET,
        subscription_source: ESUBSCRIPTION_SOURCE.WEB,
      },
    });

    // if (error) {
    //   return [error, null];
    // }

    const plainData = new TransformerBuilder(ProductModel)
      .format(response?.data ?? [])
      .toPlainCamelCase() as ProductModel[];

    const data = plainData
      .filter(
        (subscriptionPackage) =>
          subscriptionPackage.status === EPRODUCT_STATUS.ACTIVE
      )
      .toSorted((a, b) => {
        const orderA = DURATION_ORDER[a.durationUnit] || 0;
        const orderB = DURATION_ORDER[b.durationUnit] || 0;
        return orderA - orderB;
      });

    return [null, data];
  },
});
