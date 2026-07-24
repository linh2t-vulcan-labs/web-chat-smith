import type { TSubscriptionStoreState } from "./types";

export const defaultSubscriptionState: TSubscriptionStoreState = {
  checkoutContext: null,
  isCreatingOrder: false,
  isFetchingPaymentInfo: false,
  isLoading: false,
  isPaddleCheckoutLoading: false,
  isPolling: false,
  isProcessingBillingHistory: false,
  isProcessingCheckout: false,
  pollingCallbacks: [],
};
