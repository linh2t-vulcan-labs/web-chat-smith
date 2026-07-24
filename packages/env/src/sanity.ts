import { z } from "@cs/validation";

import { createEnv } from "./create-env";

export const sanityStudioEnv = createEnv({
  client: {
    SANITY_STUDIO_API_VERSION: z
      .string()
      .check(z.minLength(1, "SANITY_STUDIO_API_VERSION must not be empty")),
    SANITY_STUDIO_DATASET: z
      .string()
      .check(z.minLength(1, "SANITY_STUDIO_DATASET must not be empty")),
    SANITY_STUDIO_PROJECT_ID: z
      .string()
      .check(z.minLength(1, "SANITY_STUDIO_PROJECT_ID must not be empty")),
    SANITY_STUDIO_TITLE: z
      .string()
      .check(z.minLength(1, "SANITY_STUDIO_TITLE must not be empty")),
  },
  runtimeEnv: {
    SANITY_STUDIO_API_VERSION: process.env.SANITY_STUDIO_API_VERSION,
    SANITY_STUDIO_DATASET: process.env.SANITY_STUDIO_DATASET,
    SANITY_STUDIO_PROJECT_ID: process.env.SANITY_STUDIO_PROJECT_ID,
    SANITY_STUDIO_TITLE: process.env.SANITY_STUDIO_TITLE,
  },
  server: {},
});
