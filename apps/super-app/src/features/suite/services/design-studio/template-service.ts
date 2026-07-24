import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import {
  SuiteCreativeListTemplatesQueryDTO,
  SuiteCreativeTemplateModel,
} from "@/features/suite/types/design-studio";
import type {
  TSuiteCreativeListTemplatesResponseDTO,
  TSuiteCreativeTemplateDTO,
  TSuiteCreativeTemplateServiceAPIs,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

function transformTemplates(
  templates: TSuiteCreativeTemplateDTO[]
): SuiteCreativeTemplateModel[] {
  return new TransformerBuilder(SuiteCreativeTemplateModel)
    .format(templates, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeTemplateModel[];
}

export const suiteCreativeTemplateServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeTemplateServiceAPIs => ({
  listTemplates: async (input = {}) => {
    const query = new TransformerBuilder(SuiteCreativeListTemplatesQueryDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.get<TSuiteCreativeListTemplatesResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.templates,
        {
          enabledAuth: false,
          params: query,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [
      null,
      {
        nextPageToken: result.next_page_token,
        templates: transformTemplates(result.templates),
      },
    ];
  },
});

export const suiteCreativeTemplateClientService =
  suiteCreativeTemplateServiceAPIs(suiteHttpClient);
