import { getRuntimeEnv } from "@cs/env/universal";

import type { TSurveyResponseDTO } from "@/core/http/dto/survey";
import type { THttp } from "@/core/models/http";
import { SurveyModel } from "@/core/models/survey";
import type { TSurveyServiceApis } from "@/core/ports/survey";
import { TransformerBuilder } from "@/libs/class-transformer";

const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const surveyServiceAPIs = (client: THttp): TSurveyServiceApis => ({
  createSurvey: async (input) => {
    const [error, result] = await client.post<{ data: TSurveyResponseDTO }>(
      "/api/v1/users/web/surveys",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(SurveyModel)
      .format(result?.data)
      .toPlainCamelCase() as SurveyModel;

    return [null, data];
  },
  downVote: async (surveyId: string) => {
    const [error, result] = await client.post<Record<string, string>>(
      `/api/v1/users/web/surveys/${surveyId}/unvote`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, result];
  },
  getList: async (params) => {
    const [error, result] = await client.get<{ data: TSurveyResponseDTO[] }>(
      "/api/v1/users/web/surveys",
      {
        baseURL: getSmithEngineServiceUrl(),
        params,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(SurveyModel)
      .format(result?.data)
      .toPlainCamelCase() as SurveyModel[];

    return [null, data];
  },
  upVote: async (surveyId: string) => {
    const [error, result] = await client.post<Record<string, string>>(
      `/api/v1/users/web/surveys/${surveyId}/vote`,
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
