import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import { FreeUsageResetModel } from "@/core/models/usage";
import { FreeUsageCountModel } from "@/core/models/user";
import type { TUsageServiceAPIs } from "@/core/ports/usage";
import { TransformerBuilder } from "@/libs/class-transformer";
import {
  transformFreeUsageCount,
  transformFreeUsageReset,
} from "@/utils/mappers/user";

const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const usageServiceAPIs = (client: THttp): TUsageServiceAPIs => ({
  getFreeUsageCount: async () => {
    const [error, result] = await client.get<FreeUsageCountModel[]>(
      "/api/v1/users/web/usages",
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const plainData = new TransformerBuilder(FreeUsageCountModel)
      .format(result)
      .toPlainCamelCase() as FreeUsageCountModel[];

    const data = transformFreeUsageCount(plainData);

    return [null, data];
  },
  getFreeUsageResetInfo: async () => {
    const [error, result] = await client.get<FreeUsageResetModel[]>(
      "/api/v1/users/web/usage/reset/list",
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const plainData = new TransformerBuilder(FreeUsageResetModel)
      .format(result)
      .toPlainCamelCase() as FreeUsageResetModel[];

    const data = transformFreeUsageReset(plainData);

    return [null, data];
  },
  initializeFreeUsage: async () => {
    const [error, result] = await client.post<object>(
      "/api/v1/users/web/usage/reset/init",
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, result];
  },
  resetFreeUsage: async () => {
    const [error, result] = await client.post<object>(
      "/api/v1/users/web/usages/reset",
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, result];
  },
  updateFreeUsageCount: async () => {
    const [error, result] = await client.put<object>(
      "/api/v1/users/web/usage",
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, result];
  },
});
