"use client";

import { getRuntimeEnv } from "@cs/env/universal";
import { Turnstile } from "@marsidev/react-turnstile";
import type { TurnstileInstance } from "@marsidev/react-turnstile";
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";

import { isServer } from "@/utils/commons/helpers";

import type { RecaptchaProps, RecaptchaRef } from "./types";

export const Recaptcha = forwardRef<RecaptchaRef, RecaptchaProps>(
  ({ onSuccess, onError, onExpire, className: _className }, ref) => {
    const turnstileRef = useRef<TurnstileInstance | null>(null);

    const handleErrorCaptcha = useCallback(
      (error: string) => {
        // console.error("Turnstile error:", error);
        onError?.(error);

        // Only reload on critical errors, not on user interaction errors
        if (
          (error.includes("network") || error.includes("timeout")) &&
          !isServer
        ) {
          globalThis.window.location.reload();
        }
      },
      [onError]
    );

    const handleSuccess = useCallback(
      (token: string) => {
        onSuccess?.(token);
      },
      [onSuccess]
    );

    const handleExpired = useCallback(() => {
      // console.warn("Turnstile token expired");
      onExpire?.();
    }, [onExpire]);

    const handleBeforeInteractive = useCallback(() => {
      // console.log("Turnstile: Before interactive");
    }, []);

    const handleWidgetLoad = useCallback((_widgetId: string) => {
      // console.log("Turnstile: Widget loaded with ID:", widgetId);
    }, []);

    const refreshTurnstile = useCallback(() => {
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    }, []);

    // Expose refresh function for external use
    useImperativeHandle(ref, () => ({
      refresh: refreshTurnstile,
    }));

    return (
      <Turnstile
        ref={turnstileRef}
        // Read in the render body of a "use client" component, which still
        // executes during SSR — the client-only getPublicEnv() would throw.
        siteKey={getRuntimeEnv().CS_PUBLIC_TURNSTILE_CAPTCHA_SITEKEY ?? ""}
        onError={handleErrorCaptcha}
        onSuccess={handleSuccess}
        onExpire={handleExpired}
        onBeforeInteractive={handleBeforeInteractive}
        onWidgetLoad={handleWidgetLoad}
        options={{
          size: "invisible",
        }}
      />
    );
  }
);

Recaptcha.displayName = "Recaptcha";
