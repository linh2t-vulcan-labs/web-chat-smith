"use client";

import { createBroadcastChannel } from "@cs/core/broadcast";
import { useEffect, useRef } from "react";

/**
 * Subscribes to a same-origin cross-tab channel and returns a stable
 * publish function — the shared primitive for syncing any client action
 * across browser tabs (locale, theme, session state, ...) so a new use case
 * doesn't need to hand-roll its own `BroadcastChannel` wiring (see
 * `@cs/api-client`'s `TokenManager`, the first consumer of this pattern).
 *
 * The channel is created and closed INSIDE the effect (not via `useState`)
 * so a mount->cleanup->mount cycle — React Strict Mode's dev-only double
 * effect invocation, or a genuine remount from e.g. a locale switch
 * remounting everything under `[locale]/layout.tsx` — always closes and
 * reopens the SAME instance it just created. A `useState`-held channel
 * would persist across that cycle while still getting `close()`d by the
 * extra cleanup, leaving it permanently dead: `BroadcastChannel` has no
 * "reopen" — once closed, `subscribe`/`publish` silently or loudly no-op.
 *
 * `onMessage` is read through a ref, so every incoming message calls the
 * latest render's closure even though the subscription is only set up once
 * per `name`.
 */
export const useBroadcastChannel = <TMessage>(
  name: string,
  onMessage: (message: TMessage) => void
): ((message: TMessage) => void) => {
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const busRef =
    useRef<ReturnType<typeof createBroadcastChannel<TMessage>>>(null);

  useEffect(() => {
    const bus = createBroadcastChannel<TMessage>(name);
    busRef.current = bus;
    const unsubscribe = bus.subscribe((message) =>
      onMessageRef.current(message)
    );
    return () => {
      unsubscribe();
      bus.close();
      busRef.current = null;
    };
  }, [name]);

  return (message: TMessage) => {
    busRef.current?.publish(message);
  };
};
