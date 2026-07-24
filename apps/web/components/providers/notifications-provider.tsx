"use client";

import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { jwtDecode } from "@cs/core/jwt";
import type { JwtPayload } from "@cs/core/jwt";
import { getRuntimeEnv } from "@cs/env/universal";
import { registerFcmTokenWithApiClient } from "@cs/notifications/integrations/api-client";
import { NotificationsProvider as NotificationsProviderImpl } from "@cs/notifications/react";

import { firebaseApp } from "@/lib/firebase";

/**
 * The backend derives the signed-in user from the session's access token
 * (see `registerFcmTokenWithApiClient`, which takes no user id), so `sub` is
 * only needed here as a per-user dedup key — to rekey the FCM token cached
 * in `localStorage` when a different user signs in on the same device.
 * Falls back to `null` (treated as "no dedup needed") if the token doesn't
 * carry a `sub`, rather than throwing.
 */
const decodeUserId = (accessToken: string): string | null => {
  try {
    return jwtDecode<JwtPayload>(accessToken).sub ?? null;
  } catch {
    return null;
  }
};

/**
 * Must render inside `ApiAuthProvider` — it binds FCM tokens to the app's
 * own backend session (`isAuthenticated`/`accessToken`), not a live Firebase
 * Auth subscription: Firebase Auth here is only used transiently, at
 * sign-in, to obtain an idToken that gets exchanged for this session (see
 * `components/auth/sign-in-with-google-button.tsx`) — nothing needs a
 * standing `onAuthStateChanged` listener afterward.
 */
export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { accessToken, isAuthenticated } = useApiAuth();
  const userId = accessToken ? decodeUserId(accessToken) : null;
  const vapidKey = getRuntimeEnv().CS_PUBLIC_FIREBASE_VAPID_KEY;

  if (!vapidKey) {
    return children;
  }

  return (
    <NotificationsProviderImpl
      app={firebaseApp()}
      // Registering with the backend requires an authenticated session — a
      // signed-out visitor who already granted browser notification
      // permission would otherwise trigger a token-refresh attempt (and a
      // 401, since there's no refresh_token cookie yet) on every load.
      onToken={isAuthenticated ? registerFcmTokenWithApiClient : undefined}
      userId={userId}
      vapidKey={vapidKey}
    >
      {children}
    </NotificationsProviderImpl>
  );
};
