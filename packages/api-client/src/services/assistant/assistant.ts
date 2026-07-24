import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const AssistantsListSchema = z.object({
  assistants: z.array(z.object({ id: z.string(), name: z.string() })),
  nextPageToken: z.string(),
});

/**
 * Assistant Writing is NOT a separate backend concept — it's a conversation
 * with `useCase: "USE_CASE_ACADEMIC_WRITING"` (see docs/runbook/api-client.md
 * §16). Creating/reading/chatting in an assistant-writing conversation reuses
 * `services/conversation/` verbatim:
 *   - create:      `conversation.create({ useCase: "USE_CASE_ACADEMIC_WRITING" })`
 *                   or `conversation.createV2(...)` for the v2 variant
 *   - messages:    `conversation.getMessages({ id, limit: 100, nextId: 0, sort: "SORT_ASC" })`
 *                   or `conversation.getMessagesV2({ id, limit: 50, prevCursor: "" })`
 *                   (v2 wire order is newest-first — reverse `data` for oldest-first display)
 *   - chat:        `conversation.chat({ id, ... })`
 * The only endpoint unique to this domain is the assistants catalog below.
 */
export const assistant = defineService("smith-engine").endpoint("list", {
  auth: "required",
  method: "GET",
  path: "/users/web/assistants",
  responseSchema: AssistantsListSchema,
  toQuery: (input: { pageSize: number; pageToken?: string }) => input,
  version: "v1",
});
