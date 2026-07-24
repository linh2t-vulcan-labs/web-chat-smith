import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const SubscriptionItemSchema = z.object({
  appId: z.string(),
  createdAt: z.string(),
  durationUnit: z.string(),
  durationValue: z.number(),
  expiredAt: z.string(),
  gracePeriodEndAt: z.string(),
  gracePeriodStartAt: z.string(),
  id: z.string(),
  metadata: z.optional(z.object({ subscriptionId: z.string() })),
  role: z.string(),
  status: z.string(),
  subscriptionSource: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
});

/**
 * Wire response is a bare array under `data` — the `{ items: [...] }`
 * wrapper the legacy client built client-side is NOT part of the wire
 * contract (see docs/runbook/api-client.md §16); modeled as the raw array here.
 */
const SubscriptionsResponseSchema = z.object({
  data: z.array(SubscriptionItemSchema),
});

/** `subscription` service segment (see docs/runbook/api-client.md §16). */
export const subscription = defineService("subscription").endpoint(
  "getUserSubscriptions",
  {
    auth: "required",
    method: "GET",
    path: "/users/subscriptions",
    responseSchema: SubscriptionsResponseSchema,
    toQuery: (input: { appId: string; limit: number; page: number }) => input,
    version: "v1",
  }
);
