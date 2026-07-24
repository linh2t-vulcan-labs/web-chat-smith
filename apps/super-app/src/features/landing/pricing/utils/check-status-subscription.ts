import { EPaymentSubscriptionStatus } from "@/core/models/payment";
import type { TPaymentSubscriptionStatus } from "@/core/models/payment";

/**
 * Normalizes subscription status: ACTIVE without a valid next billing date is treated as cancelled.
 */
export function checkStatusSubscription(
  status: TPaymentSubscriptionStatus,
  nextBillingDate: string
): TPaymentSubscriptionStatus {
  if (status !== EPaymentSubscriptionStatus.ACTIVE) {
    return status;
  }

  const timestamp = Number(nextBillingDate);

  if (!nextBillingDate || !Number.isFinite(timestamp) || timestamp <= 0) {
    return EPaymentSubscriptionStatus.CANCELLED;
  }

  return status;
}
