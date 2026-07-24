import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import { SuiteCreativeQuotaModel } from "@/features/suite/types/design-studio";
import type {
  TSuiteCreativeQuotaDTO,
  TSuiteCreativeQuotaServiceAPIs,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

function transformQuota(
  quota: TSuiteCreativeQuotaDTO
): SuiteCreativeQuotaModel {
  return new TransformerBuilder(SuiteCreativeQuotaModel)
    .format(quota, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeQuotaModel;
}

export const suiteCreativeQuotaServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeQuotaServiceAPIs => ({
  getQuota: async () => {
    const [error, result] = await client.get<TSuiteCreativeQuotaDTO>(
      SUITE_CREATIVE_STUDIO_ENDPOINTS.quota
    );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformQuota(result)];
  },
});

export const suiteCreativeQuotaClientService =
  suiteCreativeQuotaServiceAPIs(suiteHttpClient);
