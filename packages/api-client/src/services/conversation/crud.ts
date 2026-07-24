import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { unwrapEnvelope } from "../../utils/envelope";
import {
  AIModelSchema,
  AIProviderSchema,
  UseCaseSchema,
} from "../shared/common";

/**
 * `TConversationDTO` — see docs/runbook/api-client.md §16 (Conversation/Chat).
 * A few fields (`userId`/`conversationConvId`/`platform`/`longPollingProcess`)
 * are read by the legacy client but aren't in the documented DTO type, so
 * they're modeled optional here pending confirmation.
 */
const ConversationSchema = z.object({
  conversationConvId: z.optional(z.string()),
  createdAt: z.string(),
  isMigrated: z.optional(z.boolean()),
  lastActiveAt: z.optional(z.string()),
  lastMessage: z.optional(z.string()),
  lastModel: z.optional(AIModelSchema),
  lastProvider: z.optional(AIProviderSchema),
  longPollingProcess: z.optional(
    z.object({ processId: z.string(), status: z.string(), type: z.string() })
  ),
  name: z.string(),
  pinned: z.optional(z.boolean()),
  pinnedAt: z.optional(z.string()),
  platform: z.optional(z.string()),
  refId: z.string(),
  updatedAt: z.string(),
  useCase: UseCaseSchema,
  userId: z.optional(z.string()),
});

const CreateConversationInput = z.object({ useCase: UseCaseSchema });

// Confirmed against apps/super-app/src/core/repositories/converations-service.ts:
// `enabledFlattenData: true` on getInternalConversationInfo/createConversationId(V2)/
// getConversationById(V2)/updateConversationPin(Un)pinById means the backend
// wraps a single-object response in `{ data: ... }` — unwrapped here (see
// utils/envelope.ts) so callers get the conversation/pin-state object directly.
const withDataEnvelope = <TSchema extends z.core.$ZodType>(schema: TSchema) =>
  unwrapEnvelope("data", schema);

const ConversationListV1Schema = z.object({
  data: z.array(ConversationSchema),
  nextPageToken: z.string(),
  version: z.string(),
});

const ConversationListV2Schema = z.object({
  data: z.array(ConversationSchema),
  hasMore: z.boolean(),
  nextCursor: z.string(),
  prevCursor: z.string(),
});

const DeleteConversationSchema = z.object({
  name: z.string(),
  status: z.enum(["inactive", "active"]),
});

const RenameConversationSchema = z.object({
  name: z.string(),
  status: z.string(),
});

const PinConversationSchema = z.object({
  pinned: z.boolean(),
  pinnedAt: z.string(),
});
const UnpinConversationSchema = z.object({ pinned: z.boolean() });

export type Conversation = z.infer<typeof ConversationSchema>;

export const getInternalConfig: EndpointConfig<
  { id: string; userId: string },
  Conversation
> = {
  // Legacy's `enabledAuth: false` was a dead flag (never read by the old
  // axios interceptor, which always attached the token when one existed)
  // — confirmed directly with backend (2026-07-21) that this route does
  // require auth.
  auth: "required",
  method: "GET",
  path: (input) => `/internal/web/conversations/${input.id}`,
  responseSchema: withDataEnvelope(ConversationSchema),
  toQuery: (input) => ({ userId: input.userId }),
  version: "v1",
};

export const createConfig: EndpointConfig<
  z.infer<typeof CreateConversationInput>,
  Conversation
> = {
  auth: "required",
  method: "POST",
  path: "/users/web/conversations",
  responseSchema: withDataEnvelope(ConversationSchema),
  retry: false,
  toBody: (input) => CreateConversationInput.parse(input),
  version: "v1",
};

export const createV2Config: EndpointConfig<
  z.infer<typeof CreateConversationInput>,
  Conversation
> = { ...createConfig, version: "v2" };

export const listConfig: EndpointConfig<
  { pageToken?: number | string; limit: number; useCase?: string },
  z.infer<typeof ConversationListV1Schema>
> = {
  auth: "required",
  method: "GET",
  path: "/users/web/conversations",
  responseSchema: ConversationListV1Schema,
  toQuery: (input) => input,
  version: "v1",
};

export const listV2Config: EndpointConfig<
  { nextCursor?: number | string; limit: number },
  z.infer<typeof ConversationListV2Schema>
> = {
  auth: "required",
  method: "GET",
  path: "/users/web/conversations",
  responseSchema: ConversationListV2Schema,
  toQuery: (input) => input,
  version: "v2",
};

export const getByIdConfig: EndpointConfig<{ id: string }, Conversation> = {
  auth: "required",
  method: "GET",
  path: (input) => `/users/web/conversations/${input.id}`,
  responseSchema: withDataEnvelope(ConversationSchema),
  version: "v1",
};

export const getByIdV2Config: EndpointConfig<{ id: string }, Conversation> = {
  ...getByIdConfig,
  version: "v2",
};

export const renameConfig: EndpointConfig<
  { id: string; name: string },
  z.infer<typeof RenameConversationSchema>
> = {
  auth: "required",
  method: "PUT",
  path: (input) => `/users/web/conversations/${input.id}`,
  responseSchema: RenameConversationSchema,
  toBody: (input) => ({ name: input.name }),
  version: "v1",
};

export const renameV2Config: EndpointConfig<
  { id: string; title: string },
  z.infer<typeof RenameConversationSchema>
> = {
  auth: "required",
  method: "PATCH",
  path: (input) => `/users/web/conversations/${input.id}`,
  responseSchema: RenameConversationSchema,
  toBody: (input) => ({ title: input.title }),
  version: "v2",
};

export const softDeleteConfig: EndpointConfig<
  { id: string },
  z.infer<typeof DeleteConversationSchema>
> = {
  auth: "required",
  method: "PUT",
  path: (input) => `/users/web/conversations/${input.id}`,
  responseSchema: DeleteConversationSchema,
  retry: false,
  toBody: () => ({ status: "STATUS_INACTIVE" }),
  version: "v1",
};

export const deleteV2Config: EndpointConfig<
  { id: string },
  z.infer<typeof DeleteConversationSchema>
> = {
  // `version: "v1"` here is not a copy-paste miss — confirmed against
  // apps/super-app/src/core/repositories/converations-service.ts:
  // despite the "V2" name (distinguishing hard delete from `softDelete`
  // above), this DELETE only ever existed at the v1 path; there is no
  // actual v2 delete endpoint.
  auth: "required",
  method: "DELETE",
  path: (input) => `/users/web/conversations/${input.id}`,
  responseSchema: DeleteConversationSchema,
  retry: false,
  version: "v1",
};

export const pinConfig: EndpointConfig<
  { id: string },
  z.infer<typeof PinConversationSchema>
> = {
  auth: "required",
  method: "PUT",
  path: (input) => `/users/web/conversations/${input.id}/pin`,
  responseSchema: withDataEnvelope(PinConversationSchema),
  version: "v1",
};

export const unpinConfig: EndpointConfig<
  { id: string },
  z.infer<typeof UnpinConversationSchema>
> = {
  auth: "required",
  method: "PUT",
  path: (input) => `/users/web/conversations/${input.id}/unpin`,
  responseSchema: withDataEnvelope(UnpinConversationSchema),
  version: "v1",
};
