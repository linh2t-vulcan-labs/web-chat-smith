import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { EmptyResponseSchema, remapValue, toPageQuery } from "./constants";
import type { PageInput } from "./constants";

const MESSAGE_ROLE_MAP: Record<string, string> = {
  MESSAGE_ROLE_ASSISTANT: "assistant",
  MESSAGE_ROLE_USER: "user",
};

const MESSAGE_STATUS_MAP: Record<string, string> = {
  MESSAGE_STATUS_CANCELLED: "cancelled",
  MESSAGE_STATUS_DONE: "done",
  MESSAGE_STATUS_FAILED: "failed",
  MESSAGE_STATUS_PENDING: "pending",
  MESSAGE_STATUS_PROCESSING: "processing",
};

const DirectionSchema = z.object({
  brandName: z.optional(z.string()),
  colorTone: z.string(),
  coreConcept: z.string(),
  id: z.string(),
  industry: z.optional(z.string()),
  layout: z.string(),
  style: z.string(),
  title: z.string(),
  typography: z.array(z.string()),
  visualStyle: z.string(),
});

const MaskSchema = z.object({
  height: z.number(),
  width: z.number(),
  x: z.number(),
  y: z.number(),
});

// Merges the legacy union of user-message / assistant-message metadata DTOs
// into one optional-field shape (matches SuiteCreativeMessageMetadataModel) —
// pending narrower confirmation per-role from backend.
const MessageMetadataSchema = z.object({
  analysis: z.optional(z.unknown()),
  attachedImageUrls: z.optional(z.array(z.string())),
  directionHint: z.optional(z.nullable(z.string())),
  displayImagesUrls: z.optional(z.array(z.string())),
  failedReason: z.optional(z.string()),
  generatedImageUrls: z.optional(z.array(z.string())),
  intention: z.optional(z.string()),
  mask: z.optional(MaskSchema),
  options: z.optional(z.array(DirectionSchema)),
  targetImageId: z.optional(z.nullable(z.string())),
  targetImageUrl: z.optional(z.string()),
  templateId: z.optional(z.nullable(z.string())),
  templateImageUrl: z.optional(z.string()),
});

const MessageSchema = z.pipe(
  z.object({
    content: z.string(),
    createdAt: z.string(),
    id: z.string(),
    lastEventId: z.optional(z.string()),
    metadata: z.optional(MessageMetadataSchema),
    projectId: z.string(),
    role: z.string(),
    status: z.string(),
  }),
  z.transform((raw) => ({
    ...raw,
    role: remapValue(MESSAGE_ROLE_MAP, raw.role),
    status: remapValue(MESSAGE_STATUS_MAP, raw.status),
  }))
);

export type Message = z.infer<typeof MessageSchema>;

const SuggestionItemSchema = z.object({
  modeHint: z.string(),
  text: z.string(),
});

export const postMessageConfig: EndpointConfig<
  {
    projectId: string;
    content: string;
    modeHint?: "create" | "edit" | "upscale" | "variation" | "inpaint";
    referenceUploadIds?: string[];
    displayImageIds?: string[];
    targetImageId?: string | null;
    directionHint?: string | null;
    templateId?: string | null;
    mask?: z.infer<typeof MaskSchema>;
  },
  { messageId: string; userMessage: Message }
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/projects/${input.projectId}/messages`,
  responseSchema: z.object({
    messageId: z.string(),
    userMessage: MessageSchema,
  }),
  retry: false,
  toBody: (input) => ({
    content: input.content,
    directionHint: input.directionHint,
    displayImageIds: input.displayImageIds,
    mask: input.mask,
    modeHint: input.modeHint,
    referenceUploadIds: input.referenceUploadIds,
    targetImageId: input.targetImageId,
    templateId: input.templateId,
  }),
};

export const getMessageHistoryConfig: EndpointConfig<
  { projectId: string } & PageInput,
  { messages: Message[]; nextPageToken: string | null }
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/projects/${input.projectId}/messages/history`,
  responseSchema: z.object({
    messages: z.array(MessageSchema),
    nextPageToken: z.nullable(z.string()),
  }),
  toQuery: (input) => toPageQuery(input),
};

export const getMessageSuggestionsConfig: EndpointConfig<
  { projectId: string; messageId: string },
  { items: z.infer<typeof SuggestionItemSchema>[] }
> = {
  auth: "required",
  method: "GET",
  path: (input) =>
    `/projects/${input.projectId}/messages/${input.messageId}/suggestions`,
  responseSchema: z.object({ items: z.array(SuggestionItemSchema) }),
};

export const deleteMessageConfig: EndpointConfig<
  { projectId: string; messageId: string },
  Record<string, never>
> = {
  auth: "required",
  method: "DELETE",
  path: (input) => `/projects/${input.projectId}/messages/${input.messageId}`,
  responseSchema: EmptyResponseSchema,
  retry: false,
};
