import type {
  FreeUsageResetModel,
  TChatFreeUsage,
  TFreeUsageReset,
} from "@/core/models/usage";
import type { FreeUsageCountModel } from "@/core/models/user";

import {
  defaultChatFreeUsage,
  defaultFreeUsageResetInfo,
} from "../constants/user";

export const transformFreeUsageCount = (
  entity: FreeUsageCountModel[]
): TChatFreeUsage => {
  const acc = defaultChatFreeUsage;
  for (const item of entity) {
    switch (item.usecase) {
      case "chat": {
        acc.chat = item.remainingCount;
        break;
      }
      case "assistant": {
        acc.assistant = item.remainingCount;
        break;
      }
      case "file": {
        acc.file = item.remainingCount;
        break;
      }
      case "deep_research": {
        acc.deepResearch = item.remainingCount;
        break;
      }
      case "image_creation": {
        acc.imageCreation = item.remainingCount;
        break;
      }
      case "realtime_search": {
        acc.webSearch = item.remainingCount;
        break;
      }
      default: {
        break;
      }
    }
  }
  return acc;
};

export const transformFreeUsageReset = (
  entity: FreeUsageResetModel[]
): TFreeUsageReset => {
  const acc = defaultFreeUsageResetInfo;
  for (const item of entity) {
    switch (item.usecase) {
      case "chat": {
        acc.chat = item;
        break;
      }
      case "assistant": {
        acc.assistant = item;
        break;
      }
      case "file": {
        acc.file = item;
        break;
      }
      case "deep_research": {
        acc.deepResearch = item;
        break;
      }
      case "image_creation": {
        acc.imageCreation = item;
        break;
      }
      case "realtime_search": {
        acc.webSearch = item;
        break;
      }
      default: {
        break;
      }
    }
  }
  return acc;
};
