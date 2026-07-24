"use client";

import { useEffect, useState } from "react";

import { Logger } from "@/utils/commons/logger";

// Minimal typing instead of `as any` — only the surface we touch.
interface ApplePaySessionLike {
  canMakePayments?: () => boolean;
  supportsVersion?: (version: number) => boolean;
}
declare global {
  interface Window {
    ApplePaySession?: ApplePaySessionLike;
  }
}

export type TApplePayState = "resolving" | "available" | "unavailable";

// Apple Pay JS API version our checkout relies on. supportsVersion guards against very old
// Safari builds that expose ApplePaySession but not a usable checkout version.
const REQUIRED_APPLE_PAY_VERSION = 3;

const logger = new Logger("ApplePayAvailability");

/**
 * SSR-safe Apple Pay availability check. Returns a tri-state so callers can render a
 * skeleton while "resolving" instead of flashing the wrong checkout on first paint.
 *
 * Works on both iOS Safari and macOS Safari — any browser that exposes `ApplePaySession`.
 * Uses the synchronous `ApplePaySession.canMakePayments()` (device/OS capability) rather than
 * the async `canMakePaymentsWithActiveCard(merchantId)` (capability + an enrolled card) on
 * purpose:
 *   - Per Apple's Human Interface Guidelines, when Apple Pay is offered *alongside* other
 *     payment methods you must show the Apple Pay button on any supported device, regardless of
 *     whether a card is enrolled. Our express checkout always renders the inline "Pay another
 *     way (Card)" fallback (`showNonExpressPaymentMethods`), so a no-card user can still pay.
 *   - `canMakePaymentsWithActiveCard` requires the Apple Pay *merchant identifier*, which is
 *     owned by Paddle (the payment processor) and not exposed to us — so it cannot be called
 *     correctly from this layer anyway.
 * Refs: developer.apple.com/documentation/applepayontheweb/applepaysession/canmakepayments
 *       developer.apple.com/documentation/applepayontheweb/applepaysession/canmakepaymentswithactivecard
 */
export function useApplePayAvailability(): TApplePayState {
  const [state, setState] = useState<TApplePayState>("resolving");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const session = window?.ApplePaySession;
      const versionOk =
        typeof session?.supportsVersion !== "function" ||
        session.supportsVersion(REQUIRED_APPLE_PAY_VERSION);
      const available = Boolean(session?.canMakePayments?.() && versionOk);
      // oxlint-disable-next-line react/react-compiler -- resolves availability by querying the browser's ApplePaySession API (external system), not a render derivation
      setState(available ? "available" : "unavailable");
    } catch (error) {
      logger.sendError(error, {
        context: "ApplePaySession.canMakePayments threw",
      });
      setState("unavailable");
    }
  }, []);

  return state;
}
