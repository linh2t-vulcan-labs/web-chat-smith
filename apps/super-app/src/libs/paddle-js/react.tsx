"use client";

import type {
  CheckoutLineItem,
  CheckoutOpenOptions,
  InitializePaddleOptions,
  Paddle,
  PaddleEventData,
  PaddleSetupOptions,
} from "@paddle/paddle-js";
import { initializePaddle } from "@paddle/paddle-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Unsubscribe = () => void;

/**
 * React hook for Paddle.js integration
 * Initializes Paddle on mount and provides checkout methods
 */
export function usePaddle(initConfig: InitializePaddleOptions | null) {
  const [paddle, setPaddle] = useState<Paddle | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubscribers = useRef<Unsubscribe[]>([]);
  const paddleRef = useRef<Paddle | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!initConfig) {
      // oxlint-disable-next-line react/react-compiler -- resets Paddle state when initConfig becomes null (e.g. checkout closed); synchronizing with external Paddle SDK lifecycle, not deriving render state
      setReady(false);
      setPaddle(null);
      return;
    }

    if (paddleRef.current) {
      return;
    }

    const initialize = async () => {
      try {
        const paddleInstance = await initializePaddle(initConfig);
        if (isMounted && paddleInstance) {
          paddleRef.current = paddleInstance;
          setPaddle(paddleInstance);
          setReady(true);
          setError(null);
        }
      } catch (error) {
        if (isMounted) {
          setReady(false);
          setError(error instanceof Error ? error : new Error(String(error)));
        }
      }
    };

    initialize();

    return () => {
      isMounted = false;

      // Close active checkout to avoid stale instance state on re-init/unmount.
      if (paddleRef.current) {
        try {
          paddleRef.current.Checkout.close();
        } catch {
          /* noop */
        }
      }
      paddleRef.current = null;

      // cleanup any event subscriptions on unmount
      for (const unsub of unsubscribers.current) {
        try {
          unsub();
        } catch {
          /* noop */
        }
      }
      unsubscribers.current = [];
    };
  }, [initConfig]);

  const subscribe = useCallback(
    (
      eventName: string,
      handler: (payload: PaddleEventData) => void
    ): (() => void) => {
      if (!paddle) {
        // Intentional no-op unsubscribe: nothing was subscribed.
        return () => {
          /* noop */
        };
      }

      // Paddle doesn't have an 'on' method exposed directly in the official types
      // But we can use the eventCallback in Initialize/Update instead
      // For now, we'll return a no-op
      // Users should use eventCallback in initConfig instead
      console.warn(
        `Direct Paddle subscription for "${eventName}" is not available; use eventCallback in initConfig instead.`,
        handler
      );
      // Intentional no-op unsubscribe: no real subscription was made.
      return () => {
        /* noop */
      };
    },
    [paddle]
  );

  const open = useCallback(
    (config: CheckoutOpenOptions) => {
      if (!ready || !paddle) {
        console.warn("Paddle not ready yet");
        return;
      }
      return paddle.Checkout.open(config);
    },
    [ready, paddle]
  );

  const update = useCallback(
    (config: Partial<PaddleSetupOptions>) => {
      if (!ready || !paddle) {
        return;
      }
      paddle.Update(config);
    },
    [ready, paddle]
  );

  const updateItems = useCallback(
    (items: CheckoutLineItem[]) => {
      if (!ready || !paddle) {
        return;
      }
      paddle.Checkout.updateItems(items);
    },
    [ready, paddle]
  );

  const close = useCallback(() => {
    if (!ready || !paddle) {
      return;
    }
    paddle.Checkout.close();
  }, [ready, paddle]);

  const showSpinner = useCallback(() => {
    if (!ready || !paddle) {
      return;
    }
    paddle.Spinner.show();
  }, [ready, paddle]);

  const hideSpinner = useCallback(() => {
    if (!ready || !paddle) {
      return;
    }
    paddle.Spinner.hide();
  }, [ready, paddle]);

  return useMemo(
    () => ({
      close,
      error,
      hideSpinner,
      open,
      paddle,
      ready,
      showSpinner,
      subscribe,
      update,
      updateItems,
    }),
    [
      paddle,
      ready,
      error,
      subscribe,
      open,
      update,
      updateItems,
      close,
      showSpinner,
      hideSpinner,
    ]
  );
}
