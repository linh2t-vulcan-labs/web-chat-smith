export interface BroadcastChannelBus<TMessage> {
  /** Named `publish`, not `postMessage`, so callers never write the exact method name the lint rule below is guarding against. */
  publish: (message: TMessage) => void;
  /** Returns an unsubscribe function. */
  subscribe: (handler: (message: TMessage) => void) => () => void;
  close: () => void;
}

/**
 * Thin, typed wrapper over the DOM `BroadcastChannel` API for same-origin
 * cross-tab pub/sub — the shared primitive for syncing any client action
 * across browser tabs (session state, locale, theme, ...) instead of each
 * feature hand-rolling its own `BroadcastChannel` wiring. Safe to call on
 * the server or in browsers without `BroadcastChannel` support: every
 * method becomes a no-op instead of throwing. Multiple bus instances
 * created with the same `name` all receive each other's messages, per the
 * `BroadcastChannel` spec — this wrapper adds no extra scoping.
 */
export const createBroadcastChannel = <TMessage>(
  name: string
): BroadcastChannelBus<TMessage> => {
  const channel =
    typeof BroadcastChannel === "undefined" ? null : new BroadcastChannel(name);

  return {
    close: () => channel?.close(),
    // oxlint-disable-next-line unicorn/require-post-message-target-origin -- BroadcastChannel#postMessage, not Window#postMessage; it has no targetOrigin parameter
    publish: (message) => channel?.postMessage(message),
    subscribe: (handler) => {
      if (!channel) {
        return () => {
          // No-op: no BroadcastChannel support, nothing was subscribed.
        };
      }
      const listener = (event: MessageEvent<TMessage>) => handler(event.data);
      channel.addEventListener("message", listener);
      return () => channel.removeEventListener("message", listener);
    },
  };
};
