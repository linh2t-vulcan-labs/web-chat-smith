import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const SubscriptionPriceInfoSchema = z.object({
  createdAt: z.string(),
  currency: z.string(),
  id: z.string(),
  price: z.number(),
  status: z.string(),
  subscriptionId: z.string(),
  updatedAt: z.string(),
});

// `SubscriptionAppInfo.crossApps` is self-referential — declared with an
// explicit type + `z.lazy` (zod/mini equivalent) since zod can't infer a
// recursive object type from `z.object()` alone.
interface SubscriptionAppInfo {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  crossApps: SubscriptionAppInfo[];
}

const SubscriptionAppInfoSchema: z.ZodMiniType<SubscriptionAppInfo> = z.object({
  createdAt: z.string(),
  crossApps: z.array(z.lazy(() => SubscriptionAppInfoSchema)),
  id: z.string(),
  name: z.string(),
  status: z.string(),
  updatedAt: z.string(),
});

const ProductSchema = z.object({
  app: SubscriptionAppInfoSchema,
  appId: z.string(),
  createdAt: z.string(),
  defaultPrice: SubscriptionPriceInfoSchema,
  description: z.string(),
  durationUnit: z.string(),
  durationValue: z.number(),
  id: z.string(),
  status: z.string(),
  subscriptionPrices: z.array(SubscriptionPriceInfoSchema),
  updatedAt: z.string(),
  vendorSubscriptions: z.array(SubscriptionPriceInfoSchema),
});

const ProductsResponseSchema = z.object({ data: z.array(ProductSchema) });

/**
 * `product` service segment — the one endpoint whose API version is a
 * runtime parameter, not a fixed path segment (see docs/runbook/api-client.md
 * §8 escape-hatch example).
 */
interface GetByAppIdInput {
  apiVersion: string;
  appId: string;
  limit: number;
  pageToken: number | string;
}

export const product = defineService("product").endpoint("getByAppId", {
  auth: "required",
  method: "GET",
  path: (input: GetByAppIdInput) =>
    `/${input.apiVersion}/users/apps/${input.appId}/subscriptions`,
  responseSchema: ProductsResponseSchema,
  toQuery: (input: GetByAppIdInput) => ({
    limit: input.limit,
    pageToken: input.pageToken,
    // Confirmed against apps/super-app/src/core/repositories/product-service.ts
    // (ESUBSCRIPTION_SOURCE.WEB) — the literal enum value the backend expects
    // for a web client is this string, not "WEB".
    subscriptionSource: "SUBSCRIPTION_SOURCE_ECOSYSTEM",
  }),
});
