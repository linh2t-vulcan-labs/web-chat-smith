import { EPaymentCurrency } from "@/core/models/payment";
import type { PreviewUpgradeDowngradeSubscriptionModel } from "@/core/models/payment";
import type { ProductModel } from "@/core/models/product";
import dayjs from "@/libs/dayjs";
import { formatUnixDate } from "@/utils/commons/date-time";
import { ECURRENCY, EDURATION_UNIT } from "@/utils/commons/enums";
import {
  calculateDiscountPercentage,
  getFormattedOriginalPrice,
} from "@/utils/commons/helpers";
import { getCurrencySymbol } from "@/utils/mappers/payment";

import type { TAlertWarningInfoProps, TAmountChangeInfoProps } from "../types";

type CurrencyType =
  | ECURRENCY
  | string
  | (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];

const DEFAULT_CURRENCY = ECURRENCY.USD;

function resolveCurrency(
  transactionCurrency?: CurrencyType,
  productCurrency?: CurrencyType
): CurrencyType {
  return transactionCurrency ?? productCurrency ?? DEFAULT_CURRENCY;
}

function getSelectedProductPrice(selectedProduct: ProductModel): number {
  return selectedProduct?.defaultPrice?.price ?? 0;
}

function getNextBillingDate(
  previewData: PreviewUpgradeDowngradeSubscriptionModel | undefined,
  amountDueToday: number
): string {
  // Case upgrade plan
  if (amountDueToday > 0) {
    return dayjs().format("YYYY-MM-DD");
  }
  // Case downgrade plan
  return formatUnixDate(previewData?.nextBilledAt) || "";
}

/**
 * Converts currency from ECURRENCY enum or string to EPaymentCurrency number format
 * @param currency - Currency enum value (ECURRENCY), string, or number (EPaymentCurrency)
 * @returns EPaymentCurrency enum value (number)
 */
function convertCurrencyToPaymentCurrency(
  currency: CurrencyType
): (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency] {
  // If already a number (EPaymentCurrency type), return as is
  if (typeof currency === "number") {
    return currency;
  }

  // If it's ECURRENCY enum or string (ECURRENCY format), convert to EPaymentCurrency
  // Map ECURRENCY enum values and string keys to EPaymentCurrency values
  const currencyString = String(currency);
  const currencyMap: Record<
    string,
    (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency]
  > = {
    CURRENCY_ARS: EPaymentCurrency.CURRENCY_ARS,
    CURRENCY_AUD: EPaymentCurrency.CURRENCY_AUD,
    CURRENCY_BRL: EPaymentCurrency.CURRENCY_BRL,
    CURRENCY_CAD: EPaymentCurrency.CURRENCY_CAD,
    CURRENCY_CHF: EPaymentCurrency.CURRENCY_CHF,
    CURRENCY_CNY: EPaymentCurrency.CURRENCY_CNY,
    CURRENCY_COP: EPaymentCurrency.CURRENCY_COP,
    CURRENCY_CZK: EPaymentCurrency.CURRENCY_CZK,
    CURRENCY_DKK: EPaymentCurrency.CURRENCY_DKK,
    CURRENCY_EUR: EPaymentCurrency.CURRENCY_EUR,
    CURRENCY_GBP: EPaymentCurrency.CURRENCY_GBP,
    CURRENCY_HKD: EPaymentCurrency.CURRENCY_HKD,
    CURRENCY_HUF: EPaymentCurrency.CURRENCY_HUF,
    CURRENCY_ILS: EPaymentCurrency.CURRENCY_ILS,
    CURRENCY_INR: EPaymentCurrency.CURRENCY_INR,
    CURRENCY_JPY: EPaymentCurrency.CURRENCY_JPY,
    CURRENCY_KRW: EPaymentCurrency.CURRENCY_KRW,
    CURRENCY_MXN: EPaymentCurrency.CURRENCY_MXN,
    CURRENCY_NOK: EPaymentCurrency.CURRENCY_NOK,
    CURRENCY_NZD: EPaymentCurrency.CURRENCY_NZD,
    CURRENCY_PLN: EPaymentCurrency.CURRENCY_PLN,
    CURRENCY_RUB: EPaymentCurrency.CURRENCY_RUB,
    CURRENCY_SEK: EPaymentCurrency.CURRENCY_SEK,
    CURRENCY_SGD: EPaymentCurrency.CURRENCY_SGD,
    CURRENCY_THB: EPaymentCurrency.CURRENCY_THB,
    CURRENCY_TRY: EPaymentCurrency.CURRENCY_TRY,
    CURRENCY_TWD: EPaymentCurrency.CURRENCY_TWD,
    CURRENCY_UAH: EPaymentCurrency.CURRENCY_UAH,
    CURRENCY_USD: EPaymentCurrency.CURRENCY_USD,
    CURRENCY_VND: EPaymentCurrency.CURRENCY_VND,
    CURRENCY_ZAR: EPaymentCurrency.CURRENCY_ZAR,
  };

  return currencyMap[currencyString] || EPaymentCurrency.CURRENCY_USD;
}

