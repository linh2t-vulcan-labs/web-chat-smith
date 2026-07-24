"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import type { ProductModel } from "@/core/models/product";
import { useIsPaymentFlowV2 } from "@/hooks/remote-config/use-payment-flow-v2";
import type { CheckoutOpenOptions } from "@/libs/paddle-js";
import { buildV2CheckoutOptions, withInlineSettings } from "@/libs/paddle-js";
import { useGlobalState } from "@/store/global/hooks";
import { Logger } from "@/utils/commons/logger";

import type { PaddleFlow } from "./use-paddle-checkout";
import { usePaddleCheckout } from "./use-paddle-checkout";

const logger = new Logger("CheckoutOpener");

export type TCheckoutErrorCode =
  | "PRICE_UNAVAILABLE"
  | "NOT_AUTHENTICATED"
  | "V1_NOT_SUPPORTED_HERE"
  | "MISSING_TRANSACTION_ID"
  | "CHECKOUT_OPEN_FAILED";

/** Fail-closed checkout error — surfaced to the user and logged, never silently downgraded to V1. */
export class CheckoutError extends Error {
  code: TCheckoutErrorCode;

  constructor(code: TCheckoutErrorCode) {
    super(code);
    this.code = code;
    this.name = "CheckoutError";
  }
}

/** Which leg the opener took. `undefined` means the call was skipped by the in-flight guard. */
export type TCheckoutPath = "v1" | "v2";

export interface TOpenForProductArgs {
  product: ProductModel;
  flow: PaddleFlow;
  container: string;
  paddleOpts?: Parameters<typeof withInlineSettings>[2];
  customer?: CheckoutOpenOptions["customer"];
  /**
   * Caller-owned V1 path: runs createOrder+checkout (+ its own side effects), returns transactionId.
   * OPTIONAL — required only for callers that can run under flag OFF (desktop). V2-only callers
   * (mobile express + mobile standard, which render only when flag ON) omit it; if the opener ever
   * selects V1 without a resolver it fails closed.
   */
  resolveV1TransactionId?: () => Promise<string>;
}

/**
 * The single V1-vs-V2 build+open decision point.
 *
 * It owns ONLY: readiness gating, the V1/V2 decision, building options, and `openCheckout` —
 * plus an in-flight guard against double-charge. It does NOT own the V1 mutations or any
 * caller-specific side effects (tracking, loading overlay, order context); those stay in the
 * caller's `resolveV1TransactionId` closure so the flag-OFF path is unchanged.
 */
export function useCheckoutOpener() {
  const isV2Flag = useIsPaymentFlowV2(); // RC ready AND flag on (Phase 1)
  const productsReady = useGlobalState((state) => state.products.length > 0);
  const profileReady = useGlobalState((state) => state.isFinishFetchProfile);
  const userId = useGlobalState((state) => state.user.id);
  const { openCheckout, updateCheckoutItems } = usePaddleCheckout();

  const [isInFlight, setIsInFlight] = useState(false);
  // Ref mirrors the state so the guard is race-proof regardless of render timing.
  const inFlightRef = useRef(false);

  const failClosed = useCallback(
    (error: CheckoutError, context?: Record<string, unknown>) => {
      logger.sendError(error, { code: error.code, ...context });
      toast.error("Something went wrong. Please try again.");
      throw error;
    },
    []
  );

  const openForProduct = useCallback(
    async (args: TOpenForProductArgs): Promise<TCheckoutPath | undefined> => {
      if (inFlightRef.current) {
        return undefined;
      } // in-flight guard
      inFlightRef.current = true;
      setIsInFlight(true);
      try {
        const priceId = args.product.vendorProductId;

        // Readiness gating: only decide once inputs are settled.
        const wantsV2 = isV2Flag && productsReady && profileReady;

        if (wantsV2) {
          // FAIL CLOSED on genuine V2 errors — do NOT silently route to V1.
          if (!priceId) {
            failClosed(new CheckoutError("PRICE_UNAVAILABLE"), {
              productId: args.product.id,
            });
            return;
          }
          if (!userId) {
            failClosed(new CheckoutError("NOT_AUTHENTICATED"));
            return;
          }

          const openedV2 = openCheckout(
            args.flow,
            buildV2CheckoutOptions({
              container: args.container,
              customer: args.customer,
              internalCustomerId: userId,
              paddleOpts: args.paddleOpts,
              priceId,
            })
          );
          // Paddle went unready between the readiness gate and open — fail closed so the
          // caller clears its loading overlay and surfaces an error (never a silent hang).
          if (!openedV2) {
            failClosed(new CheckoutError("CHECKOUT_OPEN_FAILED"));
            return undefined;
          }
          return "v2";
        }

        // V1 path (flag genuinely OFF). Caller-owned mutations + side effects.
        if (!args.resolveV1TransactionId) {
          failClosed(new CheckoutError("V1_NOT_SUPPORTED_HERE")); // V2-only caller
          return undefined;
        }
        const transactionId = await args.resolveV1TransactionId();
        if (!transactionId) {
          failClosed(new CheckoutError("MISSING_TRANSACTION_ID"));
          return undefined;
        }
        const openedV1 = openCheckout(
          args.flow,
          withInlineSettings(
            {
              transactionId,
              ...(args.customer ? { customer: args.customer } : {}),
            },
            args.container,
            args.paddleOpts
          )
        );
        if (!openedV1) {
          failClosed(new CheckoutError("CHECKOUT_OPEN_FAILED"));
          return undefined;
        }
        return "v1";
      } finally {
        inFlightRef.current = false;
        setIsInFlight(false);
      }
    },
    // oxlint-disable-next-line react/react-compiler -- deps intentionally include readiness/identity flags for the V1/V2 checkout decision gate; narrowing them risks stale gating in this business-critical checkout flow
    [isV2Flag, productsReady, profileReady, userId, openCheckout, failClosed]
  );

  /**
   * Open-once + update-on-change (Phase 3.3): after the checkout is open, swap line items in the
   * live iframe instead of close→reopen. V2-only (items-based); never call on a transactionId checkout.
   */
  const updateForProduct = useCallback(
    (product: ProductModel) => {
      const priceId = product.vendorProductId;
      if (!priceId) {
        logger.sendError(new CheckoutError("PRICE_UNAVAILABLE"), {
          context: "updateForProduct",
          productId: product.id,
        });
        return;
      }
      updateCheckoutItems([{ priceId, quantity: 1 }]);
    },
    [updateCheckoutItems]
  );

  return { isInFlight, openForProduct, updateForProduct };
}
