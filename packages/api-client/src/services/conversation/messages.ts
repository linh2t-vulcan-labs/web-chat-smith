import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { unwrapEnvelope } from "../../utils/envelope";
import {
  ChatCompletionResponseSchema,
  PersistedMessageSchema,
} from "../shared/common";
import type {
  MessageContentSchema,
  ReadSourceSchema,
  SyncSchema,
  AIModelSchema,
  AIProviderSchema,
} from "../shared/common";

const MessagesV1Schema = z.object({
  data: z.array(PersistedMessageSchema),
  nextId: z.string(),
});
const MessagesV2Schema = z.object({
  data: z.array(PersistedMessageSchema),
  hasMore: z.boolean(),
  nextCursor: z.string(),
  prevCursor: z.string(),
});

const CheckLatestMessageSchema = unwrapEnvelope(
  "data",
  z.object({ isLatest: z.boolean() })
);

export interface ChatBodyInput {
  messages: z.infer<typeof MessageContentSchema>[];
  model: z.infer<typeof AIModelSchema>;
  provider: z.infer<typeof AIProviderSchema>;
  readSource: z.infer<typeof ReadSourceSchema>;
  sync?: z.infer<typeof SyncSchema>;
  customResponsePromptType?: string;
}

const toChatBody = (input: ChatBodyInput) => ({
  messages: input.messages,
  model: input.model,
  n: "1",
  nsfwCheck: true,
  provider: input.provider,
  readSource: input.readSource,
  ...(input.sync ? { sync: input.sync } : {}),
  ...(input.customResponsePromptType
    ? { customResponsePromptType: input.customResponsePromptType }
    : {}),
});

export const getMessagesConfig: EndpointConfig<
  {
    id: string;
    limit: number;
    nextId?: number | string;
    sort?: "SORT_ASC" | "SORT_DESC";
  },
  z.infer<typeof MessagesV1Schema>
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/users/web/conversations/${input.id}/messages`,
  responseSchema: MessagesV1Schema,
  toQuery: (input) => ({
    limit: input.limit,
    nextId: input.nextId,
    sort: input.sort,
  }),
  version: "v1",
};

export const getMessagesV2Config: EndpointConfig<
  { id: string; limit: number; prevCursor?: number | string },
  z.infer<typeof MessagesV2Schema>
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/users/web/conversations/${input.id}/messages`,
  responseSchema: MessagesV2Schema,
  // Wire response is newest-first for v2 (unlike v1's SORT_ASC) — reverse `data` at the call site if oldest-first order is needed.
  toQuery: (input) => ({
    limit: input.limit,
    prevCursor: input.prevCursor,
  }),
  version: "v2",
};

export const chatMultimediaConfig: EndpointConfig<
  { id: string } & ChatBodyInput,
  z.infer<typeof ChatCompletionResponseSchema>
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/users/web/conversations/${input.id}/chat-multimedia`,
  responseSchema: ChatCompletionResponseSchema,
  retry: false,
  toBody: (input) => toChatBody(input),
  version: "v1",
};

export const chatConfig: EndpointConfig<
  { id: string } & ChatBodyInput,
  z.infer<typeof ChatCompletionResponseSchema>
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/users/web/conversations/${input.id}/chat`,
  responseSchema: ChatCompletionResponseSchema,
  retry: false,
  toBody: (input) => toChatBody(input),
  version: "v2",
};

export const regenerateMessageConfig: EndpointConfig<
  { id: string } & ChatBodyInput,
  z.infer<typeof ChatCompletionResponseSchema>
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/users/web/conversations/${input.id}/regenerate-message`,
  responseSchema: ChatCompletionResponseSchema,
  retry: false,
  // Confirmed against apps/super-app/src/core/repositories/converations-service.ts
  // (createRegenerateMessage): unlike chat/chatMultimedia, this body also
  // carries `multimedia`, derived from whether any message has attachments.
  toBody: (input) => ({
    ...toChatBody(input),
    multimedia: input.messages.some(
      (message) => (message.attachments?.length ?? 0) > 0
    ),
  }),
  version: "v2",
};

export const predictionConfig: EndpointConfig<
  {
    messages: z.infer<typeof MessageContentSchema>[];
    model: z.infer<typeof AIModelSchema>;
    provider: z.infer<typeof AIProviderSchema>;
    nsfwCheck: boolean;
  },
  z.infer<typeof ChatCompletionResponseSchema>
> = {
  auth: "required",
  method: "POST",
  path: "/users/web/prediction",
  responseSchema: ChatCompletionResponseSchema,
  retry: false,
  toBody: (input) => ({ ...input, n: 1 }),
  version: "v1",
};

export const checkLatestMessageConfig: EndpointConfig<
  { id: string; message: string },
  z.infer<typeof CheckLatestMessageSchema>
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/users/web/conversations/${input.id}/messages/check-latest`,
  responseSchema: CheckLatestMessageSchema,
  toBody: (input) => ({ message: input.message }),
  version: "v1",
};

export const createMessageConfig: EndpointConfig<
  { id: string } & Record<string, unknown>,
  unknown
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/users/web/conversations/${input.id}/messages`,
  retry: false,
  toBody: (input) => input,
  version: "v1",
};
