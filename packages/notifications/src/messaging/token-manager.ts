import type { Messaging } from "firebase/messaging";

import type { TokenStore } from "./token-store";

export interface SyncFcmTokenOptions {
  messaging: Messaging;
  vapidKey: string;
  serviceWorkerRegistration?: ServiceWorkerRegistration;
  /** The signed-in user this token should be bound to, or `null` if signed out. */
  userId: string | null;
  store: TokenStore;
  /** Called only when the token or bound user actually changed since the last sync. */
  onToken?: (token: string) => Promise<void> | void;
}

/**
 * Fetches the current FCM token and, only if it (or the bound user) changed
 * since the last sync, calls `onToken` and persists it. Returns `null` if
 * messaging isn't available or the token couldn't be fetched — never throws.
 */
export const syncFcmToken = async (
  options: SyncFcmTokenOptions
): Promise<string | null> => {
  const {
    messaging,
    vapidKey,
    serviceWorkerRegistration,
    userId,
    store,
    onToken,
  } = options;

  const { getToken } = await import("firebase/messaging");
  let currentToken: string;
  try {
    currentToken = await getToken(messaging, {
      serviceWorkerRegistration,
      vapidKey,
    });
  } catch {
    return null;
  }
  if (!currentToken) {
    return null;
  }

  const changed =
    store.getUserId() !== userId || store.getToken() !== currentToken;
  if (changed) {
    await onToken?.(currentToken);
    store.save(currentToken, userId);
  }
  return currentToken;
};

export interface ClearFcmTokenOptions {
  messaging: Messaging;
  store: TokenStore;
  /** Called with the token being removed, before local state is cleared. */
  onTokenRemoved?: (token: string) => Promise<void> | void;
}

export const clearFcmToken = async (
  options: ClearFcmTokenOptions
): Promise<void> => {
  const { messaging, store, onTokenRemoved } = options;
  const { deleteToken } = await import("firebase/messaging");
  const storedToken = store.getToken();
  try {
    await deleteToken(messaging);
  } catch {
    // Best-effort: still clear local state even if the server-side delete failed.
  }
  if (storedToken) {
    await onTokenRemoved?.(storedToken);
  }
  store.clear();
};
