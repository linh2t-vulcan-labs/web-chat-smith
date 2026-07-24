import { useContext } from "react";
import { useStore } from "zustand";

import { SubscriptionContext } from "./context";
import type { TSubscriptionStore } from "./types";

/**
 * Hook to access subscription store state with selector
 */
export function useSubscriptionState<T>(
  selector: (state: TSubscriptionStore) => T
): T {
  const store = useContext(SubscriptionContext);
  if (!store) {
    throw new Error("Missing SubscriptionContext in the tree");
  }

  return useStore(store, selector);
}

/**
 * Hook to access subscription store actions
 */
export function useSubscriptionActions() {
  const store = useContext(SubscriptionContext);
  if (!store) {
    throw new Error("Missing SubscriptionContext in the tree");
  }

  const actionState = store.getState();

  return {
    addPollingCallback: actionState.addPollingCallback,
    clearPollingCallbacks: actionState.clearPollingCallbacks,
    resetSubscriptionState: actionState.resetSubscriptionState,
    setActiveProduct: actionState.setActiveProduct,
    setCheckoutContext: actionState.setCheckoutContext,
    setIsCreatingOrder: actionState.setIsCreatingOrder,
    setIsFetchingPaymentInfo: actionState.setIsFetchingPaymentInfo,
    setIsPaddleCheckoutLoading: actionState.setIsPaddleCheckoutLoading,
    setIsPolling: actionState.setIsPolling,
    setIsProcessingBillingHistory: actionState.setIsProcessingBillingHistory,
    setIsProcessingCheckout: actionState.setIsProcessingCheckout,
  };
}

/**
 * Hook to access full subscription store
 */
export function useSubscriptionStore() {
  const store = useContext(SubscriptionContext);
  if (!store) {
    throw new Error("Missing SubscriptionContext in the tree");
  }
  return store;
}

/**
 * Hook to get unified loading state
 */
export function useSubscriptionLoading() {
  return useSubscriptionState((state) => state.isLoading);
}
