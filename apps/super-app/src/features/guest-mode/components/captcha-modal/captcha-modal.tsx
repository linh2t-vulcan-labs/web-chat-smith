"use client";

import React, { useCallback, useRef } from "react";

import { useInitGuestMode } from "../../hooks/use-init-guest-mode/use-init-guest-mode";
import { useGuestState } from "../../stores/guest-mode/hooks";
import { Recaptcha } from "./recaptcha";
import type { RecaptchaRef } from "./types";

// Timeout constants
const CREATE_SESSION_TIMEOUT_MS = 15_000; // 15 seconds

const CaptchaModal: React.FC = () => {
  const recaptchaRef = useRef<RecaptchaRef>(null);
  const nonce = useGuestState((state) => state.nonce);
  const csrfToken = useGuestState((state) => state.csrfToken);
  const isVerifiedCaptcha = useGuestState((state) => state.isVerifiedCaptcha);

  const setIsVerifiedCaptcha = useGuestState(
    (state) => state.setIsVerifiedCaptcha
  );
  const setAnonId = useGuestState((state) => state.setAnonId);
  const setSessionId = useGuestState((state) => state.setSessionId);
  const setDeviceId = useGuestState((state) => state.setDeviceId);
  const setAccessToken = useGuestState((state) => state.setAccessToken);
  const setIsShowCaptchaModal = useGuestState(
    (state) => state.setIsShowCaptchaModal
  );
  const resetStore = useGuestState((state) => state.resetStore);

  const isShowReCaptcha = nonce && csrfToken;

  const { createGuestSession } = useInitGuestMode();

  const handleSuccessCaptcha = useCallback(
    async (token: string) => {
      if (isVerifiedCaptcha) {
        return;
      }

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_resolve, reject) => {
        setTimeout(() => {
          reject(new Error("Session creation timeout"));
        }, CREATE_SESSION_TIMEOUT_MS);
      });

      try {
        // Race between session creation and timeout
        const result = await Promise.race([
          createGuestSession({
            captchaToken: token,
            csrfToken,
            nonce,
          }),
          timeoutPromise,
        ]);

        if (result) {
          // Validate that we have all required data
          if (
            result.accessToken &&
            result.anonId &&
            result.sessionId &&
            result.deviceId
          ) {
            setAnonId(result.anonId);
            setSessionId(result.sessionId);
            setDeviceId(result.deviceId);
            setAccessToken(result.accessToken);
            setIsVerifiedCaptcha(true);
            setIsShowCaptchaModal(false);
          } else {
            // Partial data - log and refresh
            // console.warn("[CaptchaModal] Incomplete session data received:", result);
            setIsVerifiedCaptcha(false);
            recaptchaRef.current?.refresh();
          }
        } else {
          // No result returned - clear store and reload
          // console.error("[CaptchaModal] No result from createGuestSession");
          resetStore();
          globalThis.location.reload();
        }
      } catch {
        // console.error("[CaptchaModal] Session creation error:", errorMessage);

        // Clear guest store and reload page to restart flow
        resetStore();
        globalThis.location.reload();
      }
    },
    [
      isVerifiedCaptcha,
      nonce,
      csrfToken,
      setSessionId,
      setIsVerifiedCaptcha,
      createGuestSession,
      setAccessToken,
      setDeviceId,
      setAnonId,
      setIsShowCaptchaModal,
      resetStore,
    ]
  );

  return isShowReCaptcha ? (
    <Recaptcha ref={recaptchaRef} onSuccess={handleSuccessCaptcha} />
  ) : null;
};

export default CaptchaModal;
