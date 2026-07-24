import type { ProductModel } from "@/core/models/product";
import type { TPurchaseSource } from "@/utils/commons/types";

export interface CheckoutContext {
  orderId: string;
  productId: string;
  purchaseSource: TPurchaseSource;
  product: ProductModel;
}

export interface PollingCallbacks {
  onSuccess?: () => void;
  onError?: () => void;
}

export interface TSubscriptionStoreState {
  // Unified loading state (computed from all individual states)
  isLoading: boolean;

  // Individual loading states
  isPolling: boolean;
  isCreatingOrder: boolean;
  isProcessingCheckout: boolean;
  isFetchingPaymentInfo: boolean;
  isPaddleCheckoutLoading: boolean;
  isProcessingBillingHistory: boolean;

  // Checkout context
  checkoutContext: CheckoutContext | null;

  // Polling callbacks queue
  pollingCallbacks: PollingCallbacks[];

  // Product
  activeProduct?: ProductModel | null;
}

export interface TSubscriptionStoreAction {
  // Loading state management
  setIsPolling: (isPolling: boolean) => void;
  setIsCreatingOrder: (isCreatingOrder: boolean) => void;
  setIsProcessingCheckout: (isProcessingCheckout: boolean) => void;
  setIsFetchingPaymentInfo: (isFetchingPaymentInfo: boolean) => void;
  setIsPaddleCheckoutLoading: (isPaddleCheckoutLoading: boolean) => void;
  setIsProcessingBillingHistory: (isProcessingBillingHistory: boolean) => void;

  // Checkout context management
  setCheckoutContext: (context: CheckoutContext | null) => void;

  // Polling management
  addPollingCallback: (callbacks: PollingCallbacks) => void;
  clearPollingCallbacks: () => void;

  // Reset state
  resetSubscriptionState: () => void;

  // Product
  setActiveProduct: (product: ProductModel | null) => void;
}

export type TSubscriptionStore = TSubscriptionStoreState &
  TSubscriptionStoreAction;