/**
 * Gets currency symbol for either ECURRENCY enum or EPaymentCurrency number type
 * @param currency - Currency enum (ECURRENCY) or number (EPaymentCurrency)
 * @returns Currency symbol (e.g., "$", "€")
 */
function getCurrencySymbolForAnyType(currency: CurrencyType): string {
  const paymentCurrency = convertCurrencyToPaymentCurrency(currency);
  return getCurrencySymbol(paymentCurrency);
}

/**
 * Formats currency amount with symbol and proper decimal places
 * Handles both ECURRENCY enum and EPaymentCurrency number types
 */
export function formatCurrency(amount: number, currency: CurrencyType): string {
  const currencySymbol = getCurrencySymbolForAnyType(currency);
  const formattedAmount = Number(amount.toFixed(2)).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return `${currencySymbol}${formattedAmount}`;
}

/**
 * Maps a product's EDURATION_UNIT to the corresponding `common.frequency.*` translation key.
 * Pass the returned key directly to `commonT(key)` from `useTranslations("common")`.
 *
 * Example:
 *   getDurationFrequencyKey(EDURATION_UNIT.YEAR)  → "frequency.yearly"
 *   getDurationFrequencyKey(EDURATION_UNIT.MONTH) → "frequency.monthly"
 */
export function getDurationFrequencyKey(durationUnit: EDURATION_UNIT): string {
  const map: Partial<Record<EDURATION_UNIT, string>> = {
    [EDURATION_UNIT.DAY]: "frequency.daily",
    [EDURATION_UNIT.MONTH]: "frequency.monthly",
    [EDURATION_UNIT.QUARTERLY]: "frequency.quarterly",
    [EDURATION_UNIT.YEAR]: "frequency.yearly",
  };
  return map[durationUnit] ?? "frequency.monthly";
}

/**
 * Returns a fully localized duration label for a product by combining the
 * `common.amountPerDuration` ICU key with the localized month unit.
 *
 * Works across all 8 supported locales:
 *   - ICU-plural locales (en, ja, ko, ar, hi, es):
 *       amount=1  → "1 month" / "1ヶ月" / "1 개월" / …
 *       amount=12 → "12 months" / "12ヶ月" / "12 개월" / …
 *   - Simple-interpolation locales (zh, th):
 *       `"{amount} {duration}"` → "12 月" / "12 เดือน" / …
 *
 * Falls back to the (English-only) `product.title` getter for DAY / WEEK
 * products that have no month equivalent.
 *
 * @param product - The ProductModel instance
 * @param commonT - The `t` function from `useTranslations("common")`
 */
export function getLocalizedProductTitle(
  product: ProductModel,
  commonT: (
    key: string,
    values?: Record<string, string | number | Date>
  ) => string
): string {
  const amount = product.numberOfMonths;
  if (!amount) {
    return product.title;
  } // DAY / WEEK have no month count
  return commonT("amountPerDuration", {
    amount,
    duration: commonT("duration.month"),
  });
}

