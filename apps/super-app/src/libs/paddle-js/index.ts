/**
 * Paddle.js Integration for Web Super App
 *
 * This module provides a thin wrapper around the official @paddle/paddle-js package
 * with custom configuration helpers and React hooks.
 *
 * Usage:
 * ```tsx
 * import { usePaddle, buildInitializeConfig } from '@/libs/paddle-js';
 *
 * function MyComponent() {
 *   const { paddle, ready, open } = usePaddle(buildInitializeConfig());
 *
 *   const handleCheckout = () => {
 *     open({ items: [{ priceId: 'pri_xxx', quantity: 1 }] });
 *   };
 * }
 * ```
 */

// Re-export all types and functions from official package
export type {
  Paddle,
  InitializePaddleOptions,
  PaddleSetupOptions,
  PaddleSetupPwCustomer,
  CheckoutOpenOptions,
  CheckoutUpdateOptions,
  CheckoutLineItem,
  CheckoutOpenLineItem,
  CheckoutSettings,
  CheckoutCustomer,
  CheckoutCustomerAddress,
  CheckoutCustomerBusiness,
  PaddleEventData,
  PricePreviewParams,
  PricePreviewResponse,
  TransactionPreviewParams,
  TransactionPreviewResponse,
  Environments,
  DisplayMode,
  Theme,
  // Event types
  CheckoutEventNames,
  CheckoutEventsData,
  CheckoutEventError,
} from "@paddle/paddle-js";

export { initializePaddle } from "@paddle/paddle-js";

// Custom configuration helpers
export {
  getClientToken,
  getEnvironment,
  buildInitializeConfig,
  type BuildConfigOptions,
} from "./config";

// Custom React hooks
export { usePaddle } from "./react";

// Paddle Manager
export { paddleManager } from "./paddle-manager";

// Custom utility functions
export {
  createSingleItemCheckout,
  createMultiItemCheckout,
  withDiscount,
  withDiscountId,
  withCustomData,
  withCustomerEmail,
  withInlineSettings,
  mapAppLocaleToPaddleLocale,
  isValidPaddleId,
  validatePaddleId,
  formatItemsForPreview,
} from "./utils";

// Payment Flow V2 checkout-options builder
export { buildV2CheckoutOptions } from "./build-checkout-options";

// Checkout event handlers
export {
  createCheckoutEventCallback,
  isCheckoutCompleted,
  isCheckoutError,
  isCheckoutReady,
  getTransactionId,
  getErrorDetails,
  type CheckoutEventHandlers,
} from "./checkout-events";

// Constants
export {
  PADDLE_EVENTS,
  PADDLE_ENVIRONMENT,
  PADDLE_DISPLAY_MODE,
  PADDLE_THEME,
} from "./constants";
