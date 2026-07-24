import { useCallback, useEffect, useRef } from "react";

import { useGuestState } from "../stores/guest-mode/hooks";
import { useInitGuestMode } from "./use-init-guest-mode/use-init-guest-mode";

const VERIFICATION_TIMEOUT_MS = 15_000;

/**
 * Custom hook to handle guest captcha verification with timeout
 * Follows Single Responsibility Principle - only handles verification logic
 */
export function useGuestVerification() {
  const isShowCaptchaModal = useGuestState((state) => state.isShowCaptchaModal);
  const setIsVerifiedCaptcha = useGuestState(
    (state) => state.setIsVerifiedCaptcha
  );
  const setVerificationError = useGuestState(
    (state) => state.setVerificationError
  );
  const setIsShowCaptchaModal = useGuestState(
    (state) => state.setIsShowCaptchaModal
  );

  const { checkCaptchaVerification } = useInitGuestMode();
  const hasVerified = useRef(false);

  const verify = useCallback(async () => {
    if (hasVerified.current) {
      return;
    }
    hasVerified.current = true;

    // Fast path: user already has token
    if (!isShowCaptchaModal) {
      setIsVerifiedCaptcha(true);
      return;
    }

    setVerificationError(null);

    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      setTimeout(
        () => reject(new Error("Verification timeout")),
        VERIFICATION_TIMEOUT_MS
      );
    });

    try {
      const isVerified = await Promise.race([
        checkCaptchaVerification(),
        timeoutPromise,
      ]);
      setIsVerifiedCaptcha(isVerified);

      if (!isVerified) {
        setIsShowCaptchaModal(true);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Verification failed";
      // console.error("[useGuestVerification]", errorMessage);
      setVerificationError(errorMessage);
      setIsVerifiedCaptcha(false);
      setIsShowCaptchaModal(true);
    }
  }, [
    isShowCaptchaModal,
    setIsVerifiedCaptcha,
    setVerificationError,
    setIsShowCaptchaModal,
    checkCaptchaVerification,
  ]);

  useEffect(() => {
    verify();
  }, [verify]);
}
