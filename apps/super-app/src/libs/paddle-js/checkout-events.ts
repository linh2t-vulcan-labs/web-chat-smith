import type { PaddleEventData } from "@paddle/paddle-js";
import { CheckoutEventsStatus } from "@paddle/paddle-js";

import { PADDLE_EVENTS } from "./constants";

/**
 * Checkout event handlers configuration
 */
export interface CheckoutEventHandlers {
  onSuccess?: (data: PaddleEventData) => void;
  onError?: (data: PaddleEventData) => void;
  onPaymentFailed?: (data: PaddleEventData) => void;
  onClosed?: (data: PaddleEventData) => void;
  onLoaded?: (data: PaddleEventData) => void;
  /** Fires on `checkout.updated` — e.g. when the transaction transitions draft → ready, or on item swaps. */
  onUpdated?: (data: PaddleEventData) => void;
  onPaymentInitiated?: (data: PaddleEventData) => void;
  onCustomerCreated?: (data: PaddleEventData) => void;
}

/**
 * Creates an eventCallback function that routes Paddle events to your handlers
 *
 * @example
 * ```tsx
 * const eventCallback = createCheckoutEventCallback({
 *   onSuccess: (data) => {
 *     console.log('Payment successful!', data);
 *     toast.success('Thank you for your purchase!');
 *   },
 *   onError: (data) => {
 *     console.error('Payment failed:', data);
 *     toast.error('Payment failed. Please try again.');
 *   }
 * });
 *
 * openPaddle({
 *   items: [...],
 *   eventCallback
 * });
 * ```
 */
export function createCheckoutEventCallback(handlers: CheckoutEventHandlers) {
  return (event: PaddleEventData) => {
    switch (event.name) {
      case PADDLE_EVENTS.CHECKOUT_COMPLETED: {
        handlers.onSuccess?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_ERROR: {
        handlers.onError?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_PAYMENT_FAILED: {
        handlers.onPaymentFailed?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_CLOSED: {
        handlers.onClosed?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_LOADED: {
        handlers.onLoaded?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_UPDATED: {
        handlers.onUpdated?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_PAYMENT_INITIATED: {
        handlers.onPaymentInitiated?.(event);
        break;
      }

      case PADDLE_EVENTS.CHECKOUT_CUSTOMER_CREATED: {
        handlers.onCustomerCreated?.(event);
        break;
      }

      default: {
        // Log all other events for debugging
        console.debug("[Paddle Event - Unhandled]", event.name, event.data);
      }
    }
  };
}

/**
 * Type guard to check if an event is a checkout completion event
 */
export function isCheckoutCompleted(event: PaddleEventData): boolean {
  return event.name === PADDLE_EVENTS.CHECKOUT_COMPLETED;
}

/**
 * Type guard to check if an event is a checkout error event
 */
export function isCheckoutError(event: PaddleEventData): boolean {
  return (
    event.name === PADDLE_EVENTS.CHECKOUT_ERROR ||
    event.name === PADDLE_EVENTS.CHECKOUT_PAYMENT_FAILED
  );
}

/**
 * Extract transaction ID from checkout completion event
 */
export function getTransactionId(event: PaddleEventData): string | null {
  if (isCheckoutCompleted(event)) {
    const data = event.data as { transaction_id?: string } | undefined;
    return data?.transaction_id || null;
  }
  return null;
}

/**
 * Whether the checkout's transaction is fully previewed and ready to pay (`status: "ready"`).
 *
 * Important for **express** (Apple Pay): `checkout.loaded` can fire while the transaction is still
 * `draft` (totals not finalized). Tapping the Apple Pay button while `draft` falls through to
 * Paddle's hosted checkout page instead of the inline express sheet, so callers must gate the
 * button on this until the status reaches `ready` (delivered via `checkout.loaded` or a later
 * `checkout.updated`).
 */
export function isCheckoutReady(event: PaddleEventData): boolean {
  return event.data?.status === CheckoutEventsStatus.READY;
}

/**
 * Extract error details from checkout error event
 */
export function getErrorDetails(
  event: PaddleEventData
): { code?: string; message?: string } | null {
  if (isCheckoutError(event)) {
    const data = event.data as
      | { error?: { code?: string; message?: string }; detail?: string }
      | undefined;
    const { error, detail } = data || {};
    return {
      code: error?.code,
      message: error?.message || detail,
    };
  }
  return null;
}
