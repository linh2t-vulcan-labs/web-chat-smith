import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { useCallback, useEffect } from "react";

import { getFirebaseAuth } from "@/libs/firebase";
import type {
  TGoogleCredentialResponse,
  TPromptMomentNotification,
} from "@/libs/google";
import { googleSignInOneTap } from "@/libs/google";

interface UseGoogleSigninOneTapOptions {
  isEnabled?: boolean;
  autoSelect?: boolean;
  onSuccess?: (firebaseIdToken: string) => void | Promise<void>;
  onError?: (error: Error) => void;
  onStart?: () => void;
  /**
   * Use FedCM for the prompt.
   * Set to false for localhost development to avoid CORS issues.
   * @default true for production domains, false for localhost
   */
  useFedCM?: boolean;
}

export const useGoogleSigninOneTap = (
  options?: UseGoogleSigninOneTapOptions
) => {
  const {
    autoSelect = false,
    isEnabled = false,
    onSuccess,
    onError,
    onStart,
    useFedCM,
  } = options || {};

  const handleCredentialResponse = (response: TGoogleCredentialResponse) => {
    void (async () => {
      try {
        onStart?.();
        const credential = GoogleAuthProvider.credential(response.credential);
        const userCredential = await signInWithCredential(
          getFirebaseAuth(),
          credential
        );
        const { user } = userCredential;

        let idToken: string;

        try {
          idToken = await user.getIdToken();
        } catch (tokenError) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              "[Google One Tap] Retrying Firebase token retrieval",
              tokenError
            );
          }

          idToken = await user.getIdToken(true);
        }

        await onSuccess?.(idToken);
      } catch (error) {
        const handledError =
          error instanceof Error
            ? error
            : new Error("Unknown Google sign-in error");

        console.error(
          "[Google One Tap] Failed to sign in with credential",
          handledError
        );

        onError?.(handledError);
      }
    })();
  };

  const handlePromptMoment = useCallback(
    (notification: TPromptMomentNotification) => {
      // You can add custom logic here based on the notification
      if (notification.isNotDisplayed()) {
        console.warn(
          "[Google One Tap] Prompt not displayed:",
          notification.getNotDisplayedReason()
        );
      }
    },
    []
  );

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const timeout = setTimeout(() => {
      googleSignInOneTap({
        autoSelect,
        context: "signin",
        handleCredentialResponse,
        onPromptMoment: handlePromptMoment,
        useFedCM,
      });
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSelect, useFedCM, isEnabled]);
};
