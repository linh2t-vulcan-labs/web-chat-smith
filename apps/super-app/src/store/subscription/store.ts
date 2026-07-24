import { immer } from "zustand/middleware/immer";
import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";

import { defaultSubscriptionState } from "./constants";
import type { TSubscriptionStore } from "./types";

/**
 * Computes unified loading state from all individual loading states
 * Optimized to avoid unnecessary computations
 */
const computeIsLoading = (state: {
  isPolling: boolean;
  isCreatingOrder: boolean;
  isProcessingCheckout: boolean;
  isFetchingPaymentInfo: boolean;
  isPaddleCheckoutLoading: boolean;
  isProcessingBillingHistory: boolean;
}): boolean =>
  state.isPolling ||
  state.isCreatingOrder ||
  state.isProcessingCheckout ||
  state.isFetchingPaymentInfo ||
  state.isPaddleCheckoutLoading ||
  state.isProcessingBillingHistory;

export const createSubscriptionStore = (): StoreApi<TSubscriptionStore> =>
  createStore<TSubscriptionStore>()(
    immer((set) => ({
      ...defaultSubscriptionState,

      addPollingCallback: (callbacks) => {
        set((state) => {
          state.pollingCallbacks.push(callbacks);
        });
      },

      clearPollingCallbacks: () => {
        set((state) => {
          state.pollingCallbacks = [];
        });
      },

      resetSubscriptionState: () => {
        set((state) => {
          Object.assign(state, defaultSubscriptionState);
        });
      },

      setActiveProduct: (_activeProduct) => {
        set((state) => {
          state.activeProduct = _activeProduct;
        });
      },

      setCheckoutContext: (checkoutContext) => {
        set((state) => {
          state.checkoutContext = checkoutContext;
        });
      },

      setIsCreatingOrder: (isCreatingOrder) => {
        set((state) => {
          if (state.isCreatingOrder === isCreatingOrder) {
            return;
          }
          state.isCreatingOrder = isCreatingOrder;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },

      setIsFetchingPaymentInfo: (isFetchingPaymentInfo) => {
        set((state) => {
          if (state.isFetchingPaymentInfo === isFetchingPaymentInfo) {
            return;
          }
          state.isFetchingPaymentInfo = isFetchingPaymentInfo;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },

      setIsPaddleCheckoutLoading: (isPaddleCheckoutLoading) => {
        set((state) => {
          if (state.isPaddleCheckoutLoading === isPaddleCheckoutLoading) {
            return;
          }
          state.isPaddleCheckoutLoading = isPaddleCheckoutLoading;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },

      setIsPolling: (isPolling) => {
        set((state) => {
          if (state.isPolling === isPolling) {
            return;
          }
          state.isPolling = isPolling;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },

      setIsProcessingBillingHistory: (isProcessingBillingHistory) => {
        set((state) => {
          if (state.isProcessingBillingHistory === isProcessingBillingHistory) {
            return;
          }
          state.isProcessingBillingHistory = isProcessingBillingHistory;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },

      setIsProcessingCheckout: (isProcessingCheckout) => {
        set((state) => {
          if (state.isProcessingCheckout === isProcessingCheckout) {
            return;
          }
          state.isProcessingCheckout = isProcessingCheckout;
          const newIsLoading = computeIsLoading(state);
          if (state.isLoading !== newIsLoading) {
            state.isLoading = newIsLoading;
          }
        });
      },
    }))
  ) as StoreApi<TSubscriptionStore>;

export type TCreateSubscriptionStore = ReturnType<
  typeof createSubscriptionStore
>;
