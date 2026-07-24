import { DEFAULT_AI_MODEL } from "@/config/default-model";
import type {
  EMessageState,
  TAnswerDTO,
  TDeepResearchMessagesDTO,
  TDeleteConversationByIdDTO,
  TFileMessageDTO,
  TImageDTO,
  TMessageContentDTO,
  TMessageDTO,
  TMessageDTO2,
  TSyncConversationMessageDTO,
  TSyncDTO,
  TUpdateConversationNameByIdDTO,
  TUpdateConversationPinByIdDTO,
  TUpdateConversationUnPinByIdDTO,
  TUpdateMessageDTO,
} from "@/core/http/dto/conversation";
import type {
  TDeepResearchMessageInfo,
  TDeleteConversationById,
  TFileMessage,
  TImage,
  TImageCreationInfo,
  TMapMessageContentToSyncDTOParams,
  TMessage,
  TMessageTemp,
  TMessageType,
  TMessageTypeSync,
  TRole,
  TSelectedFile,
  TUpdateConversationNameById,
  TUpdateConversationPinById,
  TUpdateConversationUnPinById,
} from "@/core/models/conversation";
import { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import type { EAIValueModel } from "@/core/models/model";
import type {
  TFileUploadStates,
  TFileUploadStatus,
} from "@/store/conversation/types";

import {
  estimateTokens,
  generateRandomUUIDV4,
  getMimeTypeFromFile,
} from "../commons/helpers";
import { toCamelCase } from "../commons/string";

const CONVERSATION_MODE = {
  AI_ART: "image_creation",
  DEEP_RESEARCH: "deep_research",
  WEB_SEARCH: "web_search",
} as const;

const MESSAGE_TYPE = {
  CHAT: "chat",
  DEEP_RESEARCH: "deep_research",
  DEEP_RESEARCH_ANALYZE: "deep_research_analyze",
  IMAGE_CREATION: "image_creation",
  REALTIME_SEARCH: "realtime_search",
} as const satisfies Record<string, TMessageType>;

/**
 * Mapping from BE values (old & new) to FE EMessageType
 * This allows backward compatibility during migration
 */
// Lazily built so message type values are not read at module-eval time. domain/models/conversation
// ⇄ this mapper form an import cycle; an eager top-level read of EMessageType.* crashed
// under Turbopack's module-eval order ("Cannot read properties of undefined (reading 'CHAT')").
let messageTypeNormalizeMap: Record<string, TMessageType> | null = null;
const getMessageTypeNormalizeMap = (): Record<string, TMessageType> => {
  if (!messageTypeNormalizeMap) {
    messageTypeNormalizeMap = {
      // Current BE values (keep working)
      chat: MESSAGE_TYPE.CHAT,
      deep_research: MESSAGE_TYPE.DEEP_RESEARCH,
      deep_research_analyze: MESSAGE_TYPE.DEEP_RESEARCH_ANALYZE,
      deep_research_v2: MESSAGE_TYPE.DEEP_RESEARCH,
      image_creation: MESSAGE_TYPE.IMAGE_CREATION,
      realtime_search: MESSAGE_TYPE.REALTIME_SEARCH,

      // Future BE values (ready for migration)
      text: MESSAGE_TYPE.CHAT,
      text_to_image: MESSAGE_TYPE.IMAGE_CREATION,
      image_to_image: MESSAGE_TYPE.IMAGE_CREATION,
      image_to_text: MESSAGE_TYPE.CHAT,
      real_time_search: MESSAGE_TYPE.REALTIME_SEARCH,
      deep_research_conversation: MESSAGE_TYPE.DEEP_RESEARCH_ANALYZE,
      task: MESSAGE_TYPE.CHAT,
      task_response: MESSAGE_TYPE.CHAT,
      chat_with_web: MESSAGE_TYPE.REALTIME_SEARCH,
      chat_with_web_response: MESSAGE_TYPE.REALTIME_SEARCH,
    };
  }
  return messageTypeNormalizeMap;
};

/**
 * Normalize message type from BE to FE enum
 * @param value - Raw value from BE response
 * @returns Normalized EMessageType
 */
export const normalizeMessageType = (
  value: string | undefined | null
): TMessageType => {
  if (!value) {
    return MESSAGE_TYPE.CHAT;
  }
  return getMessageTypeNormalizeMap()[value] ?? MESSAGE_TYPE.CHAT;
};

const resolveMessageTypeFromDTO = (
  dtoType: TMessageDTO2["type"],
  role: TMessageDTO2["messages"]["role"]
): TMessageType => {
  if (dtoType !== "deep_research_conversation") {
    return normalizeMessageType(dtoType);
  }

  return role === "user"
    ? MESSAGE_TYPE.DEEP_RESEARCH
    : MESSAGE_TYPE.DEEP_RESEARCH_ANALYZE;
};

const injectBadgeLink = (
  content: string,
  linkResolver: (index: number) => string | undefined
): string => {
  const citationPattern = /\[\^?(?<citation>\d+)\]/gu;

  return content.replace(
    citationPattern,
    (match, _citation, _offset, _string, groups) => {
      const citationIndex = Math.trunc(Number(groups.citation));
      const resolvedUrl = linkResolver(citationIndex);

      if (!resolvedUrl) {
        return match;
      }

      return ` badgeLink[${citationIndex}]`;
    }
  );
};

export const mapMessageToDto = (entity: TMessage): TMessageDTO => ({
  content: entity.message,
  role: entity.role,
});

export const mapMessageTempToDto = (
  entity: TMessageTemp
): TMessageContentDTO => {
  const payload: TMessageContentDTO = {
    content: [
      {
        text: entity.content,
        type: "text" as TMessageContentDTO["content"][number]["type"],
      },
    ],
    id: entity.id,
    role: entity.role,
  };

  if (entity.files && entity.files.length > 0) {
    return {
      ...payload,
      attachments: entity.files.map((file) => ({
        download_url: file.downloadUrl,
        file_id: file.fileId,
        mime_type: file.fileMimeType,
      })),
    };
  }

  return payload;
};

export const mapDtoToMessage = (dto: TAnswerDTO): TMessage => {
  const [choice] = dto.choices;
  if (!choice) {
    throw new Error(
      "mapDtoToMessage: expected at least one choice in response"
    );
  }
  const { Message } = choice;
  return {
    message: Message.content,
    role: Message.role as TRole,
    status: "success",
    uid: generateRandomUUIDV4(),
  };
};

export const mappingFileFromMetadataDTO = (
  files: TFileMessageDTO[]
): TFileMessage[] =>
  files.map((file) => {
    const objectKeys = Object.keys(file);
    const newObj: Record<string, unknown> = {};

    for (const key of objectKeys) {
      const camelKey = toCamelCase(key);
      const objectValue = (file as unknown as Record<string, string>)[key];
      if (camelKey === "fileId" && objectValue) {
        newObj[camelKey] = objectValue.includes("file-")
          ? objectValue.split("file-")[1]
          : objectValue;
        continue;
      }
      newObj[camelKey] = objectValue;
    }

    return newObj as unknown as TFileMessage;
  });

const buildDeepResearchInfo = (
  dto: TMessageDTO2
): TDeepResearchMessageInfo | undefined => {
  const isHasDeepResearchInfo =
    !!dto.metadata?.citations &&
    !!dto.metadata?.steps &&
    !!dto.metadata?.processing_time;

  if (!isHasDeepResearchInfo) {
    return undefined;
  }

  return {
    citations: dto.metadata?.citations
      ? dto.metadata.citations.map((item) => ({
          ...item,
          imageUrl: item.image_url,
        }))
      : [],
    processTime: dto.metadata?.processing_time || "",
    steps: dto.metadata?.steps || {
      analyzing: "",
      done: "",
      exploring: "",
      researching: "",
      thinking: "",
    },
  };
};

const buildImageCreationInfo = (
  dto: TMessageDTO2,
  messageType: TMessageType
): TImageCreationInfo | undefined => {
  const isImageCreationMessage = messageType === MESSAGE_TYPE.IMAGE_CREATION;
  const isHasImageCreationInfo = !!dto.metadata?.image_style;

  return isHasImageCreationInfo || isImageCreationMessage
    ? { style: dto.metadata?.image_style || "none" }
    : undefined;
};

const buildContextJson = (dto: TMessageDTO2): TMessageTemp["contextJson"] => ({
  schemaVersion: dto.context_json?.schema_version || 1,
  textToImage: {
    generationPrompt: dto.context_json?.text_to_image?.generation_prompt || "",
    negativePrompt: dto.context_json?.text_to_image?.negative_prompt || "",
  },
});

export const mapDtoToMessageTemp = (dto: TMessageDTO2): TMessageTemp => {
  const [messageContent] = dto.messages.content;
  if (!messageContent) {
    throw new Error(
      "mapDtoToMessageTemp: expected at least one content item in message"
    );
  }
  const { text } = messageContent;
  let tokens = 0;

  if (dto.models) {
    tokens = estimateTokens(text ?? "");
  }

  const deepResearchInfo = buildDeepResearchInfo(dto);
  const messageType = resolveMessageTypeFromDTO(dto.type, dto.messages.role);
  const imageCreationInfo = buildImageCreationInfo(dto, messageType);

  // Inject badge link to content for deep research messages
  const uiContent = injectBadgeLink(text ?? "", (index: number) => {
    if (deepResearchInfo) {
      return deepResearchInfo.citations[index - 1]?.url;
    }

    return "";
  });

  return {
    content: text ?? "",
    contextJson: buildContextJson(dto),
    countToken: tokens,
    createdAt: dto.created_at,
    deepResearchInfo,
    feedbackStatus: dto.feedback_status,
    files: dto.metadata?.files
      ? mappingFileFromMetadataDTO(dto.metadata.files)
      : [],
    id: dto.ref_id,
    imageCreationInfo,
    messageId: dto.ref_id,
    models: dto.models,
    provider: dto.provider,
    role: dto.messages.role,
    state: dto.status as EMessageState,
    status: "success",
    type: messageType,
    uiContent,
    updatedAt: dto.updated_at,
  };
};

export const mapDtoToImages = (dto: TImageDTO): TImage => ({
  id: dto.ref_id,
  url: dto.url,
});

export const mapDtoToUpdateMessage = (dto: TUpdateMessageDTO): TMessageTemp => {
  const [choice] = dto.choices;
  if (!choice) {
    throw new Error(
      "mapDtoToUpdateMessage: expected at least one choice in response"
    );
  }
  const { message } = choice;
  let tokens = 0;

  if (dto.model) {
    tokens = estimateTokens(message.content ?? "");
  }

  return {
    content: message.content,
    countToken: tokens,
    createdAt: new Date().toISOString(),
    feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
    files: [],
    id: dto.id,
    messageId: dto.id,
    models: dto.model as EAIValueModel,
    role: message.role as TRole,
    status: "success",
    type: normalizeMessageType(dto.type),
    updatedAt: new Date().toISOString(),
  };
};

export const mapDtoToDeleteConversation = (
  dto: TDeleteConversationByIdDTO
): TDeleteConversationById => ({
  status: dto.status,
});

export const mapDtoToUpdateConversationName = (
  dto: TUpdateConversationNameByIdDTO
): TUpdateConversationNameById => ({
  name: dto.name,
});

export const mapDtoToUpdateConversationPin = (
  dto: TUpdateConversationPinByIdDTO
): TUpdateConversationPinById => ({
  pinned: dto.pinned,
  pinnedAt: dto.pinned_at,
});

export const mapDtoToUpdateConversationUnPin = (
  dto: TUpdateConversationUnPinByIdDTO
): TUpdateConversationUnPinById => ({
  pinned: dto.pinned,
});

// Moved to ./file-message (leaf) to break the mappers ⇄ usecases cycle; re-exported
// here so existing `mappers/conversations` import paths keep working.

export const mappingFromFileToFileMessage = (files: File[]): TSelectedFile[] =>
  files.map((file) => ({
    file,
    fileName: file.name,
    fileSize: file.size,
    mimeType: getMimeTypeFromFile(file.name, file.type),
    mockId: generateRandomUUIDV4(),
  }));

export const getValueFromRecordFileUploadStatus = (
  record: TFileUploadStates
): TFileUploadStatus => {
  const filterStates = Object.fromEntries(
    Object.entries(record).filter(([key]) => key !== "")
  );

  const states = Object.values(filterStates);
  const isExistLoading = states.some((state) => state.isLoading);
  if (isExistLoading) {
    return "loading";
  }

  const isExistError = states.some((state) => state.isError);
  if (isExistError) {
    return "error";
  }

  return "normal";
};

export function insertAssistantPendingBeforeUserMessage(
  messages: TMessageTemp[],
  messageType: TMessageType
): TMessageTemp[] {
  const index = messages.findIndex(
    (msg) => msg.type === messageType && msg.role === "user"
  );

  if (index === -1) {
    return messages;
  }

  const prev = messages[index - 1];
  const alreadyExists =
    prev?.role === "assistant" &&
    prev?.type === messageType &&
    prev?.status === "pending";

  if (alreadyExists) {
    return messages;
  }

  const assistantMessage: TMessageTemp = {
    content: "",
    countToken: 0,
    createdAt: new Date().toISOString(),
    feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
    files: [],
    id: generateRandomUUIDV4(),
    models: DEFAULT_AI_MODEL,
    role: "assistant",
    status: "pending",
    type: messageType,
    updatedAt: new Date().toISOString(),
  };

  return [assistantMessage, ...messages];
}

export function mappingMessageTempToMessageDeepResearchDTO(
  messages: TMessageTemp[]
): TDeepResearchMessagesDTO[] {
  return messages.map((message) => ({
    content: [
      {
        text: message.content,
        type: "text",
      },
    ],
    role: message.role,
    type: message.type,
  }));
}

function mapMessageToSync(
  message: TMessageTemp,
  messageType: TMessageTypeSync
): TSyncConversationMessageDTO {
  const files = message.files.map((attachment) => ({
    data: attachment.downloadUrl,
    filename: attachment.fileName,
    mime_type: attachment.fileMimeType,
  }));

  return {
    client_message_id: generateRandomUUIDV4(),
    content: message.content,
    conversation_message_id: message.id,
    files,
    message_type: messageType,
    role: message.role,
  };
}

export function mapLatestMessageToSyncDTO({
  messages = [],
  conversationId,
  convId,
  useMemory,
  syncAllow = "SYNC_ALLOW_REQUEST_AND_RESPONSE",
  messageType = "text",
}: TMapMessageContentToSyncDTOParams): TSyncDTO {
  const latestUserMessage = messages.findLast(
    (msg) => msg.role === "user" || msg.role === "developer"
  );

  return {
    client_conv_id: conversationId,
    conversation_conv_id: convId ?? "",
    conversation_messages: latestUserMessage
      ? [mapMessageToSync(latestUserMessage, messageType)]
      : [],
    sync_allow: syncAllow,
    use_memory: useMemory ?? false,
  };
}

export function mapAllMessagesToSyncDTO({
  messages = [],
  conversationId,
  syncAllow = "SYNC_ALLOW_REQUEST_AND_RESPONSE",
  messageType = "text",
}: TMapMessageContentToSyncDTOParams): TSyncDTO {
  const syncMessages = messages
    .filter((message) => !!message.content)
    .map((msg) => mapMessageToSync(msg, messageType));

  return {
    client_conv_id: conversationId,
    conversation_conv_id: "",
    conversation_messages: syncMessages,
    sync_allow: syncAllow,
  };
}

export const getConversationModeFromMessageType = (
  messageType?: TMessageType | ""
) => {
  switch (messageType) {
    case "deep_research": {
      return CONVERSATION_MODE.DEEP_RESEARCH;
    }
    case "image_creation": {
      return CONVERSATION_MODE.AI_ART;
    }
    case "realtime_search": {
      return CONVERSATION_MODE.WEB_SEARCH;
    }
    default: {
      return "";
    }
  }
};
