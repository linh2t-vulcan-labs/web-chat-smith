import type {
  TPaymentCardType,
  TPaymentMethodType,
  TPaymentType,
} from "@/core/models/payment";
import {
  EPaymentCurrency,
  EPaymentMethodType,
  EPaymentPaddleTransactionOrigin,
  // EPaymentSubscriptionDurationUnit,
  EPaymentTransactionStatus,
} from "@/core/models/payment";
import type { TPlanStatusTagColor } from "@/features/manage-account-modal/sections/my-plan/types";

// import { toCapitalCase } from "../commons/helpers";

// const mappingBrandCard = (brand: string) => toCapitalCase(brand);

/**
 * Maps EPaymentCurrency enum values to their corresponding ISO 3-letter currency codes.
 * Based on Stripe's supported currencies: https://docs.stripe.com/currencies
 *
 * @param currency - The currency enum value from EPaymentCurrency
 * @returns The ISO 3-letter currency code (e.g., "USD", "EUR", "GBP"), or an empty string for unspecified currency
 *
 * @example
 * ```ts
 * getCurrencyCode(EPaymentCurrency.CURRENCY_USD) // returns "USD"
 * getCurrencyCode(EPaymentCurrency.CURRENCY_EUR) // returns "EUR"
 * getCurrencyCode(EPaymentCurrency.CURRENCY_GBP) // returns "GBP"
 * ```
 */
export const getCurrencyCode = (
  currency: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency]
): string => {
  const currencyCodeMap: Record<
    (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency],
    string
  > = {
    [EPaymentCurrency.CURRENCY_UNSPECIFIED]: "",
    [EPaymentCurrency.CURRENCY_USD]: "USD", // US Dollar
    [EPaymentCurrency.CURRENCY_EUR]: "EUR", // Euro
    [EPaymentCurrency.CURRENCY_GBP]: "GBP", // British Pound
    [EPaymentCurrency.CURRENCY_JPY]: "JPY", // Japanese Yen
    [EPaymentCurrency.CURRENCY_AUD]: "AUD", // Australian Dollar
    [EPaymentCurrency.CURRENCY_CAD]: "CAD", // Canadian Dollar
    [EPaymentCurrency.CURRENCY_CHF]: "CHF", // Swiss Franc
    [EPaymentCurrency.CURRENCY_HKD]: "HKD", // Hong Kong Dollar
    [EPaymentCurrency.CURRENCY_SGD]: "SGD", // Singapore Dollar
    [EPaymentCurrency.CURRENCY_SEK]: "SEK", // Swedish Krona
    [EPaymentCurrency.CURRENCY_ARS]: "ARS", // Argentine Peso
    [EPaymentCurrency.CURRENCY_BRL]: "BRL", // Brazilian Real
    [EPaymentCurrency.CURRENCY_CNY]: "CNY", // Chinese Yuan
    [EPaymentCurrency.CURRENCY_COP]: "COP", // Colombian Peso
    [EPaymentCurrency.CURRENCY_CZK]: "CZK", // Czech Koruna
    [EPaymentCurrency.CURRENCY_DKK]: "DKK", // Danish Krone
    [EPaymentCurrency.CURRENCY_HUF]: "HUF", // Hungarian Forint
    [EPaymentCurrency.CURRENCY_ILS]: "ILS", // Israeli Shekel
    [EPaymentCurrency.CURRENCY_INR]: "INR", // Indian Rupee
    [EPaymentCurrency.CURRENCY_KRW]: "KRW", // South Korean Won
    [EPaymentCurrency.CURRENCY_MXN]: "MXN", // Mexican Peso
    [EPaymentCurrency.CURRENCY_NOK]: "NOK", // Norwegian Krone
    [EPaymentCurrency.CURRENCY_NZD]: "NZD", // New Zealand Dollar
    [EPaymentCurrency.CURRENCY_PLN]: "PLN", // Polish Zloty
    [EPaymentCurrency.CURRENCY_RUB]: "RUB", // Russian Ruble
    [EPaymentCurrency.CURRENCY_THB]: "THB", // Thai Baht
    [EPaymentCurrency.CURRENCY_TRY]: "TRY", // Turkish Lira
    [EPaymentCurrency.CURRENCY_TWD]: "TWD", // New Taiwan Dollar
    [EPaymentCurrency.CURRENCY_UAH]: "UAH", // Ukrainian Hryvnia
    [EPaymentCurrency.CURRENCY_VND]: "VND", // Vietnamese Dong
    [EPaymentCurrency.CURRENCY_ZAR]: "ZAR", // South African Rand
  };

  return currencyCodeMap[currency] || "";
};

