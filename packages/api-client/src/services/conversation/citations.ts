import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";

const CitationSchema = z.object({
  description: z.string(),
  imageUrl: z.string(),
  title: z.string(),
  url: z.string(),
});
const CitationsSchema = z.object({ data: z.array(CitationSchema) });

export interface CitationsInput {
  conversationId: string;
  messageId: string;
}

export const getCitationsConfig: EndpointConfig<
  CitationsInput,
  z.infer<typeof CitationsSchema>
> = {
  auth: "required",
  method: "GET",
  path: (input) =>
    `/users/web/conversations/${input.conversationId}/messages/${input.messageId}/citations`,
  responseSchema: CitationsSchema,
  version: "v1",
};

export const getCitationsV2Config: EndpointConfig<
  CitationsInput,
  z.infer<typeof CitationsSchema>
> = { ...getCitationsConfig, version: "v2" };