/**
 * Computes the saving badge text for a product (e.g. "Save 33%").
 * Returns undefined when there is no discount to show.
 *
 * @param product    - The product to evaluate
 * @param newPricing - Whether the v2 pricing model is active (remote config)
 * @param saveLabel  - Localized "Save" label from `dsT("badge.saveText")`
 */
export function getSavingText(
  product: ProductModel,
  newPricing: boolean,
  saveLabel: string
): string | undefined {
  const formattedOriginalPrice = getFormattedOriginalPrice(
    product.durationUnit,
    product.defaultPrice.price,
    product.currencySymbol,
    newPricing
  );
  if (!formattedOriginalPrice) {
    return undefined;
  }
  const pct = calculateDiscountPercentage(
    product.originalPrice,
    product.defaultPrice.price,
    product.currencySymbol
  );
  return pct ? `${saveLabel} ${pct}%` : undefined;
}

/**
 * Calculates amount change info from preview subscription data and product
 * @param previewData - Preview subscription data from API
 * @param selectedProduct - Selected product model
 * @param overrides - Optional overrides for any calculated values
 * @returns Calculated amount change info props
 */
export function calculateAmountChangeInfo(
  previewData: PreviewUpgradeDowngradeSubscriptionModel | undefined,
  selectedProduct: ProductModel,
  overrides?: Partial<TAmountChangeInfoProps>
): TAmountChangeInfoProps {
  const transaction = previewData?.transaction;
  const selectedProductDefaultPrice = selectedProduct?.defaultPrice;
  const currency = resolveCurrency(
    transaction?.currency,
    selectedProductDefaultPrice?.currency
  );

  const amountDueToday = Math.max(0, transaction?.total ?? 0);
  const newPlanPrice = getSelectedProductPrice(selectedProduct);
  const proratedCredit =
    amountDueToday > 0 ? Math.abs(newPlanPrice - amountDueToday) : 0;
  // Duration labels are intentionally left as the product title here.
  // PreviewChangeStep always overrides these with a properly localized
  // string via getLocalizedProductTitle + commonT.
  const newPlanDurationUnit = selectedProduct.title;
  // Note: needs clarification with BE team to get the OLD plan's duration from the API.
  // For now we fall back to the selected (new) product's title.
  const oldPlanDurationUnit = "";

  const nextBillingDate = formatUnixDate(previewData?.nextBilledAt);
  const nextBillingAmount = newPlanPrice;

  return {
    amountDueToday,
    amountDueTodayCurrency: String(currency),
    newPlanCurrency: String(currency),
    newPlanDurationUnit,
    newPlanPrice,
    nextBillingAmount,
    nextBillingCurrency: String(currency),
    nextBillingCycleDate: String(nextBillingDate),
    oldPlanDurationUnit,
    proratedCreditAmount: proratedCredit,
    proratedCreditCurrency: String(currency),
    ...overrides,
  };
}

/**
 * Calculates alert warning info from preview subscription data and product
 * @param previewData - Preview subscription data from API
 * @param selectedProduct - Selected product model
 * @param amountDueToday - Calculated amount due today
 * @param overrides - Optional overrides for any calculated values
 * @returns Calculated alert warning info props
 */
export function calculateAlertWarningInfo(
  previewData: PreviewUpgradeDowngradeSubscriptionModel | undefined,
  selectedProduct: ProductModel,
  amountDueToday: number,
  overrides?: Partial<TAlertWarningInfoProps>
): TAlertWarningInfoProps {
  const transaction = previewData?.transaction;
  const selectedProductDefaultPrice = selectedProduct?.defaultPrice;
  const currency = resolveCurrency(
    transaction?.currency,
    selectedProductDefaultPrice?.currency
  );
  // Duration label is overridden by PreviewChangeStep via getDurationFrequencyKey + commonT.
  const newPlanDurationUnit = selectedProduct.title;

  const nextBillingDate = getNextBillingDate(previewData, amountDueToday);
  const newPlanPrice = getSelectedProductPrice(selectedProduct);

  return {
    additionalChargeAmount: amountDueToday,
    additionalChargeCurrency: String(currency),
    chargeDate: nextBillingDate,
    newPlanDurationUnit,
    newPlanPrice,
    ...overrides,
  };
}
