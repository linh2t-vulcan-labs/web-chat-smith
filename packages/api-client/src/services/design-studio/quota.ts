import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";

const QuotaSchema = z.pipe(
  z.object({
    dailyLimit: z.number(),
    remaining: z.number(),
    // Wire value is a Unix-seconds timestamp sent AS A STRING, only present
    // while a quota window is active.
    resetAt: z.optional(z.string()),
  }),
  z.transform(({ resetAt, ...rest }) => ({
    ...rest,
    resetAt: resetAt === undefined ? undefined : Number(resetAt),
  }))
);

export const getQuotaConfig: EndpointConfig<
  undefined,
  z.infer<typeof QuotaSchema>
> = {
  auth: "required",
  method: "GET",
  path: "/quota",
  responseSchema: QuotaSchema,
};
