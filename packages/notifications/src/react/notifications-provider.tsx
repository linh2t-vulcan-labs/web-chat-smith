"use client";

import type { FirebaseApp } from "firebase/app";
import type { MessagePayload } from "firebase/messaging";
import { createContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { getMessagingClient } from "../messaging/client";
import { onForegroundMessage } from "../messaging/foreground-listener";
import { syncFcmToken } from "../messaging/token-manager";
import { createLocalStorageTokenStore } from "../messaging/token-store";
import type { TokenStore } from "../messaging/token-store";
import {
  getPermissionState,
  requestPermission,
} from "../permission/permission-manager";
import type { NotificationPermissionState } from "../permission/permission-manager";

export interface NotificationsContextValue {
  permissionState: NotificationPermissionState;
  token: string | null;
  requestPermission: () => Promise<void>;
}

export const NotificationsContext =
  createContext<NotificationsContextValue | null>(null);

export interface NotificationsProviderProps {
  app: FirebaseApp;
  vapidKey: string;
  serviceWorkerRegistration?: ServiceWorkerRegistration;
  /** The current signed-in user's id (e.g. decoded from the app's session token), or `null`. */
  userId: string | null;
  /** Called only when the token (or bound user) actually changed — e.g. register it with your backend. */
  onToken?: (token: string) => Promise<void> | void;
  /** Called for every foreground FCM message. UI reaction (toast, cache update) is up to the caller. */
  onMessage?: (payload: MessagePayload) => void;
  tokenStore?: TokenStore;
  children: ReactNode;
}

interface TokenSyncParams {
  app: FirebaseApp;
  vapidKey: string;
  serviceWorkerRegistration?: ServiceWorkerRegistration;
  userId: string | null;
  store: TokenStore;
  onToken?: (token: string) => Promise<void> | void;
}

/**
 * Module-scope (not a closure over component state) so `useEffect`/event
 * handlers can depend on plain props instead of a freshly-created function
 * every render.
 */
const performTokenSync = async (
  params: TokenSyncParams
): Promise<string | null> => {
  const messaging = await getMessagingClient(params.app);
  if (!messaging) {
    return null;
  }
  return await syncFcmToken({ messaging, ...params });
};

/**
 * The default store has no per-instance state (it's a fixed-namespace
 * localStorage wrapper), so one shared instance is created here instead of
 * per component — avoids a fresh object identity (and a re-triggered token
 * sync effect) on every render whenever a caller doesn't pass `tokenStore`.
 */
const defaultTokenStore = createLocalStorageTokenStore();

/**
 * Module-scope, keyed by `(app, vapidKey, userId)` — mirrors the dedup
 * pattern `FlagsProvider` (apps/web) uses for Remote Config: once one mount
 * has kicked off a sync for a given key, a remount of this provider for the
 * SAME key (e.g. this whole subtree remounting on a locale switch — see
 * `app/[locale]/(workspace)/layout.tsx`'s comment) reuses the in-flight/
 * resolved promise instead of calling the underlying `firebase/messaging`
 * `getToken()` SDK again, which always re-hits Firebase's Installations/FCM
 * Registrations endpoints even when the resulting token doesn't change.
 * `syncFcmToken`'s own dedup (comparing against `tokenStore`) only gates the
 * `onToken` backend-registration callback, not this SDK call itself.
 */
let cachedTokenSync: { key: string; promise: Promise<string | null> } | null =
  null;

const tokenSyncKey = (params: TokenSyncParams): string =>
  `${params.app.name}:${params.vapidKey}:${params.userId ?? ""}`;

const getOrSyncFcmToken = (params: TokenSyncParams): Promise<string | null> => {
  const key = tokenSyncKey(params);
  if (cachedTokenSync?.key === key) {
    return cachedTokenSync.promise;
  }
  const promise = performTokenSync(params);
  cachedTokenSync = { key, promise };
  return promise;
};

/**
 * Owns FCM token lifecycle and notification permission state only — no
 * toast/dialog UI state, no cache writes, no permission-reminder timing
 * rules. Those are app-level policy layered on top via `useNotifications()`.
 */
export const NotificationsProvider = ({
  app,
  vapidKey,
  serviceWorkerRegistration,
  userId,
  onToken,
  onMessage,
  tokenStore = defaultTokenStore,
  children,
}: NotificationsProviderProps) => {
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>(() => getPermissionState());
  const [token, setToken] = useState<string | null>(null);

  // Latest-value refs for the two callback props: both are commonly passed as
  // inline arrow functions, so putting them directly in an effect's deps
  // would re-run that effect (and, for `onToken`, re-fetch the FCM token)
  // every render just because the reference changed. Synced via an effect
  // (not during render) since React Compiler forbids ref writes in the render body.
  const onTokenRef = useRef(onToken);
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onTokenRef.current = onToken;
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (getPermissionState() !== "granted") {
      return;
    }
    let cancelled = false;
    void (async () => {
      const nextToken = await getOrSyncFcmToken({
        app,
        onToken: onTokenRef.current,
        serviceWorkerRegistration,
        store: tokenStore,
        userId,
        vapidKey,
      });
      if (!cancelled) {
        setToken(nextToken);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [app, serviceWorkerRegistration, tokenStore, userId, vapidKey]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const messaging = await getMessagingClient(app);
      if (cancelled || !messaging) {
        return;
      }
      unsubscribe = onForegroundMessage(messaging, (payload) =>
        onMessageRef.current?.(payload)
      );
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [app]);

  const requestPermissionAndSync = async (): Promise<void> => {
    const result = await requestPermission();
    setPermissionState(result);
    if (result === "granted") {
      const nextToken = await getOrSyncFcmToken({
        app,
        onToken,
        serviceWorkerRegistration,
        store: tokenStore,
        userId,
        vapidKey,
      });
      setToken(nextToken);
    }
  };

  const value: NotificationsContextValue = {
    permissionState,
    requestPermission: requestPermissionAndSync,
    token,
  };

  // eslint-disable-next-line react/jsx-no-constructed-context-values -- handled by React Compiler
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
};
