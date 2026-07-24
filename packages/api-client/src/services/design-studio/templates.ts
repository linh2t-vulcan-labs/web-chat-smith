import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { toPageQuery } from "./constants";
import type { PageInput } from "./constants";

// `imageUrl` is on the legacy model's `@Expose` list but not on the wire DTO
// it's transformed from (`excludeExtraneousValues: true` would always drop
// it) — omitted here pending backend confirmation of which one is stale.
const TemplateSchema = z.object({
  category: z.string(),
  id: z.string(),
  name: z.string(),
  sortOrder: z.number(),
  tags: z.array(z.string()),
  thumbnailUrl: z.string(),
});

export const listTemplatesConfig: EndpointConfig<
  { category?: string } & PageInput,
  {
    nextPageToken: string | null;
    templates: z.infer<typeof TemplateSchema>[];
  }
> = {
  // The one endpoint in this domain confirmed public (no auth) — legacy
  // passes `enabledAuth: false` explicitly here only.
  auth: "none",
  method: "GET",
  path: "/templates",
  responseSchema: z.object({
    nextPageToken: z.nullable(z.string()),
    templates: z.array(TemplateSchema),
  }),
  toQuery: (input) => ({
    category: input.category,
    ...toPageQuery(input),
  }),
};
