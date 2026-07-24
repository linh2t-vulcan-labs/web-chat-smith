import React, { useEffect, useState } from "react";

import LoadingProcessing from "@/components/loading-icon/loading-processing";
import { PADDLE_CONTAINER_CLASSNAME } from "@/libs/paddle-js/constants";

export type TExpressCheckoutState = "idle" | "loading" | "ready" | "error";

interface TPaddleExpressCheckoutButtonProps {
  checkoutState: TExpressCheckoutState;
  /** True while a plan switch is debouncing/applying — gates the pay button until updateItems runs. */
  isUpdatingPlan?: boolean;
}

/**
 * Grace window after the checkout finishes loading before the Apple Pay button is
 * revealed/clickable. The `ready` state fires when the iframe DOM is ready, but Paddle wires
 * up the express (Apple Pay) session a beat later. Un-clipping the iframe the instant it loads
 * lets an immediate tap fall through to the wrong flow, so we hold the skeleton until the
 * express session is actually live.
 */
const EXPRESS_READY_GRACE_MS = 800;

export const PaddleExpressCheckoutButton: React.FC<
  TPaddleExpressCheckoutButtonProps
> = ({ checkoutState, isUpdatingPlan = false }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const isLoading =
    isInitialLoading || checkoutState === "idle" || checkoutState === "loading";
  // Stays false until the post-load grace window elapses, keeping the button non-interactive.
  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    if (checkoutState !== "idle") {
      // oxlint-disable-next-line react/react-compiler -- effect derives one-time "initial load finished" flag from an external checkout state change; idempotent, not a render loop
      setIsInitialLoading(false);
    }
  }, [checkoutState]);

  useEffect(() => {
    if (isLoading) {
      // oxlint-disable-next-line react/react-compiler -- effect resets interactivity flag whenever the loading state changes; idempotent derivation, false positive
      setIsInteractive(false);
      return;
    }
    const timer = setTimeout(
      () => setIsInteractive(true),
      EXPRESS_READY_GRACE_MS
    );
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Full-page processing overlay: only for the initial load and the post-load grace window.
  // NOT for plan switches — those must not blank the whole page.
  const isProcessingOverlayVisible =
    isLoading || (checkoutState !== "error" && !isInteractive);

  return (
    <>
      <LoadingProcessing
        isSpinning={isProcessingOverlayVisible}
        text="loading"
      />
      <div className="relative w-full" style={{ minWidth: 312 }}>
        {/* While a plan switch is debouncing/applying, block taps on the Apple Pay button only
            (no full-page loading) so the user can't pay against the not-yet-applied plan. */}
        {isUpdatingPlan && (
          <div className="absolute inset-0 z-10 cursor-not-allowed" />
        )}
        <div
          className={PADDLE_CONTAINER_CLASSNAME.PADDLE_EXPRESS_BUTTON_CONTAINER}
          style={{
            minWidth: 312,
            pointerEvents: isUpdatingPlan ? "none" : undefined,
            width: "100%",
          }}
        />
      </div>
    </>
  );
};
