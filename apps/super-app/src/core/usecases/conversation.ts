import dayjs from "dayjs";

import { DEFAULT_AI_MODEL } from "@/config/default-model";
import type {
  TCreateAssistantTempMessagesInput,
  TCreateTempMessageInput,
  TGetItemsUntilLastUserRoleInput,
  TGetTotalTokenByMessagesInput,
  TTrimOldMessagesByToken,
} from "@/core/http/dto/conversation";
import {
  ChatDeepResearchDTO,
  ChatImageToImageDTO,
  ChatInputDTO,
  ChatRegenerateImageToImageDTO,
  ChatTextToImageDTO,
  WebSearchDTO,
} from "@/core/http/dto/conversation";
import { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import { TransformerBuilder } from "@/libs/class-transformer";
import {
  checkImageFileType,
  estimateTokens,
  generateRandomUUIDV4,
} from "@/utils/commons/helpers";
import { isNotEmptyInput } from "@/utils/commons/string";
import {
  MAX_IMAGES_PER_UPLOAD,
  MAX_TOKENS,
} from "@/utils/constants/conversation";
import { FILE_VALIDATION_ERROR_KEY } from "@/utils/constants/error";
import { mappingDisplayFileToTempFileMessage } from "@/utils/mappers/file-message";

import {
  EAIART_STYLE,
  EAIART_TYPE,
} from "../models/chat-features/image-creation";
import type {
  TGetAssistantMessageAfterSendOptions,
  TMessageTemp,
  TMessageType,
  TRole,
  TSelectedAIArt,
  TSelectedFile,
  TStatusMessage,
  TValidationResult,
} from "../models/conversation";
import { EConversationMode } from "../models/conversation";
import { EAIValueModel } from "../models/model";
import type { TChatFreeUsage } from "../models/usage";
import type { TConversationRepositories } from "../ports/conversation";

const DEFAULT_CREATE_ASSISTANT_TEMP_MESSAGES_INPUT: TCreateAssistantTempMessagesInput =
  {
    models: EAIValueModel.None,
    prompt: "",
    status: "pending",
  };

const createTempMessage = (input: TCreateTempMessageInput): TMessageTemp => {
  const {
    prompt,
    model,
    status = "success" as TStatusMessage,
    type = "chat" as TMessageType,
    files,
    role = "user" as TRole,
    imageStyle,
  } = input;
  const id = generateRandomUUIDV4();

  const countToken = model ? estimateTokens(prompt) : 0;

  return {
    content: prompt.trim(),
    countToken,
    createdAt: new Date().toISOString(),
    feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
    files: files?.map(mappingDisplayFileToTempFileMessage) || [],
    id,
    messageId: "",
    models: DEFAULT_AI_MODEL,
    role,
    status,
    type,
    updatedAt: new Date().toISOString(),
    ...(imageStyle && {
      imageCreationInfo: { style: imageStyle },
    }),
  };
};

const getItemsUntilLastUserRole = (
  input: TGetItemsUntilLastUserRoleInput
): TMessageTemp[] => {
  const getRoleData = input.messages.map((item) => item.role);
  const lastUserIndex = getRoleData.lastIndexOf("user");

  if (lastUserIndex === -1) {
    return input.messages;
  }

  return input.messages.slice(0, lastUserIndex + 1);
};

const getTotalTokenByMessages = (input: TGetTotalTokenByMessagesInput) => {
  const { messages } = input;
  let totalTokens = 0;
  for (const currentToken of messages) {
    totalTokens += currentToken.countToken;
  }
  return totalTokens;
};

const getLastUserMessage = (messages: TMessageTemp[]): TMessageTemp | null => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "user") {
      return message;
    }
  }
  return null;
};

const getLastAssistantMessage = (
  messages: TMessageTemp[]
): TMessageTemp | null => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.role === "assistant" && message.status !== "pending") {
      return message;
    }
  }
  return null;
};

const trimOldMessagesByToken = (
  input: TTrimOldMessagesByToken
): TMessageTemp[] => {
  const { messages, totalTokens } = input;
  let total = totalTokens;
  const trimmedMessages = [...messages];

  while (total > MAX_TOKENS && trimmedMessages.length > 0) {
    const removedMessage = trimmedMessages.shift();
    if (removedMessage) {
      total -= removedMessage.countToken;
    }
  }

  return trimmedMessages;
};

