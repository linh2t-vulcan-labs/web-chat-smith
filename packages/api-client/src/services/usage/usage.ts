import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

/**
 * `FreeUsageCountModel`'s authoritative shape lives in the legacy app's
 * `@/core/models/user` (not part of `temp/`) — only a commented-out draft
 * exists in `temp/models/usage.ts`. Modeled loosely pending confirmation;
 * do not treat these field names as certain.
 */
const FreeUsageCountSchema = z.array(
  z.object({
    createdAt: z.string(),
    remainingCount: z.number(),
    updatedAt: z.string(),
    useCase: z.string(),
    userId: z.string(),
  })
);

const FreeUsageResetSchema = z.array(
  z.object({
    canReset: z.boolean(),
    createdAt: z.string(),
    lastResetAt: z.string(),
    periodEnd: z.string(),
    periodStart: z.string(),
    resetCount: z.number(),
    status: z.string(),
    updatedAt: z.string(),
    useCase: z.string(),
    userId: z.string(),
  })
);

/** Usage domain, on the `smith-engine` service (confirmed by reading `temp/repositories/usage-service.ts` directly). */
export const usage = defineService("smith-engine")
  .endpoint("getFreeUsageCount", {
    auth: "required",
    method: "GET",
    path: "/users/web/usages",
    responseSchema: FreeUsageCountSchema,
    version: "v1",
  })
  .endpoint("getFreeUsageResetList", {
    auth: "required",
    method: "GET",
    path: "/users/web/usage/reset/list",
    responseSchema: FreeUsageResetSchema,
    version: "v1",
  })
  .endpoint("initFreeUsage", {
    auth: "required",
    method: "POST",
    path: "/users/web/usage/reset/init",
    retry: false,
    version: "v1",
  })
  .endpoint("resetFreeUsage", {
    auth: "required",
    method: "POST",
    path: "/users/web/usages/reset",
    retry: false,
    version: "v1",
  })
  .endpoint("updateFreeUsageCount", {
    auth: "required",
    method: "PUT",
    path: "/users/web/usage",
    retry: false,
    version: "v1",
  });
