import type {
  EPaymentCurrency,
  EPaymentPaddleTransactionOrigin,
  EPaymentTransactionStatus,
  TPaymentCardType,
  TPaymentMethodType,
} from "@/core/models/payment";

export interface TInvoicePaymentInfo {
  paymentMethodType: TPaymentMethodType;
  cardType: TPaymentCardType;
  /** Omitted when `card` is null or missing in the API response. */
  cardNumber?: string;
  /** Omitted when `card` is null or missing in the API response. */
  cardholderName?: string;
  /** Omitted when `card` is null or missing in the API response. */
  expiredAt?: string;
}

export interface TInvoiceInfo {
  paymentInfo: TInvoicePaymentInfo;
  productPrice: string;
  productName: string;
  durationUnitLabel: string;
  invoiceNumber: string;
  billingPeriod: string;
  status: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus];
  quantity: number;
  currency: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];
  taxPercentage: string;
  tax: string;
  totalAmount: number;
  subTotal: string;
  discount: string;
  fee: string;
  total: string;
  createdAt: string;
  origin: (typeof EPaymentPaddleTransactionOrigin)[keyof typeof EPaymentPaddleTransactionOrigin];
}
