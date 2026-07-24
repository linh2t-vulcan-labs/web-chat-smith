import { getRuntimeEnv } from "@cs/env/universal";

import { AssistantModel } from "@/core/models/assistant";
import type { THttp } from "@/core/models/http";
import type { TAssistantServiceAPIs } from "@/core/ports/assistants";
import { TransformerBuilder } from "@/libs/class-transformer";

import type { TGetListAssistantsDTO } from "../http/dto/assistants";
import { QueryListAssistantDTO } from "../http/dto/assistants";

export const assistantServiceAPIs = (client: THttp): TAssistantServiceAPIs => ({
  getAssistants: async (input) => {
    const formattedInput = new TransformerBuilder(QueryListAssistantDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as QueryListAssistantDTO;

    const [error, result] = await client.get<TGetListAssistantsDTO>(
      "/api/v1/users/web/assistants",
      {
        baseURL: getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL,
        params: formattedInput,
      }
    );

    if (error) {
      return [error, null];
    }

    const transformedData = new TransformerBuilder(AssistantModel)
      .format(result?.assistants ?? [])
      .toPlainCamelCase() as AssistantModel[];

    return [null, transformedData];
  },
});
