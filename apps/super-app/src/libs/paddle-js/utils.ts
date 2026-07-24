import type {
  CheckoutCustomer,
  CheckoutOpenLineItem,
  CheckoutOpenOptions,
  CheckoutSettings,
} from "@paddle/paddle-js";

/**
 * Map the app's Next-intl locale (e.g. `en`, `ar`, `zh`, `es`, `th`) to the
 * Paddle Checkout `settings.locale` values.
 *
 * Paddle expects locale strings like `en`, `ar`, `es`, `th`, `zh-Hans`, `zh-TW`.
 */
export function mapAppLocaleToPaddleLocale(appLocale?: string | null): string {
  const normalized = (appLocale ?? "")
    .trim()
    .toLowerCase()
    .replaceAll("_", "-");
  if (!normalized) {
    return "en";
  }

  const [base, ...rest] = normalized.split("-");
  const region = rest.join("-");

  switch (base) {
    case "en":
    case "ar":
    case "ko":
    case "ja":
    case "hi":
    case "es":
    case "th": {
      return base;
    }

    case "zh": {
      // Default the app `zh` locale to Simplified (zh-Hans), but still allow
      // explicit Traditional inputs to pass through.
      if (region.includes("tw") || region.includes("hant")) {
        return "zh-TW";
      }
      return "zh-Hans";
    }

    default: {
      return "en";
    }
  }
}

/**
 * Create a simple checkout config with a single item
 */
export function createSingleItemCheckout(
  priceId: string,
  quantity = 1,
  customer?: CheckoutCustomer
): CheckoutOpenOptions {
  return {
    customer,
    items: [{ priceId, quantity }],
  } as CheckoutOpenOptions;
}

/**
 * Create a multi-item checkout config
 */
export function createMultiItemCheckout(
  items: { priceId: string; quantity?: number }[],
  customer?: CheckoutCustomer
): CheckoutOpenOptions {
  return {
    customer,
    items: items.map((item) => ({
      priceId: item.priceId,
      quantity: item.quantity ?? 1,
    })),
  } as CheckoutOpenOptions;
}

/**
 * Add discount code to checkout config
 */
export function withDiscount(
  config: CheckoutOpenOptions,
  discountCode: string
): CheckoutOpenOptions {
  // Create a new config with discount code, removing discountId if present
  const { discountId: _discountId, ...rest } = config as unknown as Record<
    string,
    unknown
  >;
  return {
    ...rest,
    discountCode,
  } as CheckoutOpenOptions;
}

/**
 * Add discount ID to checkout config
 */
export function withDiscountId(
  config: CheckoutOpenOptions,
  discountId: string
): CheckoutOpenOptions {
  // Create a new config with discount ID, removing discountCode if present
  const { discountCode: _discountCode, ...rest } = config as unknown as Record<
    string,
    unknown
  >;
  return {
    ...rest,
    discountId,
  } as CheckoutOpenOptions;
}

/**
 * Add custom data to checkout config
 */
export function withCustomData(
  config: CheckoutOpenOptions,
  customData: Record<string, unknown>
): CheckoutOpenOptions {
  return {
    ...config,
    customData: {
      ...config.customData,
      ...customData,
    },
  };
}

/**
 * Add customer email to checkout config
 */
export function withCustomerEmail(
  config: CheckoutOpenOptions,
  email: string
): CheckoutOpenOptions {
  return {
    ...config,
    customer: {
      ...config.customer,
      email,
    },
  } as CheckoutOpenOptions;
}

/**
 * Configure inline checkout settings
 *
 * IMPORTANT: Paddle.js uses getElementsByClassName internally!
 * - If passing a string, it should be a CLASS NAME (not an ID)
 * - OR pass an HTMLElement directly
 *
 * @example
 * // Using class name (string)
 * <div className="paddle-checkout" />
 * withInlineSettings(config, "paddle-checkout")
 *
 * @example
 * // Using HTMLElement
 * const el = document.getElementById("checkout-container");
 * withInlineSettings(config, el)
 */
export function withInlineSettings(
  config: CheckoutOpenOptions,
  frameTarget: string,
  options?: {
    initialHeight?: number;
    frameStyle?: string;
    theme?: "light" | "dark";
    locale?: string;
    variant?: "one-page" | "express";
    showNonExpressPaymentMethods?: boolean;
  }
): CheckoutOpenOptions {
  const resolvedLocale = mapAppLocaleToPaddleLocale(
    options?.locale ?? (config.settings?.locale as string | undefined)
  );

  const settings: CheckoutSettings = {
    variant: options?.variant ?? "one-page",
    ...config.settings,
    showAddDiscounts: false,
    showAddTaxId: false,
    allowLogout: options?.variant !== "express",
    displayMode: "inline",
    locale: resolvedLocale,
    frameTarget,
    frameInitialHeight:
      typeof options?.initialHeight === "number" ? options.initialHeight : 450,
    frameStyle:
      options?.frameStyle ??
      "width: 100%; min-width: 312px; background-color: transparent; border: none;",
    theme: options?.theme,
    ...(options?.showNonExpressPaymentMethods !== undefined && {
      showNonExpressPaymentMethods: options.showNonExpressPaymentMethods,
    }),
  } as CheckoutSettings & { showNonExpressPaymentMethods?: boolean };

  return {
    ...config,
    settings,
  };
}

/**
 * Check if a Paddle ID is valid format
 */
export function isValidPaddleId(id: string, prefix: string): boolean {
  return id.startsWith(`${prefix}_`) && id.length > prefix.length + 1;
}

/**
 * Validate common Paddle IDs
 */
export const validatePaddleId = {
  customer: (id: string) => isValidPaddleId(id, "ctm"),
  discount: (id: string) => isValidPaddleId(id, "dsc"),
  price: (id: string) => isValidPaddleId(id, "pri"),
  product: (id: string) => isValidPaddleId(id, "pro"),
  subscription: (id: string) => isValidPaddleId(id, "sub"),
  transaction: (id: string) => isValidPaddleId(id, "txn"),
};

/**
 * Format price items for preview
 */
export function formatItemsForPreview(items: CheckoutOpenLineItem[]) {
  return items.map((item) => ({
    priceId: item.priceId,
    quantity: item.quantity ?? 1,
  }));
}
