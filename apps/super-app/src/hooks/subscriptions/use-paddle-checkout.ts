import type {
  CheckoutOpenOptions,
  Paddle,
  PaddleEventData,
  PaddleSetupOptions,
} from "@paddle/paddle-js";
import { useEffect, useState } from "react";

import {
  buildInitializeConfig,
  createCheckoutEventCallback,
  initializePaddle,
  PADDLE_EVENTS,
  paddleManager,
} from "@/libs/paddle-js";
import type { CheckoutEventHandlers } from "@/libs/paddle-js";

export type PaddleFlow =
  | "subscriptionCheckout"
  | "updatePaymentMethod"
  | "expressCheckout";

const flowHandlers: Partial<Record<PaddleFlow, CheckoutEventHandlers>> = {};
let activeFlow: PaddleFlow | null = null;
let paddleInstance: Paddle | null = null;
let paddleReady = false;
let initPromise: Promise<void> | null = null;

const readyListeners = new Set<(ready: boolean) => void>();

function notifyReadyListeners() {
  for (const listener of readyListeners) {
    listener(paddleReady);
  }
}

function routeEventToActiveFlow(event: PaddleEventData) {
  const currentFlow = activeFlow;

  if (!currentFlow) {
    return;
  }

  const handlers = flowHandlers[currentFlow];

  if (!handlers) {
    return;
  }

  createCheckoutEventCallback(handlers)(event);

  if (event.name === PADDLE_EVENTS.CHECKOUT_CLOSED) {
    activeFlow = null;
  }
}

async function runInitializePaddle() {
  try {
    const instance = await initializePaddle(
      buildInitializeConfig({
        eventCallback: routeEventToActiveFlow,
      })
    );

    if (!instance) {
      paddleReady = false;
      notifyReadyListeners();
      return;
    }

    paddleInstance = instance;
    paddleReady = true;

    paddleManager.registerCloseFunction(() => {
      paddleInstance?.Checkout.close();
    });
    notifyReadyListeners();
  } catch (error) {
    paddleReady = false;
    notifyReadyListeners();
    console.error("Failed to initialize Paddle", error);
  } finally {
    initPromise = null;
  }
}

function initializePaddleOnce() {
  if (paddleInstance !== null || initPromise !== null) {
    return;
  }

  initPromise = runInitializePaddle();
}

function setFlowHandlersForCheckout(
  flow: PaddleFlow,
  handlers: CheckoutEventHandlers
) {
  flowHandlers[flow] = handlers;
}

function clearFlowHandlersForCheckout(flow: PaddleFlow) {
  flowHandlers[flow] = undefined;
}

function openCheckoutForFlow(flow: PaddleFlow, options: CheckoutOpenOptions) {
  if (!paddleInstance || !paddleReady) {
    return false;
  }

  activeFlow = flow;

  paddleInstance.Checkout.open(options);
  return true;
}

function closeCheckoutForFlow() {
  if (!paddleInstance || !paddleReady) {
    return;
  }

  paddleInstance.Checkout.close();
  activeFlow = null;
}

function updatePaddleConfig(config: Partial<PaddleSetupOptions>) {
  if (!paddleInstance || !paddleReady) {
    return;
  }

  paddleInstance.Update(config);
}

function updateCheckoutItemsForFlow(
  items: { priceId: string; quantity: number }[]
) {
  if (!paddleInstance || !paddleReady) {
    return;
  }

  // Swap line items in the already-open inline checkout instead of close→reopen,
  // so the iframe (and the Apple Pay sheet) stays mounted. customData is unchanged.
  paddleInstance.Checkout.updateItems(items);
}

export function usePaddleCheckout() {
  const [ready, setReady] = useState(paddleReady);

  useEffect(() => {
    initializePaddleOnce();
    readyListeners.add(setReady);

    return () => {
      readyListeners.delete(setReady);
    };
  }, []);

  return {
    clearFlowHandlers: clearFlowHandlersForCheckout,
    closeCheckout: closeCheckoutForFlow,
    openCheckout: openCheckoutForFlow,
    ready,
    setFlowHandlers: setFlowHandlersForCheckout,
    updateCheckoutItems: updateCheckoutItemsForFlow,
    updatePaddle: updatePaddleConfig,
  };
}
