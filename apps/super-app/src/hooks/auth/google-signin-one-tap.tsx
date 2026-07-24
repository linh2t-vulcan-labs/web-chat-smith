"use client";

import { toast } from "sonner";

import { WEB_FEATURE_CONFIG_KEYS } from "@/config/web-features";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import type { GuestStoreState } from "@/store/global/initialization-hooks/use-init-session";
import { EAUTH_PROVIDER, EAUTH_SOURCE } from "@/utils/commons/enums";
import { localStorageImpl } from "@/utils/commons/helpers";
import { LOCAL_STORAGE_KEY } from "@/utils/commons/keys";
import { HOME_URL } from "@/utils/constants/url";

import { GoogleAuthScript } from "../../libs/google/script";
import { useFeatureSetting } from "../feature-setting/use-feature-setting";
import { useGoogleSigninOneTap } from "./use-google-signin-one-tap";

function getSignInSourcePath() {
  const signInSourcePath = globalThis.location.pathname;
  const isFromHome = signInSourcePath === HOME_URL;
  return {
    isFromHome,
  };
}

export function GoogleSigninOneTap() {
  const signInWithProvider = useAuthState((state) => state.signInWithProvider);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const isAuthenticated = useAuthState((state) => state.isAuthenticated);

  const { isEnabled } = useFeatureSetting(
    WEB_FEATURE_CONFIG_KEYS.SIGN_IN_ONE_TAP
  );

  const isEnableGoogleSigninOneTap = isEnabled && !isAuthenticated;

  function getIsGuestEvent() {
    // Extract anonId from guest store data
    const guestStoreData = localStorageImpl.load<{
      state: GuestStoreState;
      version: number;
    }>(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);
    const anonId = guestStoreData?.state?.anonId || null;
    const { isFromHome } = getSignInSourcePath();
    const isGuestEvent = anonId && !isFromHome;
    return { anonId: anonId || "", isGuestEvent };
  }

  function sendSignInStartEvent() {
    const { isGuestEvent, anonId } = getIsGuestEvent();
    if (isGuestEvent) {
      sendTrackingEvent({
        name: EventKeys.GuestSignInStart,
        payload: {
          guest_id: anonId || "",
          signin_source: EAUTH_SOURCE.GOOGLE_ONE_TAP,
        },
      });
    } else {
      sendTrackingEvent({
        name: EventKeys.SignInStart,
        payload: {
          signin_method: EAUTH_PROVIDER.GOOGLE,
          signin_source: EAUTH_SOURCE.GOOGLE_ONE_TAP,
        },
      });
    }
  }

  function sendSignInFailEvent(errorMsg: string) {
    const { isGuestEvent, anonId } = getIsGuestEvent();
    if (isGuestEvent) {
      sendTrackingEvent({
        name: EventKeys.GuestSignInFailed,
        payload: {
          guest_id: anonId,
          signin_failed_reason: errorMsg,
          signin_method: EAUTH_PROVIDER.GOOGLE,
          signin_source: EAUTH_SOURCE.GOOGLE_ONE_TAP,
        },
      });
    } else {
      sendTrackingEvent({
        name: EventKeys.SignInFailed,
        payload: {
          signin_failed_reason: errorMsg,
          signin_method: EAUTH_PROVIDER.GOOGLE,
          signin_source: EAUTH_SOURCE.GOOGLE_ONE_TAP,
        },
      });
    }
  }

  const handleGoogleSigninOneTapSuccess = async (firebaseIdToken: string) => {
    await signInWithProvider(
      EAUTH_PROVIDER.GOOGLE,
      firebaseIdToken,
      EAUTH_SOURCE.GOOGLE_ONE_TAP
    );
  };

  const handleGoogleSigninOneTapStart = () => {
    sendSignInStartEvent();
  };
  const handleGoogleSigninOneTapError = (error: Error) => {
    const errorMessage =
      typeof error?.message === "string" ? error.message : "Unknown error";
    sendSignInFailEvent(errorMessage);
    toast.error(null, {
      description: "We encountered an unexpected error. Please try again later",
    });
  };

  useGoogleSigninOneTap({
    isEnabled: isEnableGoogleSigninOneTap,
    onError: handleGoogleSigninOneTapError,
    onStart: handleGoogleSigninOneTapStart,
    onSuccess: handleGoogleSigninOneTapSuccess,
  });
  return isEnableGoogleSigninOneTap ? <GoogleAuthScript /> : null;
}
