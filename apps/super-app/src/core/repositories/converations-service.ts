import { getRuntimeEnv } from "@cs/env/universal";

import {
  ChatTextToImageResponseModel,
  ImageToImageResponseModel,
} from "@/core/models/chat-features/image-creation";
import { WebSearchChatResponseModel } from "@/core/models/chat-features/polling-process";
import type {
  TCitationMessage,
  TMessageTypeSync,
} from "@/core/models/conversation";
import {
  ConversationModel,
  DeepResearchChatResponseModel,
} from "@/core/models/conversation";
import type { THttp } from "@/core/models/http";
import type { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { AIModel, CustomResponseModel } from "@/core/models/model";
import type { TConversationServiceAPIs } from "@/core/ports/conversation";
import { TransformerBuilder } from "@/libs/class-transformer";
import { toCamelCase } from "@/utils/commons/string";
import { extensionToMimeTypeMap } from "@/utils/constants/file";
import {
  mapAllMessagesToSyncDTO,
  mapDtoToDeleteConversation,
  mapDtoToImages,
  mapDtoToMessage,
  mapDtoToMessageTemp,
  mapDtoToUpdateConversationName,
  mapDtoToUpdateConversationPin,
  mapDtoToUpdateConversationUnPin,
  mapDtoToUpdateMessage,
  mapLatestMessageToSyncDTO,
  mapMessageToDto,
} from "@/utils/mappers/conversations";

import type {
  TAnswerDTO,
  TCitationMessageDTO,
  TConversationDTO,
  TCreateRegenerateMessageDTO,
  TDeleteConversationByIdDTO,
  TGetConversationByIdDto,
  TGetConversationByIdV2Dto,
  TGetImagesByIdDto,
  TGetImagesByIdV2Dto,
  TGetMessagesByIdDto,
  TGetMessagesByIdV2Dto,
  TMessageContentDTO,
  TMessageDTO2,
  TReadSourceDTO,
  TSyncDTO,
  TTracingResponseDTO,
  TUpdateConversationNameByIdDTO,
  TUpdateConversationPinByIdDTO,
  TUpdateConversationUnPinByIdDTO,
  TUpdateMessageDTO,
} from "../http/dto/conversation";
import { EMessageState } from "../http/dto/conversation";

const getChatServiceUrl = () => getRuntimeEnv().CS_PUBLIC_CHAT_SERVICE_URL;
const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const conversationServiceAPIs = (
  client: THttp
): TConversationServiceAPIs => ({
  // Internal
  getInternalConversationInfo: async (conversationId, userId) => {
    const [error, result] = await client.get<TConversationDTO>(
      `/api/v1/internal/web/conversations/${conversationId}?user_id=${userId}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledAuth: false,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(ConversationModel)
      .format(result)
      .toPlainCamelCase() as ConversationModel;

    return [null, data];
  },

  // Public
  createRegenerateMessage: async (input) => {
    const {
      messages,
      model,
      selectedCustomResponse,
      shouldSyncCrossPlatform = false,
      useMemory,
    } = input;
    const isExistAttachments = messages.some(
      (message) => message.attachments && message.attachments.length > 0
    );

    const latestUserMessage = input.messages.findLast(
      (message) => message.role === "user"
    );

    const hasFileContent =
      latestUserMessage?.attachments &&
      latestUserMessage.attachments.length > 0;
    const hasPDFContent = latestUserMessage?.attachments?.some(
      (attachment) => attachment.mime_type === extensionToMimeTypeMap.pdf
    );

    const requestBody: {
      messages: TMessageContentDTO[];
      model: EAIValueModel | undefined;
      n: string;
      nsfw_check: boolean;
      multimedia: boolean;
      provider: EAIProviderModel | undefined;
      read_source: TReadSourceDTO | undefined;
      sync?: TSyncDTO;
      custom_response_prompt_type?: string;
    } = {
      messages,
      model,
      multimedia: isExistAttachments,
      n: "1",
      nsfw_check: true,
      provider: input.provider,
      read_source: input.readSource,
    };

    let messageType: TMessageTypeSync = "text";

    if (hasPDFContent) {
      messageType = "chat_with_file";
    } else if (hasFileContent) {
      messageType = "image_to_text";
    }
    // Sync cross-platform
    if (shouldSyncCrossPlatform) {
      requestBody["sync"] = mapLatestMessageToSyncDTO({
        convId: useMemory ? (input.convId ?? "") : "",
        conversationId: input.id,
        messageType,
        messages: input.originalMessages,
        syncAllow: "SYNC_ALLOW_RESPONSE_ONLY",
        useMemory,
      });
    }

    // Custom response (only when no file attachments)
    if (selectedCustomResponse && !hasFileContent) {
      requestBody["custom_response_prompt_type"] = selectedCustomResponse;
    }

    const [error, result] = await client.post<TCreateRegenerateMessageDTO>(
      `/api/v2/users/web/conversations/${input.id}/regenerate-message`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: requestBody,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateMessage(result);
    return [null, data];
  },
  createPrediction: async (input) => {
    const transformedPayload = {
      ...input,
      messages: input.messages.map((message) => {
        const { attachments: _attachments, ...restInfo } = message;
        return restInfo;
      }),
      n: 1,
    };

    const [error, result] = await client.post<TUpdateMessageDTO>(
      `/api/v1/users/web/prediction`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: transformedPayload,
        // enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateMessage(result);
    return [null, data];
  },
  createConversationId: async (input) => {
    const [error, result] = await client.post<TConversationDTO>(
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

    const data = new TransformerBuilder(ConversationModel)
      .format(result)
      .toPlainCamelCase() as ConversationModel;

    return [null, data];
  },
  createConversationIdV2: async (input) => {
    const [error, result] = await client.post<TConversationDTO>(
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

    const data = new TransformerBuilder(ConversationModel)
      .format(result)
      .toPlainCamelCase() as ConversationModel;

    return [null, data];
  },
  getModels: async () => {
    const [error, result] = await client.get<{ providers: AIModel[] }>(
      "/api/v2/users/web/models",
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(AIModel)
      .format(result.providers)
      .toPlainCamelCase() as AIModel[];

    return [null, data];
  },
  getCustomResponse: async () => {
    const [error, result] = await client.get(
      "/api/v1/users/chat/custom-response/prompts",
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(CustomResponseModel)
      .format(result)
      .toPlainCamelCase() as CustomResponseModel;

    return [null, data];
  },
  postSelectedCustomResponse: async (item) => {
    const [error, result] = await client.post(
      "/api/v1/users/chat/custom-response/prompts",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          custom_response_prompt_type: item,
        },
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
  getConversationVersion: async () => {
    const [error, result] = await client.get<TGetConversationByIdDto>(
      "/api/v1/users/web/conversations",
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: 1,
          page_token: 1,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = {
      version: result.version,
    };
    return [null, data];
  },
  getConversations: async (input) => {
    const [error, result] = await client.get<TGetConversationByIdDto>(
      "/api/v1/users/web/conversations",
      {
        baseURL: getSmithEngineServiceUrl(),
        params: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(ConversationModel)
      .format(result.data)
      .toPlainCamelCase() as ConversationModel[];

    const transform = {
      ...result,
      data,
    };

    return [null, transform];
  },
  getConversationsV2: async (input) => {
    const [error, result] = await client.get<TGetConversationByIdV2Dto>(
      "/api/v2/users/web/conversations",
      {
        baseURL: getSmithEngineServiceUrl(),
        params: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(ConversationModel)
      .format(result.data)
      .toPlainCamelCase() as ConversationModel[];

    const transform = {
      ...result,
      data,
    };

    return [null, transform];
  },
  getConversationById: async (input) => {
    const [error, result] = await client.get<TConversationDTO>(
      `/api/v1/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(ConversationModel)
      .format(result)
      .toPlainCamelCase() as ConversationModel;

    return [null, data];
  },
  getConversationByIdV2: async (input) => {
    const [error, result] = await client.get<TConversationDTO>(
      `/api/v2/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(ConversationModel)
      .format(result)
      .toPlainCamelCase() as ConversationModel;

    return [null, data];
  },
  getMessagesById: async (input) => {
    const [error, result] = await client.get<TGetMessagesByIdDto>(
      `/api/v1/users/web/conversations/${input.id}/messages`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: input.limit,
          next_id: input.next_id,
          sort: input.sortBy,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = result.data
      .map(mapDtoToMessageTemp)
      .filter((item) => item.state !== EMessageState.INACTIVE);

    const transform = {
      data,
      has_more: !!result.next_id,
      next_id: result.next_id,
    };

    return [null, transform];
  },
  getMessagesByIdV2: async (input) => {
    const [error, result] = await client.get<TGetMessagesByIdV2Dto>(
      `/api/v2/users/web/conversations/${input.id}/messages`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: input.limit,
          prev_cursor: input.prev_cursor,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = result.data
      .map(mapDtoToMessageTemp)
      .filter((item) => item.state !== EMessageState.INACTIVE);

    const transform = {
      data,
      has_more: result.has_more,
      next_id: result.prev_cursor,
    };

    return [null, transform];
  },
  getImagesById: async (input) => {
    const [error, result] = await client.get<TGetImagesByIdDto>(
      `/api/v1/users/conversations/${input.id}/images`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: input.limit,
          ...(input.next_id && { next_id: input.next_id }),
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const transform = {
      data: result.data.map(mapDtoToImages),
      next_id: result.next_id,
    };

    return [null, transform];
  },
  getImagesByIdV2: async (input) => {
    const [error, result] = await client.get<TGetImagesByIdV2Dto>(
      `/api/v2/users/conversations/${input.id}/images`,
      {
        baseURL: getSmithEngineServiceUrl(),
        params: {
          limit: input.limit,
          prev_cursor: input.next_id,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const transform = {
      data: result.data.map(mapDtoToImages),
      next_id: result.prev_cursor,
    };

    return [null, transform];
  },
  deleteConversationById: async (input) => {
    const [error, result] = await client.put<TDeleteConversationByIdDTO>(
      `/api/v1/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          status: "STATUS_INACTIVE",
        },
        // enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToDeleteConversation(result);
    return [null, data];
  },
  deleteConversationByIdV2: async (input) => {
    const [error, result] = await client.delete<TDeleteConversationByIdDTO>(
      `/api/v1/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToDeleteConversation(result);
    return [null, data];
  },
  updateConversationMessages: async (input, metadata) => {
    const originInput = metadata?.originInput;
    const shouldSyncCrossPlatform = input.shouldSyncCrossPlatform ?? false;
    const latestUserMessage = input.messages.findLast(
      (message) => message.role === "user"
    );
    const hasFileContent =
      latestUserMessage?.attachments &&
      latestUserMessage.attachments.length > 0;
    const hasPDFContent = latestUserMessage?.attachments?.some(
      (attachment) => attachment.mime_type === extensionToMimeTypeMap.pdf
    );

    // Determine endpoint based on file content
    const endpoint = hasFileContent
      ? `/api/v1/users/web/conversations/${input.id}/chat-multimedia`
      : `/api/v2/users/web/conversations/${input.id}/chat`;

    const requestBody: {
      messages: TMessageContentDTO[];
      model: EAIValueModel | undefined;
      provider: EAIProviderModel | undefined;
      read_source: TReadSourceDTO | undefined;
      n: string;
      nsfw_check: boolean;
      sync?: TSyncDTO;
      custom_response_prompt_type?: string;
    } = {
      messages: input.messages,
      model: input.model,
      n: "1",
      nsfw_check: true,
      provider: input.provider,
      read_source: input.readSource,
    };

    let messageType: TMessageTypeSync = "text";

    if (hasPDFContent) {
      messageType = "chat_with_file";
    } else if (hasFileContent) {
      messageType = "image_to_text";
    }

    // Sync cross-platform (excluded for PDF content)
    if (shouldSyncCrossPlatform) {
      requestBody["sync"] = mapLatestMessageToSyncDTO({
        messages: originInput ?? [],
        conversationId: input.id,
        useMemory: input.useMemory,
        ...(input.useMemory && {
          convId: input.convId,
        }),
        messageType,
      });
    }

    // Custom response (only when no file attachments)
    if (input.selectedCustomResponse && !hasFileContent) {
      requestBody["custom_response_prompt_type"] = input.selectedCustomResponse;
    }

    const [error, result] = await client.post<TUpdateMessageDTO>(endpoint, {
      baseURL: getSmithEngineServiceUrl(),
      body: requestBody,
    });

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateMessage({ ...result, type: "chat" });

    return [null, data];
  },
  updateUsecaseMessages: async (input, metadata) => {
    const originInput = metadata?.originInput;
    const requestBody: {
      messages: TMessageContentDTO[];
      model: EAIValueModel | undefined;
      provider: EAIProviderModel | undefined;
      n: string;
      nsfw_check: boolean;
      sync?: TSyncDTO;
    } = {
      messages: input.messages,
      model: input.model,
      n: "1",
      nsfw_check: true,
      provider: input.provider,
    };

    // Sync cross-platform (excluded for PDF content)
    if (input.shouldSyncCrossPlatform) {
      requestBody["sync"] = mapAllMessagesToSyncDTO({
        conversationId: input.id,
        messageType: "task",
        messages: originInput ?? [],
      });
    }

    const [error, result] = await client.post<TUpdateMessageDTO>(
      `/api/v2/users/web/conversations/${input.id}/chat`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: requestBody,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateMessage({ ...result, type: "chat" });

    return [null, data];
  },
  updateConversationMessagesWithoutVendor: async (input) => {
    const [error] = await client.post<TUpdateMessageDTO>(
      `/api/v1/users/web/conversations/${input.id}/messages`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, {}];
  },
  updateConversationNameById: async (input) => {
    const [error, result] = await client.put<TUpdateConversationNameByIdDTO>(
      `/api/v1/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          name: input.name,
        },
        // enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateConversationName(result);
    return [null, data];
  },
  updateConversationNameByIdV2: async (input) => {
    const [error, result] = await client.patch<TUpdateConversationNameByIdDTO>(
      `/api/v2/users/web/conversations/${input.id}`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          title: input.title,
        },
      }
    );

    if (error) {
      return [error, null];
    }
    const data = mapDtoToUpdateConversationName(result);
    return [null, data];
  },
  updateConversationPinById: async (input) => {
    const [error, result] = await client.put<TUpdateConversationPinByIdDTO>(
      `/api/v1/users/web/conversations/${input.id}/pin`,
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateConversationPin(result);
    return [null, data];
  },
  updateConversationUnPinById: async (input) => {
    const [error, result] = await client.put<TUpdateConversationUnPinByIdDTO>(
      `/api/v1/users/web/conversations/${input.id}/unpin`,
      {
        baseURL: getSmithEngineServiceUrl(),
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = mapDtoToUpdateConversationUnPin(result);
    return [null, data];
  },
  createMessage: async (params) => {
    const { messages, model } = params;
    const messagesDto = messages.map(mapMessageToDto);

    const [error, result] = await client.post<TAnswerDTO>("/api/v7/chat", {
      baseURL: getChatServiceUrl(),
      body: {
        messages: messagesDto,
        model,
      },
    });

    if (error) {
      return [error, null];
    }

    const data = mapDtoToMessage(result);

    return [null, data];
  },
  shouldUseIndexDB: async (
    conversationId: string,
    lastMessageContent: string
  ) => {
    const [error, result] = await client.post<{ data: { is_latest: boolean } }>(
      `/api/v1/users/web/conversations/${conversationId}/messages/check-latest`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: {
          message: lastMessageContent,
        },
      }
    );

    if (error) {
      return [error, null];
    }

    return [null, { isLatest: result.data.is_latest }];
  },
  chatWithDeepResearch: async (input) => {
    const [error, result] = await client.post(
      "/api/v2/users/web/research/chat",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(DeepResearchChatResponseModel)
      .format(result)
      .toPlainCamelCase() as DeepResearchChatResponseModel;

    return [null, data];
  },
  getTracingDeepResearchProgress: async (input) => {
    const [error, result] = await client.post<TTracingResponseDTO>(
      "/api/v1/users/web/research/tracing",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const message = result.data ? mapDtoToMessageTemp(result.data) : null;

    return [null, { message, status: result.status }];
  },
  getInfoCitations: async (input) => {
    const [error, result] = await client.get<{ data: TCitationMessageDTO[] }>(
      `/api/v1/users/web/conversations/${input.conversation_id}/messages/${input.message_id}/citations`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const transformData: TCitationMessage[] = result.data.map(
      (item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [toCamelCase(key), value])
        ) as TCitationMessage
    );

    return [null, transformData];
  },
  getInfoCitationsV2: async (input) => {
    const [error, result] = await client.get<{ data: TCitationMessageDTO[] }>(
      `/api/v2/users/web/conversations/${input.conversation_id}/messages/${input.message_id}/citations`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const transformData: TCitationMessage[] = result.data.map(
      (item) =>
        Object.fromEntries(
          Object.entries(item).map(([key, value]) => [toCamelCase(key), value])
        ) as TCitationMessage
    );

    return [null, transformData];
  },
  chatWithTextToImage: async (input) => {
    const [error, result] = await client.post<{ data: TMessageDTO2 }>(
      `/api/v1/users/web/images/text-to-image`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const formattedData = new TransformerBuilder(ChatTextToImageResponseModel)
      .format(result)
      .toPlainCamelCase() as ChatTextToImageResponseModel;

    const data = formattedData.message;

    return [null, data];
  },
  chatWithImageToImage: async (
    input,
    _selectedFiles,
    _shouldSaveToLocalStorage = true
  ) => {
    const [error, result] = await client.post<{ process_id: string }>(
      `/api/v3/users/web/images/image-to-image`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const formattedData = new TransformerBuilder(ImageToImageResponseModel)
      .format(result)
      .toPlainCamelCase() as ImageToImageResponseModel;

    return [null, formattedData];
  },
  regenerateImageToImage: async (
    input,
    _selectedFiles,
    _shouldSaveToLocalStorage = true
  ) => {
    const [error, result] = await client.post<{ process_id: string }>(
      `api/v1/users/web/images/regenerate/image-to-image`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const formattedData = new TransformerBuilder(ImageToImageResponseModel)
      .format(result)
      .toPlainCamelCase() as ImageToImageResponseModel;

    return [null, formattedData];
  },
  getTracingImageToImageProgress: async (input) => {
    const [error, result] = await client.post<TTracingResponseDTO>(
      `/api/v1/users/web/images/tracing`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const message = result?.data ? mapDtoToMessageTemp(result.data) : null;

    return [
      null,
      { failedReason: result.failed_reason, message, status: result.status },
    ];
  },
  webSearch: async (input) => {
    const [error, result] = await client.post<{ data: { process_id: string } }>(
      `/api/v2/users/web/search/real-time`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
      }
    );

    if (error) {
      return [error, null];
    }

    const formattedData = new TransformerBuilder(WebSearchChatResponseModel)
      .format(result.data)
      .toPlainCamelCase() as WebSearchChatResponseModel;

    return [null, formattedData];
  },
  getChatPollingResult: async (input) => {
    const { process_id, conversation_id, read_source } = input;
    const [error, result] = await client.get<TTracingResponseDTO>(
      `/api/v1/users/conversations/${conversation_id}/processes/${process_id}?read_source=${read_source}`,
      {
        baseURL: getSmithEngineServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }

    const message = result?.data ? mapDtoToMessageTemp(result.data) : null;

    return [null, { message, status: result.status }];
  },
  stopLongRunningTask: async (payload) => {
    const [error, result] = await client.post<{ version: string }>(
      "/api/v1/users/web/stop",
      {
        baseURL: getSmithEngineServiceUrl(),
        body: payload,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = {
      version: result.version,
    };
    return [null, data];
  },
});
