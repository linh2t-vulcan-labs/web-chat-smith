"use client";

import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useIsPaymentFlowV2 } from "@/hooks/remote-config/use-payment-flow-v2";
import { useGlobalState } from "@/store/global/hooks";

import { useApplePayAvailability } from "./use-apple-pay-availability";

export interface TExpressCheckoutEligibility {
  /** True when ALL conditions are met: V2 flag on, Apple Pay available, settled, authenticated. */
  isExpressCheckout: boolean;
  /**
   * False while Apple Pay state / products / profile are still resolving (V2 only).
   * Always true when V2 is off — callers can render immediately without waiting.
   */
  isSettled: boolean;
  isPaymentV2: boolean;
  /** True for unauthenticated guest sessions — express checkout is never shown to guests. */
  isGuest: boolean;
}

/**
 * Single source of truth for express checkout eligibility.
 *
 * Express checkout (Apple Pay inline iframe) is enabled when ALL of:
 *   - `FEATURE_PAYMENT_FLOW_V2` remote config flag is ON
 *   - All async signals (Apple Pay, products, profile) have settled
 *   - Apple Pay is available in the current browser (iOS Safari or macOS Safari)
 *   - User is authenticated — express checkout requires `internal_customer_id`
 *
 * Used by both the mobile checkout (`MobileV2Checkout`) and desktop checkout
 * (`GetFullAccessCard`) so the eligibility rules are never duplicated.
 */
export function useExpressCheckoutEligibility(): TExpressCheckoutEligibility {
  const isPaymentV2 = useIsPaymentFlowV2();
  const applePay = useApplePayAvailability();
  const productsReady = useGlobalState((state) => state.products.length > 0);
  const profileReady = useGlobalState((state) => state.isFinishFetchProfile);
  const userId = useGlobalState((state) => state.user.id);
  const guestStore = useGuestStore();

  const isGuest = !userId && Boolean(guestStore);
  // Skip the settle-wait when V2 is off — isExpressCheckout will be false anyway.
  const isSettled =
    !isPaymentV2 || (applePay !== "resolving" && productsReady && profileReady);
  const isExpressCheckout =
    isPaymentV2 && isSettled && applePay === "available" && !isGuest;

  return { isExpressCheckout, isGuest, isPaymentV2, isSettled };
}