const shouldUpdateTitle = (messages: TMessageTemp[], order = 2) => {
  const getUserMessages = messages.filter(
    (mes) => mes.role === "user" && mes.status === "success"
  );
  return getUserMessages.length === order;
};

const markLastAssistantMessageAsError: TConversationRepositories["markLastAssistantMessageAsError"] =
  (messages, content) =>
    messages.map((message, index) => {
      if (index !== messages.length - 1) {
        return message;
      }

      if (message.role === "user") {
        return message;
      }

      return {
        ...message,
        content: content || message.content,
        status: "error",
      };
    });

const markLastAssistantMessageAsCancelled: TConversationRepositories["markLastAssistantMessageAsCancelled"] =
  (messages, content) =>
    messages.map((message, index) => {
      if (index !== messages.length - 1) {
        return message;
      }

      if (message.role === "user") {
        return message;
      }

      return {
        ...message,
        content: content ?? message.content,
        status: "skipped",
      };
    });

const updateAssistantTempMessage: TConversationRepositories["updateAssistantTempMessage"] =
  (messages, assistantMessage) =>
    messages.map((message, index) => {
      if (index !== messages.length - 1) {
        return message;
      }

      if (message.role === "user") {
        return message;
      }

      return assistantMessage;
    });

const updateFieldForAssistantMessage: TConversationRepositories["updateFieldForAssistantMessage"] =
  (messages, messageId, updatedInfo) =>
    messages.map((message) => {
      if (message.messageId !== messageId) {
        return message;
      }

      return {
        ...message,
        ...updatedInfo,
      };
    });

