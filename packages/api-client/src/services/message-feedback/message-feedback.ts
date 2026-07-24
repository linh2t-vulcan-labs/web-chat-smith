import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";
import type { ReadSourceSchema } from "../shared/common";
import { MessageFeedbackStatusSchema } from "../shared/common";

const FeedbackResponseSchema = z.object({
  detail: z.string(),
  reason: z.array(z.string()),
  status: MessageFeedbackStatusSchema,
});

interface CreateFeedbackInput {
  conversationId: string;
  messageId: string;
  status: z.infer<typeof MessageFeedbackStatusSchema>;
  reason?: string[];
  detail?: string;
  readSource?: z.infer<typeof ReadSourceSchema>;
}

const toFeedbackBody = (input: CreateFeedbackInput) => ({
  detail: input.detail,
  readSource: input.readSource,
  reason: input.reason,
  status: input.status,
});

/** Message Feedback domain, on the `smith-engine` service (confirmed by reading `temp/repositories/message-feedback.ts` directly). */
export const messageFeedback = defineService("smith-engine")
  .endpoint("create", {
    auth: "required",
    method: "POST",
    path: (input: CreateFeedbackInput) =>
      `/users/web/conversations/${input.conversationId}/messages/${input.messageId}/feedback`,
    responseSchema: FeedbackResponseSchema,
    retry: false,
    // Confirmed against apps/super-app/src/core/repositories/message-feedback.ts:
    // this endpoint's DTO has no `@Expose({name})` overrides, so the legacy
    // client sends the body as-is (camelCase `readSource`), unlike every
    // other endpoint in this codebase.
    skipBodyCaseConversion: true,
    toBody: toFeedbackBody,
    version: "v1",
  })
  .endpoint("createV2", {
    auth: "required",
    method: "POST",
    path: (input: CreateFeedbackInput) =>
      `/users/web/conversations/${input.conversationId}/messages/${input.messageId}/feedback`,
    responseSchema: FeedbackResponseSchema,
    retry: false,
    skipBodyCaseConversion: true,
    toBody: toFeedbackBody,
    version: "v2",
  });