/**
 * Gets the currency symbol for a given currency enum value using Intl.NumberFormat.
 * This function uses the browser's native internationalization API to ensure accurate
 * currency symbol representation based on the ISO currency code.
 * Based on Stripe's supported currencies: https://docs.stripe.com/currencies
 *
 * @param currency - The currency enum value from EPaymentCurrency
 * @returns The currency symbol string (e.g., "$", "€", "£"), or an empty string for unspecified currency
 *
 * @example
 * ```ts
 * getCurrencySymbol(EPaymentCurrency.CURRENCY_USD) // returns "$"
 * getCurrencySymbol(EPaymentCurrency.CURRENCY_EUR) // returns "€"
 * getCurrencySymbol(EPaymentCurrency.CURRENCY_GBP) // returns "£"
 * getCurrencySymbol(EPaymentCurrency.CURRENCY_JPY) // returns "¥"
 * ```
 */
export const getCurrencySymbol = (
  currency: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency]
): string => {
  const currencyCode = getCurrencyCode(currency);

  if (!currencyCode) {
    return "";
  }

  try {
    const formatter = new Intl.NumberFormat("en-US", {
      currency: currencyCode,
      currencyDisplay: "symbol",
      style: "currency",
    });

    // Use formatToParts to extract the currency symbol part
    const parts = formatter.formatToParts(0);
    const currencyPart = parts.find((part) => part.type === "currency");

    return currencyPart?.value || "";
  } catch {
    // Fallback to empty string if currency code is invalid or Intl.NumberFormat is not supported
    return "";
  }
};

/**
 * Converts the numeric `EPaymentSubscriptionDurationUnit` values defined in
 * `src/domain/models/payment.ts` (0=UNSPECIFIED, 1=DAY, 2=WEEK, 3=MONTH, 4=YEAR,
 * 5=LIFETIME) into the lowercase strings we show in the UI. Returns an empty
 * string if the value is missing or unsupported.
 */
// const mappingPaymentSubscriptionDurationUnit = (
//   durationUnit: (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit]
// ): string => {
//   const mappingObject: Record<
//     (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit],
//     string
//   > = {
//     [EPaymentSubscriptionDurationUnit.DAY]: "day",
//     [EPaymentSubscriptionDurationUnit.WEEK]: "week",
//     [EPaymentSubscriptionDurationUnit.MONTH]: "month",
//     [EPaymentSubscriptionDurationUnit.YEAR]: "year",
//     [EPaymentSubscriptionDurationUnit.LIFETIME]: "lifetime",
//     [EPaymentSubscriptionDurationUnit.UNSPECIFIED]: "",
//     // [EPaymentSubscriptionDurationUnit.QUARTERLY]: "quarter",
//   };

//   return mappingObject[durationUnit] || "";
// };

/**
 * Returns the human-readable label for a given payment transaction status.
 * Falls back to an empty string when the status is not recognized.
 */
export const mappingPaymentTransactionStatusLabel = (
  status: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus]
): string => {
  const mappingObject: Record<
    (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus],
    string
  > = {
    [EPaymentTransactionStatus.UNSPECIFIED]: "unspecified",
    [EPaymentTransactionStatus.PROCESSING]: "processing",
    [EPaymentTransactionStatus.SUCCEEDED]: "succeeded",
    [EPaymentTransactionStatus.FAILED]: "failed",
    [EPaymentTransactionStatus.CANCELLED]: "cancelled",
    [EPaymentTransactionStatus.EXPIRED]: "expired",
    [EPaymentTransactionStatus.REFUNDED]: "refunded",
    [EPaymentTransactionStatus.PARTIALLY_REFUNDED]: "partiallyRefunded",
    [EPaymentTransactionStatus.PENDING]: "pending",
    [EPaymentTransactionStatus.DISPUTED]: "disputed",
    [EPaymentTransactionStatus.REVERSED]: "reversed",
  };

  return mappingObject[status] || "";
};

