import { getRuntimeEnv } from "@cs/env/universal";

import { CreateAssistantWriting } from "@/core/models/assistant-writing";
import type { THttp } from "@/core/models/http";
import type { TAssistantWritingServiceAPIs } from "@/core/ports/assistant-writing";
import { TransformerBuilder } from "@/libs/class-transformer";
import { transformMessagesDTOToAssistantWriting } from "@/utils/mappers/assistants";
import {
  mapDtoToUpdateMessage,
  mapMessageTempToDto,
} from "@/utils/mappers/conversations";

import type {
  TGetMessagesByIdDto,
  TGetMessagesByIdV2Dto,
  TUpdateMessageDTO,
} from "../http/dto/conversation";

const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const assistantWritingServiceAPIs = (
  client: THttp
): TAssistantWritingServiceAPIs => ({
  createAssistantWritingId: async (input) => {
    const [error, result] = await client.post<CreateAssistantWriting>(
      "/api/v1/users/web/conversations",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(CreateAssistantWriting)
      .format(result)
      .toPlainCamelCase() as CreateAssistantWriting;

    return [null, data];
  },
  createAssistantWritingIdV2: async (input) => {
    const [error, result] = await client.post<CreateAssistantWriting>(
      "/api/v2/users/web/conversations",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(CreateAssistantWriting)
      .format(result)
      .toPlainCamelCase() as CreateAssistantWriting;

    return [null, data];
  },
  getAssistantWritingById: async (input) => {
    const [error, result] = await client.get<TGetMessagesByIdDto>(
      `/api/v1/users/web/conversations/${input.id}/messages`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: 100,
          next_id: 0,
          sort: "SORT_ASC",
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = transformMessagesDTOToAssistantWriting(result.data);
    return [null, data];
  },
  getAssistantWritingByIdV2: async (input) => {
    const [error, result] = await client.get<TGetMessagesByIdV2Dto>(
      `/api/v2/users/web/conversations/${input.id}/messages`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: 50,
          prev_cursor: "",
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const reversedData = [...result.data].toReversed();
    const data = transformMessagesDTOToAssistantWriting(reversedData);
    return [null, data];
  },
  updateAssistantWritingById: async (input) => {
    const messagesDto = input.messages.map(mapMessageTempToDto);

    const [error, result] = await client.post<TUpdateMessageDTO>(
      `/api/v2/users/web/conversations/${input.id}/chat`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          messages: messagesDto,
          model: input.model,
          n: "1",
          nsfw_check: true,
          provider: input.provider,
          read_source: input.readSource,
          ...(input.sync && { sync: input.sync }),
        },
        // enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateMessage(result);
    return [null, data];
  },
});
