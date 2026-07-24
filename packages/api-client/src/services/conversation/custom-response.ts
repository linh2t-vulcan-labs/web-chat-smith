import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";

const CustomResponsePromptsSchema = z.object({
  currentChoicePromptType: z.string(),
  prompts: z.array(
    z.object({
      description: z.string(),
      icon: z.string(),
      id: z.string(),
      preview: z.string(),
      title: z.optional(z.string()),
      type: z.string(),
    })
  ),
});

export const getCustomResponsePromptsConfig: EndpointConfig<
  undefined,
  z.infer<typeof CustomResponsePromptsSchema>
> = {
  auth: "required",
  method: "GET",
  path: "/users/chat/custom-response/prompts",
  responseSchema: CustomResponsePromptsSchema,
  version: "v1",
};

export const setCustomResponsePromptConfig: EndpointConfig<
  { customResponsePromptType: string },
  unknown
> = {
  auth: "required",
  method: "POST",
  path: "/users/chat/custom-response/prompts",
  toBody: (input) => input,
  version: "v1",
};
