import { defineService } from "../../endpoints/registry";
import { getCitationsConfig, getCitationsV2Config } from "./citations";
import {
  createConfig,
  createV2Config,
  deleteV2Config,
  getByIdConfig,
  getByIdV2Config,
  getInternalConfig,
  listConfig,
  listV2Config,
  pinConfig,
  renameConfig,
  renameV2Config,
  softDeleteConfig,
  unpinConfig,
} from "./crud";
import {
  getCustomResponsePromptsConfig,
  setCustomResponsePromptConfig,
} from "./custom-response";
import { getImagesConfig, getImagesV2Config } from "./images";
import {
  chatConfig,
  chatMultimediaConfig,
  checkLatestMessageConfig,
  createMessageConfig,
  getMessagesConfig,
  getMessagesV2Config,
  predictionConfig,
  regenerateMessageConfig,
} from "./messages";
import { getModelsConfig } from "./models";

/**
 * Conversation domain — `smith-engine` service (see docs/runbook/api-client.md
 * §16). Split by sub-domain across this folder so no single file mixes
 * unrelated concerns:
 *   - `crud.ts`            conversation create/list/get/rename/delete/pin
 *   - `messages.ts`        send/regenerate/predict + message pagination
 *   - `images.ts`          per-conversation generated images
 *   - `citations.ts`       per-message citations
 *   - `models.ts`          the AI model/provider catalog
 *   - `custom-response.ts` saved "custom response" prompt preference
 * This file is only the assembly manifest — it holds no schemas/logic of its
 * own, just wires each `*Config` object to its endpoint name. The
 * long-running chat/image/research operations (poll-based) live in the
 * sibling `research` service, not here.
 */
export const conversation = defineService("smith-engine")
  .endpoint("getInternal", getInternalConfig)
  .endpoint("create", createConfig)
  .endpoint("createV2", createV2Config)
  .endpoint("list", listConfig)
  .endpoint("listV2", listV2Config)
  .endpoint("getById", getByIdConfig)
  .endpoint("getByIdV2", getByIdV2Config)
  .endpoint("rename", renameConfig)
  .endpoint("renameV2", renameV2Config)
  .endpoint("softDelete", softDeleteConfig)
  .endpoint("deleteV2", deleteV2Config)
  .endpoint("pin", pinConfig)
  .endpoint("unpin", unpinConfig)
  .endpoint("getMessages", getMessagesConfig)
  .endpoint("getMessagesV2", getMessagesV2Config)
  .endpoint("chatMultimedia", chatMultimediaConfig)
  .endpoint("chat", chatConfig)
  .endpoint("regenerateMessage", regenerateMessageConfig)
  .endpoint("prediction", predictionConfig)
  .endpoint("checkLatestMessage", checkLatestMessageConfig)
  .endpoint("createMessage", createMessageConfig)
  .endpoint("getCitations", getCitationsConfig)
  .endpoint("getCitationsV2", getCitationsV2Config)
  .endpoint("getModels", getModelsConfig)
  .endpoint("getImages", getImagesConfig)
  .endpoint("getImagesV2", getImagesV2Config)
  .endpoint("getCustomResponsePrompts", getCustomResponsePromptsConfig)
  .endpoint("setCustomResponsePrompt", setCustomResponsePromptConfig);
