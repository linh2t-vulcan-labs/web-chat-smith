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
const decodeUserId = (accessToken: string | null): string | null => {
  if (!accessToken) {
    return null;
  }
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
  const { accessToken, isAuthenticated, isInitializing } = useApiAuth();
  const userId = decodeUserId(accessToken);
  const vapidKey = getRuntimeEnv().CS_PUBLIC_FIREBASE_VAPID_KEY;

  // `ApiAuthProvider` starts every fresh mount with `accessToken: null`
  // before its restore effect resolves the real value a moment later — on a
  // genuine cold load (page reload), this component (mounted once in the
  // locale-independent root `app/layout.tsx`, see that file's comment) would
  // otherwise see a momentarily wrong `userId: null` first, which
  // `syncFcmToken`'s dedup check (comparing against the last-synced value in
  // `tokenStore`) reads as "changed" — once for the spurious `null`, again
  // when `userId` flips back to the real value a moment later —
  // re-registering the SAME token with the backend twice for no reason.
  // Waiting for `isInitializing` to settle means `userId` is already correct
  // on this component's first real render, so the dedup check sees
  // "unchanged" and skips both calls.
  const isNotSetUpYet = !vapidKey || isInitializing;
  if (isNotSetUpYet) {
    return children;
  }

  // Registering with the backend requires an authenticated session — a
  // signed-out visitor who already granted browser notification permission
  // would otherwise trigger a token-refresh attempt (and a 401, since
  // there's no refresh_token cookie yet) on every load.
  const onToken = isAuthenticated ? registerFcmTokenWithApiClient : undefined;

  return (
    <NotificationsProviderImpl
      app={firebaseApp()}
      onToken={onToken}
      userId={userId}
      vapidKey={vapidKey}
    >
      {children}
    </NotificationsProviderImpl>
  );
};
