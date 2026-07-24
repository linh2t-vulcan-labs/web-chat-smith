import { defineService } from "../../endpoints/registry";
import { DESIGN_STUDIO_PATH_PREFIX, DESIGN_STUDIO_SERVICE } from "./constants";
import { getCreateLogoStructureConfig, getHomeSuggestionsConfig } from "./home";
import { exportImageConfig, listImagesConfig } from "./images";
import {
  deleteMessageConfig,
  getMessageHistoryConfig,
  getMessageSuggestionsConfig,
  postMessageConfig,
} from "./messages";
import {
  createProjectConfig,
  deleteProjectConfig,
  getProjectConfig,
  listProjectsConfig,
  renameProjectConfig,
} from "./projects";
import { getQuotaConfig } from "./quota";
import { listTemplatesConfig } from "./templates";
import {
  completeUploadConfig,
  createUploadConfig,
  getUploadConfig,
  listUploadsConfig,
} from "./uploads";

/**
 * "Creative Studio" (design-studio) domain — split by sub-domain across this
 * folder so no single file mixes unrelated concerns:
 *   - `projects.ts`   project create/list/get/rename/delete
 *   - `uploads.ts`    presigned uploads (reference/mask images)
 *   - `images.ts`     generated images + export
 *   - `templates.ts`  public template catalog
 *   - `quota.ts`      daily generation quota
 *   - `messages.ts`   send/history/suggestions/delete for one project
 *   - `home.ts`        unconfirmed home-screen endpoints (see file comment)
 *   - `stream.ts`      the SSE feed for one generation turn — NOT part of
 *                       this `defineService()` chain (its response isn't
 *                       JSON), imported directly from `./stream` instead.
 * This file is only the assembly manifest — it holds no schemas/logic of its
 * own, just wires each `*Config` object to its endpoint name.
 */
export const designStudio = defineService(DESIGN_STUDIO_SERVICE, {
  pathPrefix: DESIGN_STUDIO_PATH_PREFIX,
})
  .endpoint("createProject", createProjectConfig)
  .endpoint("listProjects", listProjectsConfig)
  .endpoint("getProject", getProjectConfig)
  .endpoint("renameProject", renameProjectConfig)
  .endpoint("deleteProject", deleteProjectConfig)
  .endpoint("createUpload", createUploadConfig)
  .endpoint("completeUpload", completeUploadConfig)
  .endpoint("getUpload", getUploadConfig)
  .endpoint("listUploads", listUploadsConfig)
  .endpoint("listImages", listImagesConfig)
  .endpoint("exportImage", exportImageConfig)
  .endpoint("listTemplates", listTemplatesConfig)
  .endpoint("getQuota", getQuotaConfig)
  .endpoint("postMessage", postMessageConfig)
  .endpoint("getMessageHistory", getMessageHistoryConfig)
  .endpoint("getMessageSuggestions", getMessageSuggestionsConfig)
  .endpoint("deleteMessage", deleteMessageConfig)
  .endpoint("getHomeSuggestions", getHomeSuggestionsConfig)
  .endpoint("getCreateLogoStructure", getCreateLogoStructureConfig);

export {
  DESIGN_STUDIO_STREAM_EVENT,
  DESIGN_STUDIO_STREAM_TERMINAL_EVENTS,
  openMessageStream,
} from "./stream";
export type {
  DesignStudioStreamEventName,
  OpenMessageStreamHandlers,
  OpenMessageStreamInput,
  SseEvent,
} from "./stream";
