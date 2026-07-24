import { z } from "@cs/validation";

/**
 * Fields/enums that repeat across many chat/conversation/research endpoints
 * in `temp/` — centralized here instead of redeclared per domain file (see
 * docs/runbook/api-client.md §16 note on `read_source`/`sync`).
 */

export const ReadSourceSchema = z.enum([
  "READ_SOURCE_ENGINE",
  "READ_SOURCE_CONVERSATION_NEXUS",
]);

export const SyncAllowSchema = z.enum([
  "SYNC_ALLOW_UNSPECIFIED",
  "SYNC_ALLOW_REQUEST_AND_RESPONSE",
  "SYNC_ALLOW_RESPONSE_ONLY",
  "SYNC_ALLOW_NONE",
]);

export const SyncConversationMessageSchema = z.object({
  clientMessageId: z.string(),
  content: z.string(),
  conversationMessageId: z.string(),
  files: z.array(
    z.object({
      data: z.string(),
      filename: z.string(),
      mimeType: z.string(),
    })
  ),
  messageType: z.string(),
  role: z.enum(["user", "assistant", "developer"]),
});

export const SyncSchema = z.object({
  clientConvId: z.string(),
  conversationConvId: z.string(),
  conversationMessages: z.array(SyncConversationMessageSchema),
  syncAllow: SyncAllowSchema,
  useMemory: z.optional(z.boolean()),
});

export type Sync = z.infer<typeof SyncSchema>;

export const MessageContentPartSchema = z.object({
  imageUrl: z.optional(z.string()),
  text: z.optional(z.string()),
  type: z.enum(["text", "image"]),
});

export const AttachmentSchema = z.object({
  downloadUrl: z.string(),
  fileId: z.string(),
  mimeType: z.string(),
});

export const MessageContentSchema = z.object({
  attachments: z.optional(z.array(AttachmentSchema)),
  content: z.array(MessageContentPartSchema),
  id: z.string(),
  role: z.enum(["user", "assistant", "developer"]),
});

export type MessageContent = z.infer<typeof MessageContentSchema>;

/** AI provider enum (`provider` wire field) — see temp/models/model.ts. */
export const AIProviderSchema = z.enum([
  "openai",
  "deepseek",
  "grok",
  "gemini",
  "banana",
  "chatsmith",
  "get_img",
  "claude",
]);

/** AI model enum (`model`/`models` wire field) — see temp/models/model.ts. */
export const AIModelSchema = z.enum([
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-5-nano",
  "deepseek-reasoner",
  "grok",
  "gemini-1.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-1.5-pro",
  "gemini-2.5-flash-image",
  "gemini-3-pro-image-preview",
  "gpt-image-1",
  "gpt-image-1.5",
  "gpt-image-2",
  "claude-haiku-4-5",
  "chatsmith",
  "getimg",
  "",
]);

/** `type` on chat/regenerate/prediction responses. */
export const MessageTypeSchema = z.enum([
  "chat",
  "deep_research",
  "deep_research_analyze",
  "image_creation",
  "realtime_search",
]);

/** `type` on `TMessageDTO2` (persisted message) — distinct enum from MessageTypeSchema above, do not conflate. */
export const MessageTypeSyncSchema = z.enum([
  "text",
  "text_to_image",
  "image_to_text",
  "chat_with_file",
  "image_to_image",
  "task",
  "task_response",
  "assistant_writing",
  "real_time_search",
  "deep_research_conversation",
  "deep_research",
]);

export const TracingStatusSchema = z.enum([
  "done",
  "failed",
  "in_progress",
  "canceled",
]);

export const MessageFeedbackStatusSchema = z.enum([
  "FEEDBACK_STATUS_UNSPECIFIED",
  "FEEDBACK_STATUS_LIKE",
  "FEEDBACK_STATUS_DISLIKE",
]);

export const UseCaseSchema = z.enum([
  "USE_CASE_CHAT",
  "USE_CASE_UNSPECIFIED",
  "USE_CASE_ACADEMIC_WRITING",
  "USE_CASE_GRAMMAR",
]);

const CitationSchema = z.object({
  description: z.string(),
  imageUrl: z.string(),
  title: z.string(),
  url: z.string(),
});

const FileMetadataSchema = z.object({
  downloadUrl: z.string(),
  fileId: z.string(),
  fileMimeType: z.string(),
  fileName: z.string(),
  fileSize: z.number(),
});

const DeepResearchStepsSchema = z.object({
  analyzing: z.string(),
  done: z.string(),
  exploring: z.string(),
  researching: z.string(),
  thinking: z.string(),
});

const MessageMetadataSchema = z.nullable(
  z.object({
    citations: z.optional(z.array(CitationSchema)),
    files: z.optional(z.array(FileMetadataSchema)),
    imageStyle: z.optional(z.string()),
    processingTime: z.optional(z.string()),
    steps: z.optional(DeepResearchStepsSchema),
  })
);

/**
 * `TMessageDTO2` — the persisted-message shape returned by every
 * list/detail/tracing endpoint (see docs/runbook/api-client.md §16).
 */
export const PersistedMessageSchema = z.object({
  contextJson: z.optional(
    z.object({
      schemaVersion: z.number(),
      textToImage: z.object({
        generationPrompt: z.string(),
        negativePrompt: z.string(),
      }),
    })
  ),
  createdAt: z.string(),
  feedbackStatus: MessageFeedbackStatusSchema,
  messages: MessageContentSchema,
  metadata: MessageMetadataSchema,
  models: AIModelSchema,
  provider: AIProviderSchema,
  refId: z.string(),
  status: z.string(),
  type: MessageTypeSyncSchema,
  updatedAt: z.string(),
});

export type PersistedMessage = z.infer<typeof PersistedMessageSchema>;

/** Shared shape for every `.../tracing` and generic process-poll response. */
export const TracingResponseSchema = z.object({
  data: z.nullable(PersistedMessageSchema),
  failedReason: z.string(),
  status: TracingStatusSchema,
});

/** Shared shape for the `/chat`, `/chat-multimedia`, `/regenerate-message`, `/prediction` responses. */
export const ChatCompletionResponseSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string(),
        name: z.optional(z.string()),
        role: z.string(),
      }),
    })
  ),
  created: z.number(),
  error: z.null(),
  id: z.string(),
  model: z.string(),
  type: MessageTypeSchema,
});
