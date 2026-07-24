import type { CheckoutOpenOptions } from "@paddle/paddle-js";

import {
  createSingleItemCheckout,
  withCustomData,
  withInlineSettings,
} from "./utils";

type InlineOpts = Parameters<typeof withInlineSettings>[2];
type Customer = CheckoutOpenOptions["customer"];

/**
 * Payment Flow V2: open Paddle directly with a `priceId` + `custom_data.internal_customer_id`,
 * letting `ms-payments` create the order from the `transaction.created` webhook.
 *
 * `internalCustomerId` MUST be a non-empty Vulcan user id — the webhook is dropped if empty.
 * Pure (no React) so it is unit-testable in isolation.
 */
export function buildV2CheckoutOptions(args: {
  priceId: string;
  internalCustomerId: string;
  customer?: Customer;
  container: string;
  paddleOpts?: InlineOpts;
}): CheckoutOpenOptions {
  const base = createSingleItemCheckout(args.priceId, 1, args.customer);
  const withData = withCustomData(base, {
    internal_customer_id: args.internalCustomerId,
  });
  return withInlineSettings(withData, args.container, args.paddleOpts);
}
