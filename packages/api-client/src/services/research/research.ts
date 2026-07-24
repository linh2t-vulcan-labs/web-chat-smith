import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";
import { unwrapEnvelope } from "../../utils/envelope";
import type { ReadSourceSchema, SyncSchema } from "../shared/common";
import {
  PersistedMessageSchema,
  TracingResponseSchema,
  TracingStatusSchema,
} from "../shared/common";

const StopTaskTypeSchema = z.enum([
  "PROCESS_TYPE_UNSPECIFIED",
  "PROCESS_TYPE_IMAGE_GENERATION",
  "PROCESS_TYPE_REAL_TIME_SEARCH",
  "PROCESS_TYPE_DEEP_RESEARCH",
]);

const DeepResearchChatSchema = z.object({
  processId: z.string(),
  responseMessage: z.nullable(PersistedMessageSchema),
  status: TracingStatusSchema,
});

const ProcessIdResponseSchema = z.object({ processId: z.string() });
const TextToImageResponseSchema = unwrapEnvelope(
  "data",
  z.nullable(PersistedMessageSchema)
);
const WebSearchResponseSchema = unwrapEnvelope(
  "data",
  z.object({ processId: z.string() })
);

/**
 * Long-running operations: chat/image/deep-research/web-search all issue a
 * `process_id` then poll — `temp/` confirms there is no real SSE today (see
 * docs/runbook/api-client.md §2/§10). Pair these with `useProcess({transport: "poll"})`.
 * All endpoints target the `smith-engine` service.
 */
export const research = defineService("smith-engine")
  .endpoint("deepResearchChat", {
    auth: "required",
    method: "POST",
    path: "/users/web/research/chat",
    responseSchema: DeepResearchChatSchema,
    retry: false,
    toBody: (input: {
      prompt: string;
      conversationId: string;
      regenerateMessage: boolean;
      messages: {
        role: string;
        content: { type: string; text: string; imageUrl?: { url: string } }[];
        type: string;
      }[];
      sync: z.infer<typeof SyncSchema>;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v2",
  })
  .endpoint("deepResearchTracing", {
    auth: "required",
    method: "POST",
    path: "/users/web/research/tracing",
    responseSchema: TracingResponseSchema,
    toBody: (input: {
      processId: string;
      conversationId: string;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v1",
  })
  .endpoint("textToImage", {
    auth: "required",
    method: "POST",
    path: "/users/web/images/text-to-image",
    responseSchema: TextToImageResponseSchema,
    retry: false,
    toBody: (input: {
      prompt: string;
      conversationId: string;
      regenerateMessage: boolean;
      style: string;
      model: string;
      sync: z.infer<typeof SyncSchema>;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v1",
  })
  .endpoint("imageToImage", {
    auth: "required",
    method: "POST",
    path: "/users/web/images/image-to-image",
    responseSchema: ProcessIdResponseSchema,
    retry: false,
    toBody: (input: {
      prompt: string;
      conversationId: string;
      regenerateMessage: boolean;
      style: string;
      imageIds: string[];
      model: string;
      sync: z.infer<typeof SyncSchema>;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v3",
  })
  .endpoint("regenerateImageToImage", {
    auth: "required",
    method: "POST",
    path: "/users/web/images/regenerate/image-to-image",
    responseSchema: ProcessIdResponseSchema,
    retry: false,
    toBody: (input: {
      prompt: string;
      conversationId: string;
      regenerateMessage: boolean;
      style: string;
      imageUrls: string[];
      model: string;
      sync: z.infer<typeof SyncSchema>;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v1",
  })
  .endpoint("imageTracing", {
    auth: "required",
    method: "POST",
    path: "/users/web/images/tracing",
    responseSchema: TracingResponseSchema,
    toBody: (input: {
      processId: string;
      conversationId: string;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v1",
  })
  .endpoint("webSearch", {
    auth: "required",
    method: "POST",
    path: "/users/web/search/real-time",
    responseSchema: WebSearchResponseSchema,
    retry: false,
    toBody: (input: {
      prompt: string;
      conversationId: string;
      regenerateMessage: boolean;
      sync: z.infer<typeof SyncSchema>;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v2",
  })
  .endpoint("pollProcess", {
    auth: "required",
    method: "GET",
    path: (input: {
      conversationId: string;
      processId: string;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) =>
      `/users/conversations/${input.conversationId}/processes/${input.processId}`,
    responseSchema: TracingResponseSchema,
    toQuery: (input: {
      conversationId: string;
      processId: string;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => ({
      readSource: input.readSource,
    }),
    version: "v1",
  })
  .endpoint("stopTask", {
    auth: "required",
    method: "POST",
    path: "/users/web/stop",
    responseSchema: z.object({ version: z.string() }),
    retry: false,
    toBody: (input: {
      processId: string;
      type: z.infer<typeof StopTaskTypeSchema>;
      conversationId: string;
      readSource: z.infer<typeof ReadSourceSchema>;
    }) => input,
    version: "v1",
  });
