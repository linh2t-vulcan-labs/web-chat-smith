"use client";

import { useEffect, useRef } from "react";

import useLocalStorage from "@/hooks/use-local-storage";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import type { EAUTH_PROVIDER } from "@/utils/commons/enums";
import { EAUTH_SOURCE } from "@/utils/commons/enums";
import { clearAuthTime, localStorageImpl } from "@/utils/commons/helpers";
import {
  LOCAL_STORAGE_KEY,
  SIGNIN_SOURCE_PATH_KEY,
  SIGNIN_TIME_KEY,
  USER_ID_KEY,
} from "@/utils/commons/keys";
import { HOME_URL, LOGIN_PAGE_URL } from "@/utils/constants/url";

// Type definition for guest store data structure
export interface GuestStoreState {
  deviceId: string;
  sessionId: string;
  anonId: string;
  accessToken: string;
}

export const useInitSession = () => {
  const hasInitializedRef = useRef(false);

  const isNewUser = useAuthState((state) => state.isNewUser);
  const authProvider = useAuthState((state) => state.provider);
  const authSource = useAuthState((state) => state.source);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const [userId] = useLocalStorage<string>(USER_ID_KEY);

  const setIsNewUser = useAuthState((state) => state.setIsNewUser);
  useEffect(() => {
    const signInTime = localStorageImpl.load<string>(SIGNIN_TIME_KEY);

    if (!signInTime || signInTime === "0" || !userId) {
      return;
    }

    // Check if user signed in from login page
    const signInSourcePath = localStorageImpl.load<string>(
      SIGNIN_SOURCE_PATH_KEY
    );
    const isFromLoginPage = signInSourcePath === LOGIN_PAGE_URL;
    const isFromHome = signInSourcePath === HOME_URL;

    // Extract anonId from guest store data
    const guestStoreData = localStorageImpl.load<{
      state: GuestStoreState;
      version: number;
    }>(LOCAL_STORAGE_KEY.GUEST_STORE_DATA);
    const anonId = guestStoreData?.state?.anonId || null;

    // Determine if this is a guest conversion (guest user signing up/in)
    const isGuestConversion = anonId && !isFromLoginPage && !isFromHome;
    const signInSource = (authSource as EAUTH_SOURCE) || EAUTH_SOURCE.DEFAULT;

    // Send appropriate tracking event based on user type and source

    if (isNewUser && isGuestConversion) {
      sendTrackingEvent({
        name: EventKeys.GuestSignUpSuccess,
        payload: {
          guest_id: anonId,
          signin_method: authProvider as EAUTH_PROVIDER,
          signin_source: signInSource,
          signin_time: signInTime,
          vulcan_user_id: userId,
        },
      });
    } else if (isNewUser) {
      sendTrackingEvent({
        name: EventKeys.SignUpSuccess,
        payload: {
          signin_method: authProvider as EAUTH_PROVIDER,
          signin_source: signInSource,
          signin_time: signInTime,
          vulcan_user_id: userId,
        },
      });
    } else if (isGuestConversion) {
      sendTrackingEvent({
        name: EventKeys.GuestSignInSuccess,
        payload: {
          guest_id: anonId,
          signin_method: authProvider as EAUTH_PROVIDER,
          signin_source: signInSource,
          signin_time: signInTime,
          vulcan_user_id: userId,
        },
      });
    } else {
      sendTrackingEvent({
        name: EventKeys.SignInSuccess,
        payload: {
          signin_method: authProvider as EAUTH_PROVIDER,
          signin_source: signInSource,
          signin_time: signInTime,
          vulcan_user_id: userId,
        },
      });
    }
    setIsNewUser(false);
    clearAuthTime();
    hasInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewUser, authProvider, authSource, userId]);
};
