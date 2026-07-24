import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";
import { unwrapEnvelope } from "../../utils/envelope";

const CreateOrderResponseSchema = unwrapEnvelope(
  "data",
  z.object({ orderId: z.string() })
);

const CheckoutResponseSchema = unwrapEnvelope(
  "data",
  z.object({
    dueAt: z.string(),
    extend: z.optional(
      z.object({ paddle: z.optional(z.object({ transactionId: z.string() })) })
    ),
    subTotal: z.number(),
    url: z.string(),
  })
);

const TrialUsagesSchema = unwrapEnvelope(
  "data",
  z.object({
    createdAt: z.string(),
    groupId: z.string(),
    userId: z.string(),
  })
);

interface CheckoutInput {
  orderId: string;
  paymentVendor: string;
  paymentMethod?: string;
  successUrl: string;
  cancelUrl: string;
  description: string;
  dryRun?: boolean;
  currency?: number;
}

const toCheckoutBody = (input: CheckoutInput) => ({
  cancelUrl: input.cancelUrl,
  currency: input.currency,
  description: input.description,
  dryRun: input.dryRun,
  paymentMethod: input.paymentMethod,
  paymentVendor: input.paymentVendor,
  successUrl: input.successUrl,
});

/** `order` service segment (see docs/runbook/api-client.md §16). */
export const order = defineService("order")
  .endpoint("create", {
    auth: "required",
    idempotent: true,
    method: "POST",
    path: "/users/orders",
    responseSchema: CreateOrderResponseSchema,
    retry: false,
    toBody: (input: { subscriptionId: string; quantity: number }) => ({
      item: { quantity: input.quantity, subscriptionId: input.subscriptionId },
    }),
    version: "v1",
  })
  .endpoint("checkout", {
    auth: "required",
    idempotent: true,
    method: "POST",
    path: (input: CheckoutInput) => `/users/orders/${input.orderId}/checkout`,
    responseSchema: CheckoutResponseSchema,
    retry: false,
    toBody: toCheckoutBody,
    version: "v1",
  })
  .endpoint("quickCheckout", {
    auth: "required",
    idempotent: true,
    method: "POST",
    path: (input: CheckoutInput) =>
      `/users/orders/${input.orderId}/checkout/express`,
    responseSchema: CheckoutResponseSchema,
    retry: false,
    toBody: toCheckoutBody,
    version: "v1",
  })
  .endpoint("getTrialUsages", {
    auth: "required",
    method: "GET",
    path: "/users/trial-usages/last",
    responseSchema: TrialUsagesSchema,
    version: "v1",
  });
