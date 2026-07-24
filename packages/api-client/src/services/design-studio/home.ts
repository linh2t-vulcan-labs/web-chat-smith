import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";

// No live call site found for these two (no home-service.ts exists in the
// legacy app — only endpoint builders + types + React Query cache keys).
// Shape inferred from the port signature/DTO types; unconfirmed against a
// real request.

export const getHomeSuggestionsConfig: EndpointConfig<
  undefined,
  { suggestions: string[] }
> = {
  auth: "required",
  method: "GET",
  path: "/home/suggestions",
  responseSchema: z.object({ suggestions: z.array(z.string()) }),
};

export const getCreateLogoStructureConfig: EndpointConfig<
  undefined,
  { industries: string[]; styles: string[]; types: string[] }
> = {
  auth: "required",
  method: "GET",
  path: "/home/create-logo-structure",
  responseSchema: z.object({
    industries: z.array(z.string()),
    styles: z.array(z.string()),
    types: z.array(z.string()),
  }),
};
