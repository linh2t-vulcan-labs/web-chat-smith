import { useLocale } from "next-intl";
import { toast } from "sonner";

import { VerifyOAuthTokenModel } from "@/core/models/signin";
import { internalVerifyToken } from "@/libs/auth-v2/functions/internal-verify-token";
import { CORALOGIX_LABELS } from "@/libs/coralogix";
import type { FirebaseError } from "@/libs/firebase";
import { getFirebaseAuth, signInWithPopup } from "@/libs/firebase";
import { getAuthProvider } from "@/libs/firebase/utils";
import { useMutation } from "@/libs/react-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { decodeFirebaseToken } from "@/utils/commons/auth";
import type { EAUTH_PROVIDER, EAUTH_SOURCE } from "@/utils/commons/enums";
import { getCallbackUrl, localStorageImpl } from "@/utils/commons/helpers";
import {
  LOCAL_STORAGE_KEY,
  SIGNIN_SOURCE_PATH_KEY,
  USER_ID_KEY,
} from "@/utils/commons/keys";
import { Logger } from "@/utils/commons/logger";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import useLocalStorage from "../use-local-storage";

interface TSignInInput {
  provider: EAUTH_PROVIDER;
  source: EAUTH_SOURCE;
  callbackUrl?: string;
  /**
   * Optional Firebase ID token credential (e.g., from Google One Tap).
   * If provided, skips the popup flow and uses this token directly.
   */
  tokenCredential?: string;
}

export const useMutationSignIn = () => {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const [userId] = useLocalStorage<string>(USER_ID_KEY);
  const locale = useLocale();

  const isAuthenticated = !!userId;

  return useMutation({
    mutationFn: async (input: TSignInInput) => {
      const { provider, tokenCredential } = input;

      // Store the current path to determine if user is signing in from /login
      const currentPath = globalThis.location.pathname;
      localStorageImpl.save(SIGNIN_SOURCE_PATH_KEY, currentPath);

      let idToken: string | undefined;

      if (tokenCredential) {
        // Direct token credential provided (e.g., from Google One Tap)
        idToken = tokenCredential;
      } else {
        // Use popup flow
        const authProvider = getAuthProvider(provider);
        authProvider.addScope("email");
        const firebaseAuth = getFirebaseAuth();
        firebaseAuth.languageCode = locale;
        const response = await signInWithPopup(firebaseAuth, authProvider);
        const { user } = response;
        idToken = await user.getIdToken();
      }

      const defaultVerifyOAuthTokenModel = new VerifyOAuthTokenModel();

      if (idToken) {
        const { authProvider } = await decodeFirebaseToken(idToken);

        // Use provided callbackUrl or fallback to reading from URL
        const callbackUrl = input.callbackUrl || getCallbackUrl();

        const [error, result] = await internalVerifyToken(
          idToken,
          authProvider
        );

        if (error) {
          return { url: LOGIN_PAGE_URL, ...defaultVerifyOAuthTokenModel };
        }

        return { url: callbackUrl, ...result };
      }

      return { url: LOGIN_PAGE_URL, ...defaultVerifyOAuthTokenModel };
    },
    mutationKey: ["useMutationSignIn", locale, isAuthenticated],
    onError: (error: FirebaseError, input) => {
      const { provider, source } = input;
      const logger = new Logger(CORALOGIX_LABELS.AUTHEN_REQUEST);

      logger.sendError(error);

      const guestState = localStorageImpl.load<{
        state: {
          anonId: string | null;
          [key: string]: unknown;
        };
        version: number;
      }>(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);

      const anonId = guestState?.state?.anonId || "";

      const handleError = (message: string) => {
        if (isAuthenticated) {
          sendTrackingEvent({
            name: EventKeys.SignInFailed,
            payload: {
              signin_failed_reason: message,
              signin_method: provider,
              signin_source: source,
            },
          });
        } else {
          sendTrackingEvent({
            name: EventKeys.GuestSignInFailed,
            payload: {
              guest_id: anonId,
              signin_failed_reason: message,
              signin_method: provider,
              signin_source: source,
            },
          });
        }

        toast.error(null, {
          description:
            "We encountered an unexpected error. Please try again later",
        });
      };

      if (error?.code) {
        if (error.code === "auth/account-exists-with-different-credential") {
          return;
        }

        if (error.code === "auth/popup-closed-by-user") {
          return;
        }

        handleError(error.code);
        return;
      }

      handleError(error.message);
    },
  });
};
