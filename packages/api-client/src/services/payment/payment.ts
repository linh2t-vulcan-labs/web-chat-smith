import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const BillingHistorySchema = z.object({
  extended: z.object({ stripe: z.object({ portalUrl: z.string() }) }),
});

const PaymentInfoSchema = z.object({
  extended: z.object({
    stripe: z.optional(z.object({ brand: z.string(), last4: z.string() })),
  }),
});

const PaymentProductSchema = z.object({
  sourceProductId: z.string(),
  vendorProductId: z.string(),
});
const PaymentProductsResponseSchema = z.object({
  items: z.array(PaymentProductSchema),
});

/**
 * `payment` service segment (see docs/runbook/api-client.md §16). Only the 3
 * endpoints below have a confirmed call site in `temp/`. `temp/http/dto/payment.ts`
 * also declares response types for subscription detail, payment methods list,
 * transactions list, single-transaction detail, and preview-upgrade/downgrade
 * — none of them have a corresponding repository method call in `temp/`, so
 * their exact method/path is unconfirmed. Add them here once the real
 * endpoint is confirmed with backend; do not guess a path.
 */
export const payment = defineService("payment")
  .endpoint("billingHistory", {
    auth: "required",
    idempotent: true,
    method: "POST",
    path: "/billings/portal",
    responseSchema: BillingHistorySchema,
    retry: false,
    toBody: (input: {
      customerId: string;
      vendor: string;
      returnUrl: string;
    }) => ({
      additional: { stripe: { returnUrl: input.returnUrl } },
      customerId: input.customerId,
      vendor: input.vendor,
    }),
    version: "v1",
  })
  .endpoint("getPaymentInfo", {
    auth: "required",
    method: "GET",
    path: "/payments/payment_information",
    responseSchema: PaymentInfoSchema,
    toQuery: (input: { vendor: string }) => input,
    version: "v1",
  })
  .endpoint("getPaymentProducts", {
    auth: "required",
    method: "GET",
    path: "/payments/products",
    responseSchema: PaymentProductsResponseSchema,
    toQuery: () => ({ globalOnly: true }),
    version: "v1",
  });
