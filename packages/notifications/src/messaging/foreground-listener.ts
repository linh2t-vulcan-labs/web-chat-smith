import type { Messaging, MessagePayload } from "firebase/messaging";

/**
 * Subscribes to foreground FCM messages. Returns an unsubscribe function.
 * Deliberately just a thin wrapper — what to do with a payload (update a
 * cache, show a toast) is app-level UI policy, not this package's concern.
 * `firebase/messaging` is dynamically imported (see `getMessagingClient`) so
 * subscribing here doesn't pull the SDK into the initial bundle.
 */
export const onForegroundMessage = (
  messaging: Messaging,
  handler: (payload: MessagePayload) => void
): (() => void) => {
  let unsubscribe: (() => void) | undefined;
  let cancelled = false;
  const subscribe = async () => {
    const { onMessage } = await import("firebase/messaging");
    if (!cancelled) {
      unsubscribe = onMessage(messaging, handler);
    }
  };
  void subscribe();
  return () => {
    cancelled = true;
    unsubscribe?.();
  };
};
