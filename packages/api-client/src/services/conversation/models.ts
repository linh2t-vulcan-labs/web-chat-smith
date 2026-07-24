import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { AIModelSchema, AIProviderSchema } from "../shared/common";

// Wire shape (confirmed against apps/super-app/src/core/models/model.ts) uses
// backend-chosen names the generic camelCase conversion can't fix by itself:
// `model`->`value`, `status` (string enum)->`isActive` (boolean), and
// `chat_vision`->`isAllowChatVision` (already camelCased to `chatVision` by
// the time this schema runs) — so these need an explicit remap, not a plain
// object schema.
const AIModelItemSchema = z.pipe(
  z.object({
    availableRoles: z.array(z.string()),
    badge: z.nullable(
      z.object({ color: z.string(), text: z.string(), variant: z.string() })
    ),
    chatVision: z.optional(z.boolean()),
    description: z.string(),
    logo: z.string(),
    model: AIModelSchema,
    provider: z.string(),
    status: z.string(),
    title: z.string(),
  }),
  z.transform(({ model, status, chatVision, ...rest }) => ({
    ...rest,
    isActive: status === "MODEL_STATUS_ACTIVE",
    isAllowChatVision: chatVision ?? false,
    value: model,
  }))
);

const ModelsSchema = z.object({
  providers: z.array(
    z.pipe(
      z.object({
        models: z.array(AIModelItemSchema),
        name: AIProviderSchema,
        title: z.string(),
      }),
      z.transform(({ name, ...rest }) => ({ ...rest, value: name }))
    )
  ),
});

export const getModelsConfig: EndpointConfig<
  undefined,
  z.infer<typeof ModelsSchema>
> = {
  auth: "required",
  method: "GET",
  path: "/users/web/models",
  responseSchema: ModelsSchema,
  version: "v2",
};
