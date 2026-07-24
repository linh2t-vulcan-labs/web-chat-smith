import type { DetailTransactionItemModel } from "@/core/models/payment";
import { EPaymentMethodType } from "@/core/models/payment";
import { formatUnixDate } from "@/utils/commons/date-time";
import { calculateTruncatedPercentage } from "@/utils/commons/number";
import {
  getCurrencySymbol,
  resolveCardTypeForPaymentMethod,
} from "@/utils/mappers/payment";

import type { TInvoiceInfo, TInvoicePaymentInfo } from "../types/invoice";

/**
 * Transforms payment method information
 */
function transformPaymentInfo(
  paymentMethod?: DetailTransactionItemModel["paddle"]["paymentMethod"]
): TInvoicePaymentInfo {
  const cardInfo = paymentMethod?.info?.card;
  const pmType =
    paymentMethod?.type ?? EPaymentMethodType.PAYMENT_METHOD_UNSPECIFIED;

  return {
    cardNumber: cardInfo?.last4 || undefined,
    cardType: resolveCardTypeForPaymentMethod(pmType, cardInfo?.type),
    cardholderName: cardInfo?.cardholderName?.trim() || undefined,
    expiredAt:
      cardInfo?.expiryMonth && cardInfo?.expiryYear
        ? `${cardInfo.expiryMonth}/${cardInfo.expiryYear}`
        : undefined,
    paymentMethodType: pmType,
  };
}

/**
 * Formats currency value with symbol
 */
function formatCurrency(value: number, symbol: string): string {
  return `${symbol}${value.toFixed(2)}`;
}

/**
 * Formats billing period range
 */
function formatBillingPeriod(start: string, end: string): string {
  return `${formatUnixDate(start)} - ${formatUnixDate(end)}`;
}

/**
 * Calculates tax percentage
 */
function calculateTaxPercentage(tax: number, subTotal: number): string {
  const percentage = calculateTruncatedPercentage(tax, subTotal);
  return `${percentage}%`;
}

/**
 * Transforms DetailTransactionItemModel into structured invoice info
 */
function transform(
  data: DetailTransactionItemModel | undefined
): TInvoiceInfo | null {
  if (!data?.paddle) {
    return null;
  }

  const { paddle } = data;
  const currencySymbol = getCurrencySymbol(paddle.currency);

  // Note: place to change product Price in billing detail (bug number 10 in GU-1127)
  return {
    billingPeriod: formatBillingPeriod(
      paddle.billingPeriodStart,
      paddle.billingPeriodEnd
    ),
    createdAt: formatUnixDate(paddle.createdAt),
    currency: paddle.currency,
    discount: formatCurrency(paddle.discount, currencySymbol),
    durationUnitLabel: paddle.intervalUnitLabel,
    fee: formatCurrency(paddle.fee, currencySymbol),
    invoiceNumber: `#${paddle.invoiceNumber}`,
    origin: paddle.origin,
    paymentInfo: transformPaymentInfo(paddle.paymentMethod),
    productName: paddle.productName,
    productPrice: formatCurrency(paddle.total, currencySymbol),
    quantity: 1,
    status: paddle.status,
    subTotal: formatCurrency(paddle.subTotal, currencySymbol),
    tax: formatCurrency(paddle.tax, currencySymbol),
    taxPercentage: calculateTaxPercentage(paddle.tax, paddle.subTotal),
    total: formatCurrency(paddle.total, currencySymbol),
    totalAmount: paddle.total,
  };
}

/**
 * Transforms raw transaction data into formatted invoice information.
 * Single Responsibility: Handles all invoice data transformation logic.
 */
export const InvoiceDataTransformer = {
  transform,
};