/**
 * Returns the color for a given payment transaction status.
 * Falls back to an empty string when the status is not recognized.
 */
export const mappingPaymentTransactionStatusColor = (
  status: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus]
): TPlanStatusTagColor => {
  const mappingObject: Record<
    (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus],
    string
  > = {
    [EPaymentTransactionStatus.UNSPECIFIED]: "neutral",
    [EPaymentTransactionStatus.PROCESSING]: "yellow",
    [EPaymentTransactionStatus.SUCCEEDED]: "green",
    [EPaymentTransactionStatus.FAILED]: "red",
    [EPaymentTransactionStatus.CANCELLED]: "red",
    [EPaymentTransactionStatus.EXPIRED]: "neutral",
    [EPaymentTransactionStatus.REFUNDED]: "green",
    [EPaymentTransactionStatus.PARTIALLY_REFUNDED]: "yellow",
    [EPaymentTransactionStatus.PENDING]: "yellow",
    [EPaymentTransactionStatus.DISPUTED]: "yellow",
    [EPaymentTransactionStatus.REVERSED]: "neutral",
  };

  return mappingObject[status] as TPlanStatusTagColor;
};

export const mappingPaymentTransactionOriginLabel = (
  origin: (typeof EPaymentPaddleTransactionOrigin)[keyof typeof EPaymentPaddleTransactionOrigin]
): string => {
  const mappingObject: Record<
    (typeof EPaymentPaddleTransactionOrigin)[keyof typeof EPaymentPaddleTransactionOrigin],
    string
  > = {
    [EPaymentPaddleTransactionOrigin.API]: "newPurchase",
    [EPaymentPaddleTransactionOrigin.WEB]: "newPurchase",
    [EPaymentPaddleTransactionOrigin.SUBSCRIPTION_PAYMENT_METHOD_CHANGE]:
      "paymentMethodUpdate",
    [EPaymentPaddleTransactionOrigin.SUBSCRIPTION_RECURRING_PAYMENT]:
      "recurringPayment",
    [EPaymentPaddleTransactionOrigin.SUBSCRIPTION_UPDATE]: "subscriptionUpdate",
    [EPaymentPaddleTransactionOrigin.SUBSCRIPTION_CHARGE]: "newPurchase",
  };

  return mappingObject[origin] || "";
};

/**
 * Use for detail transaction
 * Resolves the card brand for UI when the API omits card details (e.g. Apple Pay / Google Pay without last4).
 */
export const resolveCardTypeForPaymentMethod = (
  paymentMethodType: TPaymentMethodType,
  cardTypeFromApi?: TPaymentCardType
): TPaymentCardType => {
  if (cardTypeFromApi) {
    return cardTypeFromApi;
  }
  if (paymentMethodType === EPaymentMethodType.PAYMENT_METHOD_APPLE_PAY) {
    return "apple_pay";
  }
  if (paymentMethodType === EPaymentMethodType.PAYMENT_METHOD_GOOGLE_PAY) {
    return "google_pay";
  }
  return "unknown";
};

/**
 * Maps the payment-method `type` string from `/payment_method_info` to `EPaymentMethodType`
 * for components that expect numeric method codes (e.g. `PaymentCardInfo`).
 */
export const resolvePaymentMethodType = (
  paymentMethodType: TPaymentType | undefined | null
): TPaymentMethodType => {
  if (paymentMethodType === null || paymentMethodType === undefined) {
    return EPaymentMethodType.PAYMENT_METHOD_UNSPECIFIED;
  }

  const byApiType: Record<TPaymentType, TPaymentMethodType> = {
    apple_pay: EPaymentMethodType.PAYMENT_METHOD_APPLE_PAY,
    card: EPaymentMethodType.PAYMENT_METHOD_CARD,
    google_pay: EPaymentMethodType.PAYMENT_METHOD_GOOGLE_PAY,
  };

  return (
    byApiType[paymentMethodType] ??
    EPaymentMethodType.PAYMENT_METHOD_UNSPECIFIED
  );
};
