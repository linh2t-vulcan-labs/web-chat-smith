/**
 * Common Paddle.js event names
 * See: https://developer.paddle.com/paddlejs/events
 */
export const PADDLE_EVENTS = {
  // General events
  CHECKOUT_LOADED: "checkout.loaded",
  CHECKOUT_UPDATED: "checkout.updated",
  CHECKOUT_CLOSED: "checkout.closed",
  CHECKOUT_COMPLETED: "checkout.completed",
  CHECKOUT_ERROR: "checkout.error",

  // Item events
  CHECKOUT_ITEMS_UPDATED: "checkout.items.updated",
  CHECKOUT_ITEMS_REMOVED: "checkout.items.removed",

  // Customer events
  CHECKOUT_CUSTOMER_CREATED: "checkout.customer.created",
  CHECKOUT_CUSTOMER_UPDATED: "checkout.customer.updated",

  // Payment events
  CHECKOUT_PAYMENT_SELECTED: "checkout.payment.selected",
  CHECKOUT_PAYMENT_INITIATED: "checkout.payment.initiated",
  CHECKOUT_PAYMENT_FAILED: "checkout.payment.failed",

  // Discount events
  CHECKOUT_DISCOUNT_APPLIED: "checkout.discount.applied",
  CHECKOUT_DISCOUNT_REMOVED: "checkout.discount.removed",
} as const;

/**
 * Paddle environment constants
 */
export const PADDLE_ENVIRONMENT = {
  PRODUCTION: "production",
  SANDBOX: "sandbox",
} as const;

/**
 * Paddle checkout display modes
 */
export const PADDLE_DISPLAY_MODE = {
  INLINE: "inline",
  OVERLAY: "overlay",
} as const;

/**
 * Paddle theme constants
 */
export const PADDLE_THEME = {
  DARK: "dark",
  LIGHT: "light",
} as const;

/**
 *  Paddle classname container
 */

export const PADDLE_CONTAINER_CLASSNAME = {
  PADDLE_CHECKOUT_CONTAINER: "paddle-checkout-container",
  PADDLE_EXPRESS_BUTTON_CONTAINER: "paddle-express-button-container",
  PADDLE_UPDATE_PAYMENT_METHOD_CONTAINER:
    "paddle-update-payment-method-container",
} as const;

/**
 * Shared inline settings that turn ON Paddle's express checkout (the Apple Pay buttons
 * rendered at the top of the inline checkout).
 *
 * `showNonExpressPaymentMethods: true` keeps the regular card form visible underneath so a user
 * without an enrolled wallet card can still pay ("Pay another way"). Caller-specific options
 * (theme, initialHeight, locale) are passed alongside these.
 *
 * Single source of truth so the express variant flags are never duplicated across the mobile
 * express iframe and the desktop continue→checkout flow.
 */
export const PADDLE_EXPRESS_INLINE_OPTS = {
  showNonExpressPaymentMethods: true,
  variant: "express",
} as const;
