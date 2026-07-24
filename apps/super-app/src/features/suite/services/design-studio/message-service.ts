import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import {
  SuiteCreativeGetMessageHistoryQueryDTO,
  SuiteCreativeMessageModel,
  SuiteCreativePostMessagePayloadDTO,
  SuiteCreativeSuggestionItemModel,
} from "@/features/suite/types/design-studio";
import type {
  TSuiteCreativeDeleteMessageResponseDTO,
  TSuiteCreativeGetMessageHistoryResponseDTO,
  TSuiteCreativeGetMessageSuggestionsResponseDTO,
  TSuiteCreativeMessageDTO,
  TSuiteCreativeMessageServiceAPIs,
  TSuiteCreativePostMessageResponseDTO,
  TSuiteCreativeSuggestionItemDTO,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

import { MESSAGE_ROLE_MAP, MESSAGE_STATUS_MAP } from "./constants";

function normalizeMessageDTO(
  message: TSuiteCreativeMessageDTO
): TSuiteCreativeMessageDTO {
  return {
    ...message,
    role: MESSAGE_ROLE_MAP[message.role as string] ?? message.role,
    status: MESSAGE_STATUS_MAP[message.status as string] ?? message.status,
  };
}

function transformMessage(
  message: TSuiteCreativeMessageDTO
): SuiteCreativeMessageModel {
  return new TransformerBuilder(SuiteCreativeMessageModel)
    .format(normalizeMessageDTO(message), {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeMessageModel;
}

function transformMessages(
  messages: TSuiteCreativeMessageDTO[]
): SuiteCreativeMessageModel[] {
  return new TransformerBuilder(SuiteCreativeMessageModel)
    .format(messages.map(normalizeMessageDTO), {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeMessageModel[];
}

function transformSuggestionItems(
  items: TSuiteCreativeSuggestionItemDTO[]
): SuiteCreativeSuggestionItemModel[] {
  return new TransformerBuilder(SuiteCreativeSuggestionItemModel)
    .format(items, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeSuggestionItemModel[];
}

export const suiteCreativeMessageServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeMessageServiceAPIs => ({
  deleteMessage: (input) =>
    client.delete<TSuiteCreativeDeleteMessageResponseDTO>(
      SUITE_CREATIVE_STUDIO_ENDPOINTS.message(input.projectId, input.messageId)
    ),

  getMessageHistory: async (input) => {
    const query = new TransformerBuilder(SuiteCreativeGetMessageHistoryQueryDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.get<TSuiteCreativeGetMessageHistoryResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.messageHistory(input.projectId),
        {
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
        messages: transformMessages(result.messages),
        nextPageToken: result.next_page_token,
      },
    ];
  },

  getMessageSuggestions: async (input) => {
    const [error, result] =
      await client.get<TSuiteCreativeGetMessageSuggestionsResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.messageSuggestions(
          input.projectId,
          input.messageId
        )
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
        items: transformSuggestionItems(result.items),
      },
    ];
  },

  postMessage: async (input) => {
    const payload = new TransformerBuilder(SuiteCreativePostMessagePayloadDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.post<TSuiteCreativePostMessageResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.messages(input.projectId),
        {
          body: payload,
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
        messageId: result.message_id,
        userMessage: transformMessage(result.user_message),
      },
    ];
  },
});

export const suiteCreativeMessageClientService =
  suiteCreativeMessageServiceAPIs(suiteHttpClient);
