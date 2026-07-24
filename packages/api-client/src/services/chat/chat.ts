import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const ChatMessageSchema = z.object({ content: z.string(), role: z.string() });

/**
 * `createMessage` — the one endpoint that hits base URL constant
 * `CS_PUBLIC_CHAT_SERVICE_URL` (service segment `chat`), not `smith-engine`
 * like the rest of the conversation domain (see docs/runbook/api-client.md §16).
 * Response uses a capitalized `Message` key inside `choices`, inconsistent
 * with every other chat-completion response in this codebase — preserved as-is.
 */
export const chat = defineService("chat").endpoint("createMessage", {
  auth: "required",
  method: "POST",
  path: "/chat",
  responseSchema: z.object({
    choices: z.array(z.object({ Message: ChatMessageSchema })),
    created: z.string(),
    id: z.string(),
    model: z.string(),
  }),
  retry: false,
  toBody: (input: {
    messages: z.infer<typeof ChatMessageSchema>[];
    model: string;
  }) => input,
  version: "v7",
});