const transformMessageBeforeSend: TConversationRepositories["transformMessageBeforeSend"] =
  (messages, others) => {
    const messageDto = new TransformerBuilder(ChatInputDTO)
      .format(
        {
          messages,
          ...others,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatInputDTO;

    return messageDto;
  };

const filterEmptyContentMessage: TConversationRepositories["filterEmptyContentMessage"] =
  (messages) => messages.filter((message) => !!message.content);

const getLatestUserMessageWithType: TConversationRepositories["getLatestUserMessageWithType"] =
  (messages, type) => {
    const latestUserMessage = messages.findLast(
      (message) => message.type === type && message.role === "user"
    );

    if (!latestUserMessage) {
      return null;
    }

    return latestUserMessage;
  };

const getLatestUserMessageForConversationMode: TConversationRepositories["getLatestUserMessageForConversationMode"] =
  (messages, type) => {
    const latestUserMessage = getLastUserMessage(messages);
    if (!latestUserMessage) {
      return null;
    }

    const isDeepResearchMessage = latestUserMessage.type === type;

    if (!isDeepResearchMessage) {
      return null;
    }
    return latestUserMessage;
  };

const getLatestAssistantMessageForConversationMode: TConversationRepositories["getLatestAssistantMessageForConversationMode"] =
  (messages, type) => {
    const latestAssistantMessage = getLastAssistantMessage(messages);

    if (!latestAssistantMessage) {
      return null;
    }

    if (latestAssistantMessage.type !== type) {
      return null;
    }

    return latestAssistantMessage;
  };

const transformMessageForDeepResearch: TConversationRepositories["transformMessageForDeepResearch"] =
  (message, conversationId, isRegenerate, messages, sync, readSource) =>
    new TransformerBuilder(ChatDeepResearchDTO)
      .format(
        {
          conversationId,
          isRegenerate,
          messages,
          prompt: message.content,
          readSource,
          sync,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatDeepResearchDTO;

const generateReachedLimitTimeDeepResearch: TConversationRepositories["generateReachedLimitTimeDeepResearch"] =
  () => {
    const today = dayjs().utc();

    // Get first day of next week (ISO: Monday)
    const nextWeekMonday = today.add(1, "week").startOf("isoWeek").utc();

    // Get last day of current month
    const lastDayOfMonth = today.endOf("month").startOf("day").utc();

    // Get first day of next month
    const firstDayOfNextMonth = today.add(1, "month").startOf("month").utc();

    // Apply logic
    const resetTime = nextWeekMonday.isSame(lastDayOfMonth, "day")
      ? firstDayOfNextMonth
      : nextWeekMonday;

    // Format as "YYYY-MM-DD 00:00:00 +0000 UTC"
    const formattedResetTime = `${resetTime.format("YYYY-MM-DD HH:mm:ss +0000")} UTC`;

    return formattedResetTime;
  };

const getTypeOfUserMessage: TConversationRepositories["getTypeOfUserMessage"] =
  (conversationMode) => {
    const mapperObject: Record<EConversationMode, TMessageType> = {
      [EConversationMode.CHAT]: "chat",
      [EConversationMode.DEEP_RESEARCH]: "deep_research", // default analyze
      [EConversationMode.AI_ART]: "image_creation",
      [EConversationMode.WEB_SEARCH]: "realtime_search",
    };
    return mapperObject[conversationMode] ?? "chat";
  };

const getTypeOfAssistantMessage: TConversationRepositories["getTypeOfAssistantMessage"] =
  (conversationMode) => {
    const mapperObject: Record<EConversationMode, TMessageType> = {
      [EConversationMode.CHAT]: "chat",
      [EConversationMode.DEEP_RESEARCH]: "deep_research_analyze", // default analyze
      [EConversationMode.AI_ART]: "image_creation",
      [EConversationMode.WEB_SEARCH]: "realtime_search",
    };
    return mapperObject[conversationMode] ?? "chat";
  };

const injectBadgeLink: TConversationRepositories["injectBadgeLink"] = (
  content: string,
  linkResolver: (index: number) => string | undefined
): string => {
  // Regex pattern matches both [1] and [^1] citation formats
  const CITATION_PATTERN = /\[\^?(?<citation>\d+)\]/gu;

  return content.replace(
    CITATION_PATTERN,
    (match, _citation, _offset, _string, groups) => {
      const citationIndex = Math.trunc(Number(groups.citation));
      const resolvedUrl = linkResolver(citationIndex);

      //  Leave as-is if no link found
      if (!resolvedUrl) {
        return match;
      }

      return ` badgeLink[${citationIndex}]`;
    }
  );
};

const preprocessContentMessages: TConversationRepositories["preprocessContentMessages"] =
  (messages): TMessageTemp[] =>
    messages.map((message) => {
      if (message.type === "deep_research" && message.role === "assistant") {
        const resolveUrl = (index: number) => {
          if (message.deepResearchInfo) {
            return message.deepResearchInfo.citations[index - 1]?.url;
          }

          return "";
        };

        return {
          ...message,
          uiContent: injectBadgeLink(message.content, resolveUrl),
        };
      }

      return message;
    });

const detectConversationProcessing: TConversationRepositories["detectConversationProcessing"] =
  (conversationInfo) => {
    if (!conversationInfo) {
      return "";
    }

    if (!conversationInfo.longPollingProcess.processId) {
      return "";
    }

    return conversationInfo.longPollingProcess.type;
  };

const processExportContent: TConversationRepositories["processExportContent"] =
  (message) => {
    const isDeepResearchMessage = message.type === "deep_research";
    if (!isDeepResearchMessage) {
      return message.content;
    }

    const { deepResearchInfo } = message;
    if (!deepResearchInfo) {
      return message.content;
    }
    const { citations } = deepResearchInfo;

    const contentMessage = message.content;

    const citationList = citations
      .map((citation, index) => `<li>[${index + 1}]: ${citation.url}</li>`)
      .join("");

    const citationHTML = `<p><strong>Sources:</strong></p><ul>${citationList}</ul>`;

    return `${contentMessage.trim()}\n\n${citationHTML}`;
  };

const getMessagesContextForDeepResearch: TConversationRepositories["getMessagesContextForDeepResearch"] =
  (messages) => {
    const groups: TMessageTemp[][] = [];
    let currentGroup: TMessageTemp[] = [];
    let expecting: "user_start" | "assistant_analyze" | "user_clarify" =
      "user_start";

    for (const message of messages) {
      if (!message?.content) {
        continue;
      }

      const { role, type } = message;

      if (
        expecting === "user_start" &&
        role === "user" &&
        type === "deep_research"
      ) {
        currentGroup.push(message);
        expecting = "assistant_analyze";
        continue;
      }

      if (
        expecting === "assistant_analyze" &&
        role === "assistant" &&
        type === "deep_research_analyze"
      ) {
        currentGroup.push(message);
        expecting = "user_clarify";
        continue;
      }

      if (
        expecting === "user_clarify" &&
        role === "user" &&
        type === "deep_research"
      ) {
        currentGroup.push(message);
        groups.push([...currentGroup]);
        currentGroup = [];
        expecting = "user_start";
        continue;
      }

      // Start a new group on assistant deep_research (even if group is partial)
      if (role === "assistant" && type === "deep_research") {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup]); // push partial group
          currentGroup = [];
        }
        expecting = "user_start";
        continue;
      }

      // Unexpected pattern — reset
      if (currentGroup.length > 0) {
        groups.push([...currentGroup]); // push partial group
      }
      currentGroup = [];
      expecting = "user_start";
    }

    // Always push the trailing group if it wasn't already pushed
    if (currentGroup.length > 0) {
      groups.push([...currentGroup]);
    }

    return groups.at(-1) ?? [];
  };

const transformMessageForTextToImage: TConversationRepositories["transformMessageForTextToImage"] =
  (prompt, conversationId, aiArtStyle, isRegenerate, model, sync, readSource) =>
    new TransformerBuilder(ChatTextToImageDTO)
      .format(
        {
          conversationId,
          isRegenerate,
          model,
          prompt,
          readSource,
          style: aiArtStyle,
          sync,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatTextToImageDTO;

const transformMessageForWebSearch: TConversationRepositories["transformMessageForWebSearch"] =
  (message, conversationId, isRegenerate, sync, readSource) =>
    new TransformerBuilder(WebSearchDTO)
      .format(
        {
          conversationId,
          isRegenerate,
          prompt: message.content,
          readSource,
          sync,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as WebSearchDTO;

const getGuardValueFromMessage: TConversationRepositories["getGuardValueFromMessage"] =
  (message) => {
    switch (message.type) {
      case "deep_research_analyze":
      case "deep_research": {
        return "deepResearch";
      }
      case "image_creation": {
        return "imageCreation";
      }
      case "realtime_search": {
        return "webSearch";
      }
      default: {
        return "chat";
      }
    }
  };

const getSourceAssistantMessage: TConversationRepositories["getSourceAssistantMessage"] =
  (conversationMode, lastMessage) => {
    if (lastMessage) {
      const objMapping: Record<TMessageType, EConversationMode | "regenerate"> =
        {
          chat: "regenerate",
          deep_research: EConversationMode.DEEP_RESEARCH,
          deep_research_analyze: EConversationMode.DEEP_RESEARCH,
          image_creation: EConversationMode.AI_ART,
          realtime_search: EConversationMode.WEB_SEARCH,
        };

      return objMapping[lastMessage.type];
    }

    return conversationMode;
  };
const insertAdditionalInfoForAssistantMessage: TConversationRepositories["insertAdditionalInfoForAssistantMessage"] =
  (latestMessage) => {
    const additionalInfo: TGetAssistantMessageAfterSendOptions = {};

    switch (latestMessage.type) {
      case "deep_research": {
        additionalInfo.deepResearchInfo = { isRegenerate: true };
        break;
      }
      case "image_creation": {
        additionalInfo.imageCreationInfo = { isRegenerate: true };
        break;
      }
      case "realtime_search": {
        additionalInfo.realTimeSearchInfo = { isRegenerate: true };
        break;
      }
      default: {
        break;
      }
    }

    return additionalInfo;
  };

const getGuardValueFromConversationMode: TConversationRepositories["getGuardValueFromConversationMode"] =
  (conversationMode) => {
    const objMapping: Record<EConversationMode, keyof TChatFreeUsage> = {
      [EConversationMode.AI_ART]: "imageCreation",
      [EConversationMode.CHAT]: "chat",
      [EConversationMode.DEEP_RESEARCH]: "deepResearch",
      [EConversationMode.WEB_SEARCH]: "webSearch",
    };

    return objMapping[conversationMode] ?? "chat";
  };

const transformMessageForImageToImage: TConversationRepositories["transformMessageForImageToImage"] =
  (
    message,
    conversationId,
    imageIds,
    aiArtStyle,
    isRegenerate,
    model,
    sync,
    readSource
  ) =>
    new TransformerBuilder(ChatImageToImageDTO)
      .format(
        {
          conversationId,
          imageIds,
          isRegenerate,
          model,
          prompt: message.content,
          readSource,
          style: aiArtStyle,
          sync,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatImageToImageDTO;

const transformMessageForRegenerateImageToImage: TConversationRepositories["transformMessageForRegenerateImageToImage"] =
  (
    message,
    conversationId,
    imageUrls,
    aiArtStyle,
    isRegenerate,
    model,
    sync,
    readSource
  ) =>
    new TransformerBuilder(ChatRegenerateImageToImageDTO)
      .format(
        {
          conversationId,
          imageUrls,
          isRegenerate,
          model,
          prompt: message.content,
          readSource,
          style: aiArtStyle,
          sync,
        },
        {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        }
      )
      .toPlainSnakeCase() as ChatRegenerateImageToImageDTO;

const validateAIArtInput: TConversationRepositories["validateAIArtInput"] = (
  userInput,
  selectedFiles,
  selectedAIArt
): boolean => {
  // If no style is selected, user must provide input description
  if (selectedAIArt.value === EAIART_STYLE.NONE) {
    return isNotEmptyInput(userInput);
  }

  // If no files are uploaded, user must provide input description
  if (selectedFiles.length === 0) {
    return isNotEmptyInput(userInput);
  }

  // If both style and files are present, input is always valid
  return true;
};

const isModelImageToImage: TConversationRepositories["isModelImageToImage"] = (
  mode,
  model
) => {
  if (mode !== EConversationMode.AI_ART) {
    return false;
  }

  const imageToImageModels = [
    EAIValueModel.Banana_Pro,
    EAIValueModel.Banana,
    EAIValueModel.GPT_Image,
    EAIValueModel.GPT_Image_2,
  ];

  return imageToImageModels.includes(model);
};

// File Validation

const validateFilesForAIArt = (
  files: TSelectedFile[],
  selectedAIArt: TSelectedAIArt
): TValidationResult => {
  const isExistOtherFile = files.some(
    (file) => !checkImageFileType(file.fileName, file.mimeType)
  );
  const maxImageFallback =
    selectedAIArt.type === EAIART_TYPE.IMAGE_TO_IMAGE ? 1 : 0;
  const maxImages = selectedAIArt.maxImages || maxImageFallback;

  if (!maxImages) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.MODEL_NOT_ALLOW_IMAGES,
      isValid: false,
    };
  }

  if (isExistOtherFile) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.FEATURE_NOT_SUPPORT_FILES,
      isValid: false,
    };
  }

  if (files.length > maxImages) {
    return {
      errorKey:
        maxImages === 1
          ? FILE_VALIDATION_ERROR_KEY.SINGLE_IMAGE
          : FILE_VALIDATION_ERROR_KEY.REACH_MAX_IMAGES,
      errorParams: { maxImage: maxImages },
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
};

const validateFilesForNormalChat = (
  files: TSelectedFile[],
  maxFiles: number
): TValidationResult => {
  const imageFiles = files.filter((file) =>
    checkImageFileType(file.fileName, file.mimeType)
  );

  if (imageFiles.length > MAX_IMAGES_PER_UPLOAD) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.TOO_MANY_IMAGES,
      errorParams: { maxImage: MAX_IMAGES_PER_UPLOAD },
      isValid: false,
    };
  }

  if (files.length > maxFiles) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.TOO_MANY_FILES,
      errorParams: { maxFiles },
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
};

const validateFilesForDeepResearch = (
  files: TSelectedFile[]
): TValidationResult => {
  if (files.length > 0) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.FEATURE_NOT_SUPPORT_FILES,
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
};

const validateFilesForWebSearch = (
  files: TSelectedFile[]
): TValidationResult => {
  if (files.length > 0) {
    return {
      errorKey: FILE_VALIDATION_ERROR_KEY.FEATURE_NOT_SUPPORT_FILES,
      isValid: false,
    };
  }

  return {
    isValid: true,
  };
};

/**
 * Validate files for conversation upload
 * @returns true if files are valid, false otherwise
 */
const validateFilesForConversation: TConversationRepositories["validateFilesForConversation"] =
  ({ files, conversationMode, selectedAIArt, maxFiles = 0 }) => {
    if (conversationMode === EConversationMode.AI_ART) {
      return validateFilesForAIArt(files, selectedAIArt);
    }

    if (conversationMode === EConversationMode.DEEP_RESEARCH) {
      return validateFilesForDeepResearch(files);
    }

    if (conversationMode === EConversationMode.WEB_SEARCH) {
      return validateFilesForWebSearch(files);
    }

    return validateFilesForNormalChat(files, maxFiles);
  };

const isDisabledFileUpload: TConversationRepositories["isDisabledFileUpload"] =
  (mode) =>
    [EConversationMode.DEEP_RESEARCH, EConversationMode.WEB_SEARCH].includes(
      mode
    );

/**
 * Filters out error assistant messages and their corresponding user messages
 * @param messages - Array of messages to filter
 * @returns Filtered array with error assistant messages and their preceding user messages removed
 */
const filterErrorMessages = (messages: TMessageTemp[]): TMessageTemp[] => {
  // Find the last assistant message with error status
  const lastErrorAssistantIndex = messages.findLastIndex(
    (message) => message.role === "assistant" && message.status === "error"
  );

  // If no error assistant message found, return original messages
  if (lastErrorAssistantIndex === -1) {
    return messages;
  }

  // Filter out error assistant message and its corresponding user message
  return messages.filter((message, index) => {
    // Remove the error assistant message
    if (index === lastErrorAssistantIndex) {
      return false;
    }
    // Find and remove the user message right before the error assistant message
    if (index === lastErrorAssistantIndex - 1 && message.role === "user") {
      return false;
    }
    return true;
  });
};

export const conversationUseCases = (): TConversationRepositories => ({
  createTempMessage,
  createAssistantTempMessages: (
    input = DEFAULT_CREATE_ASSISTANT_TEMP_MESSAGES_INPUT
  ) => {
    const id = generateRandomUUIDV4();
    return {
      content: input.prompt,
      countToken: 0,
      createdAt: new Date().toISOString(),
      feedbackStatus: EMessageFeedbackStatus.UNSPECIFIED,
      files: [],
      id,
      messageId: "",
      models: input.models,
      role: "assistant",
      status: input.status,
      type: "chat",
      updatedAt: new Date().toISOString(),
    };
  },
  getItemsUntilLastUserRole,
  getTotalTokenByMessages,
  getLastUserMessage,
  getLastAssistantMessage,
  getLatestUserMessageForConversationMode,
  getLatestUserMessageWithType,
  getLatestAssistantMessageForConversationMode,
  getGuardValueFromConversationMode,
  getTypeOfUserMessage,
  getTypeOfAssistantMessage,
  getGuardValueFromMessage,
  getSourceAssistantMessage,
  trimOldMessagesByToken,
  shouldUpdateTitle,
  markLastAssistantMessageAsError,
  markLastAssistantMessageAsCancelled,
  updateAssistantTempMessage,
  updateFieldForAssistantMessage,
  transformMessageBeforeSend,
  filterEmptyContentMessage,
  injectBadgeLink,
  insertAdditionalInfoForAssistantMessage,

  // Deep Research
  detectConversationProcessing,
  preprocessContentMessages,
  processExportContent,
  getMessagesContextForDeepResearch,
  transformMessageForDeepResearch,
  generateReachedLimitTimeDeepResearch,

  // AI ART
  transformMessageForTextToImage,
  transformMessageForImageToImage,
  transformMessageForRegenerateImageToImage,
  validateAIArtInput,
  isModelImageToImage,

  // Web Search
  transformMessageForWebSearch,

  // File Validation
  isDisabledFileUpload,
  validateFilesForConversation,

  // Message Filtering
  filterErrorMessages,
});
