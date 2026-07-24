import dayjs from "dayjs";

import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";

const toCapitalCase = (text: string): string => {
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const mapPaymentSubscriptionDurationUnit = (
  durationUnit: (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit]
): string => {
  const mappingObject: Record<
    (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit],
    string
  > = {
    [EPaymentSubscriptionDurationUnit.DAY]: "day",
    [EPaymentSubscriptionDurationUnit.WEEK]: "week",
    [EPaymentSubscriptionDurationUnit.MONTH]: "month",
    [EPaymentSubscriptionDurationUnit.YEAR]: "year",
    [EPaymentSubscriptionDurationUnit.LIFETIME]: "lifetime",
    [EPaymentSubscriptionDurationUnit.UNSPECIFIED]: "",
  };

  return mappingObject[durationUnit] || "";
};

export const EPaymentSubscriptionStatus = {
  ACTIVE: 1, // Subscription is active
  CANCELLED: 3, // Subscription has been cancelled
  EXPIRED: 4, // Subscription has expired
  GRACE_PERIOD_STARTED: 8, // Grace period has started after expiration or payment failure
  INACTIVE: 2, // Subscription is inactive but can be reactivated
  PENDING: 6, // Subscription is pending (e.g., awaiting payment)
  SUSPENDED: 7, // Subscription is suspended due to non-payment or other issues
  TRIAL: 5, // Subscription is in trial period
  UNSPECIFIED: 0, // Default value, unknown or not set
} as const;

export type TPaymentVendorOfSubscriptionUser =
  | "paddle"
  | "stripe"
  | "unspecified";

// Payment subscription status is represented as a numeric code from the
// proto-like constant above. Keep this pattern (as-const object + value type)
// for payment enums and map to UI enums in helpers when needed.
export type TPaymentSubscriptionStatus =
  (typeof EPaymentSubscriptionStatus)[keyof typeof EPaymentSubscriptionStatus];

export type TPaymentCardType =
  | "visa"
  | "mastercard"
  | "jcb"
  | "apple_pay"
  | "google_pay"
  | "union_pay"
  | "unknown"
  | "american_express"
  | "diners_club"
  | "discover"
  | "maestro"
  | "mada";

export type TPaymentType = "card" | "apple_pay" | "google_pay";

export const EPaymentPaddleTransactionOrigin = {
  API: "api",
  SUBSCRIPTION_CHARGE: "subscription_charge",
  SUBSCRIPTION_PAYMENT_METHOD_CHANGE: "subscription_payment_method_change",
  SUBSCRIPTION_RECURRING_PAYMENT: "subscription_recurring",
  SUBSCRIPTION_UPDATE: "subscription_update",
  WEB: "web",
} as const;

export const EPaymentTransactionStatus = {
  CANCELLED: 4,
  DISPUTED: 9,
  EXPIRED: 5,
  FAILED: 3,
  PARTIALLY_REFUNDED: 7,
  PENDING: 8,
  PROCESSING: 1,
  REFUNDED: 6,
  REVERSED: 10,
  SUCCEEDED: 2,
  UNSPECIFIED: 0,
} as const;

export type PaymentTransactionStatus =
  (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus];

export const EPaymentMethodType = {
  PAYMENT_METHOD_APPLE_PAY: 5,
  PAYMENT_METHOD_BANK_TRANSFER: 2,
  PAYMENT_METHOD_BNPL: 4,
  PAYMENT_METHOD_CARD: 1,
  PAYMENT_METHOD_GOOGLE_PAY: 6,
  PAYMENT_METHOD_UNSPECIFIED: 0,
  PAYMENT_METHOD_WALLET: 3,
} as const;

export type TPaymentMethodType =
  (typeof EPaymentMethodType)[keyof typeof EPaymentMethodType];

export enum ECheckoutSessionMode {
  CHECKOUT_SESSION_MODE_UNSPECIFIED = 0,
  CHECKOUT_SESSION_MODE_SUBSCRIPTION = 1,
  CHECKOUT_SESSION_MODE_PAYMENT = 2,
  CHECKOUT_SESSION_MODE_REFUND = 3,
  CHECKOUT_SESSION_MODE_PAYMENT_METHOD_CHANGE = 4,
}

export const EPaymentCurrency = {
  CURRENCY_ARS: 11,
  CURRENCY_AUD: 5,
  CURRENCY_BRL: 12,
  CURRENCY_CAD: 6,
  CURRENCY_CHF: 7,
  CURRENCY_CNY: 13,
  CURRENCY_COP: 14,
  CURRENCY_CZK: 15,
  CURRENCY_DKK: 16,
  CURRENCY_EUR: 2,
  CURRENCY_GBP: 3,
  CURRENCY_HKD: 8,
  CURRENCY_HUF: 17,
  CURRENCY_ILS: 18,
  CURRENCY_INR: 19,
  CURRENCY_JPY: 4,
  CURRENCY_KRW: 20,
  CURRENCY_MXN: 21,
  CURRENCY_NOK: 22,
  CURRENCY_NZD: 23,
  CURRENCY_PLN: 24,
  CURRENCY_RUB: 25,
  CURRENCY_SEK: 10,
  CURRENCY_SGD: 9,
  CURRENCY_THB: 26,
  CURRENCY_TRY: 27,
  CURRENCY_TWD: 28,
  CURRENCY_UAH: 29,
  CURRENCY_UNSPECIFIED: 0,
  CURRENCY_USD: 1,
  CURRENCY_VND: 30,
  CURRENCY_ZAR: 31,
} as const;

export type TPaymentCurrency =
  (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];

export const EPaymentSubscriptionDurationUnit = {
  DAY: 1,
  LIFETIME: 5,
  MONTH: 3,
  UNSPECIFIED: 0,
  WEEK: 2,
  YEAR: 4,
} as const;

// const EPaymentTransactionSource = {};

@Exclude()
export class BillingHistoryModel {
  @Expose()
  @Transform(({ obj }) => obj?.extended?.stripe?.portal_url || "")
  stripePortalUrl!: string;
}

@Exclude()
class StripePaymentInfoModel {
  @Expose()
  brand!: string; // VISA or mastercard ,....

  @Expose()
  last4!: string; // 4 last digit

  @Expose()
  get brandUI() {
    if (!this.brand) {
      return "";
    }
    return toCapitalCase(this.brand);
  }

  @Expose()
  get cardInfo() {
    return `${this.brandUI} *${this.last4}`;
  }
}

@Exclude()
export class PaymentInfoModel {
  @Expose()
  @Type(() => StripePaymentInfoModel)
  stripe?: StripePaymentInfoModel;
}

@Exclude()
export class PaymentSubscriptionModel {
  @Expose({ name: "subscription_id" })
  subscriptionId!: string;

  @Expose({ name: "current_period_start" })
  currentPeriodStart!: string;

  @Expose({ name: "current_period_end" })
  currentPeriodEnd!: string;

  @Expose({ name: "interval_unit" })
  intervalUnit!: (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit];

  @Expose()
  interval!: string; // value of interval unit

  @Expose()
  get intervalUnitLabel(): string {
    if (!this.intervalUnit) {
      return "";
    }

    return mapPaymentSubscriptionDurationUnit(this.intervalUnit);
  }

  @Expose()
  get isInTrialGracePeriod(): boolean {
    const now = dayjs.utc();

    const start = dayjs.utc(Number(this.currentPeriodStart) * 1000);
    const end = dayjs.utc(Number(this.currentPeriodEnd) * 1000);

    return (
      this.sourceProductId.includes("trial") &&
      now.isBetween(start, end, "second", "[]")
    );
  }

  @Expose({ name: "next_billing_date" })
  nextBillingDate!: string;

  @Expose({ name: "product_name" })
  productName!: string;

  @Expose({ name: "product_price" })
  productPrice!: number;

  @Expose({ name: "product_currency" })
  productCurrency!: TPaymentCurrency;

  // Use to mapping with product id from PRODUCT service
  @Expose({ name: "source_product_id" })
  sourceProductId!: string;

  @Expose()
  status!: TPaymentSubscriptionStatus;

  @Expose({ name: "expired_at" })
  expiredAt!: string;

  @Expose({ name: "vendor_subscription_id" })
  vendorSubscriptionId?: string;

  @Expose({ name: "vendor_product_id" })
  vendorProductId?: string;

  @Expose({ name: "ref_id" })
  refId?: string;
}

@Exclude()
class PaymentMethodCardItemModel {
  @Expose({ name: "cardholder_name" })
  cardholderName!: string;

  @Expose({ name: "expiry_month" })
  expiryMonth!: number;
  @Expose({ name: "expiry_year" })
  expiryYear!: number;

  @Expose()
  @Transform(({ value }) => {
    if (!value) {
      return "";
    }
    return `•••• •••• •••• ${value}`;
  })
  last4!: string;

  @Expose()
  type!: TPaymentCardType; // "visa" | "mastercard"
}

@Exclude()
export class PaymentMethodItemModel {
  @Expose()
  @Type(() => PaymentMethodCardItemModel)
  card?: PaymentMethodCardItemModel | null;
}

@Exclude()
export class PaymentTransactionItemModel {
  @Expose()
  amount!: number;
  @Expose({ name: "amount_capture" })
  amountCapture!: number;
  @Expose({ name: "amount_received" })
  amountReceived!: number;
  @Expose()
  currency!: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];
  // BE returns "Web" for subscription-create transactions; surface a readable label instead.
  // Any other description is kept as-is.
  @Expose()
  @Transform(({ value }) => (value === "Web" ? "Subscription Create" : value))
  description!: string;

  @Expose({ name: "vendor_payment_id" })
  vendorPaymentId!: string;
  @Expose({ name: "order_id" })
  orderId!: string;
  @Expose({ name: "created_at" })
  createdAt!: string;
  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose()
  mode!: ECheckoutSessionMode;

  @Expose()
  status!: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus];
}

@Exclude()
class DetailTransactionCardModel {
  @Expose({ name: "cardholder_name" })
  cardholderName!: string;

  @Expose()
  type!: TPaymentCardType;

  @Expose()
  @Transform(({ value }) => {
    if (!value) {
      return "";
    }
    return `•••• •••• •••• ${value}`;
  })
  last4!: string;

  @Expose({ name: "expiry_month" })
  expiryMonth!: number;

  @Expose({ name: "expiry_year" })
  expiryYear!: number;
}

@Exclude()
class DetailTransactionPaypalModel {
  @Expose()
  email!: string;

  @Expose()
  reference!: string;
}

@Exclude()
class DetailTransactionPaymentInfoModel {
  @Expose()
  @Type(() => DetailTransactionCardModel)
  card?: DetailTransactionCardModel | null;

  @Expose()
  @Type(() => DetailTransactionPaypalModel)
  paypal!: DetailTransactionPaypalModel;
}

@Exclude()
class DetailTransactionPaymentMethodModel {
  @Expose()
  type!: TPaymentMethodType;

  @Expose()
  @Type(() => DetailTransactionPaymentInfoModel)
  info!: DetailTransactionPaymentInfoModel;

  @Expose({ name: "vendor_pm_id" })
  vendorPaymentMethodId!: string;
}

@Exclude()
class DetailTransactionPaddleModel {
  @Expose({ name: "transaction_id" })
  transactionId!: string;

  @Expose()
  currency!: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];

  @Expose({ name: "subscription_id" })
  subscriptionId!: string;

  @Expose({ name: "invoice_id" })
  invoiceId!: string;

  @Expose({ name: "invoice_number" })
  invoiceNumber!: string;

  @Expose({ name: "interval_unit" })
  intervalUnit!: (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit];

  @Expose()
  interval!: string; // value of interval unit

  @Expose()
  get intervalUnitLabel(): string {
    if (!this.intervalUnit) {
      return "";
    }

    return mapPaymentSubscriptionDurationUnit(this.intervalUnit);
  }

  @Expose({ name: "billing_period_start" })
  billingPeriodStart!: string;

  @Expose({ name: "billing_period_end" })
  billingPeriodEnd!: string;

  @Expose()
  total!: number;

  @Expose()
  tax!: number;

  @Expose({ name: "subtotal" })
  subTotal!: number;

  @Expose()
  discount!: number;

  @Expose()
  fee!: number;

  @Expose({ name: "payment_method" })
  @Type(() => DetailTransactionPaymentMethodModel)
  paymentMethod!: DetailTransactionPaymentMethodModel;

  @Expose({ name: "product_name" })
  productName!: string;

  @Expose()
  status!: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus];

  @Expose()
  origin!: (typeof EPaymentPaddleTransactionOrigin)[keyof typeof EPaymentPaddleTransactionOrigin];

  @Expose({ name: "created_at" })
  createdAt!: string;
}

@Exclude()
export class DetailTransactionItemModel {
  @Expose()
  @Type(() => DetailTransactionPaddleModel)
  paddle!: DetailTransactionPaddleModel;
}

@Exclude()
class PreviewUpgradeDowngradeSubscriptionTransactionModel {
  @Expose({ name: "start_at" })
  startAt!: string;
  @Expose({ name: "end_at" })
  endAt!: string;
  @Expose()
  total!: number;
  @Expose()
  currency!: (typeof EPaymentCurrency)[keyof typeof EPaymentCurrency];

  @Expose()
  tax!: number;

  @Expose()
  discount!: number;
}

@Exclude()
export class PreviewUpgradeDowngradeSubscriptionModel {
  @Expose({ name: "interval_unit" })
  intervalUnit!: (typeof EPaymentSubscriptionDurationUnit)[keyof typeof EPaymentSubscriptionDurationUnit];

  @Expose()
  interval!: string; // value of interval unit

  @Expose({ name: "next_billed_at" })
  nextBilledAt!: string;

  @Expose()
  @Type(() => PreviewUpgradeDowngradeSubscriptionTransactionModel)
  transaction!: PreviewUpgradeDowngradeSubscriptionTransactionModel;
}

@Exclude()
export class PaymentMethodInfoModel {
  @Expose()
  vendor!: TPaymentVendorOfSubscriptionUser;

  @Expose()
  type!: TPaymentType;

  @Expose({ name: "card_type" })
  cardType?: TPaymentCardType;

  @Expose({ name: "card_last4" })
  @Transform(({ value }) => {
    if (!value) {
      return "";
    }
    return `•••• •••• •••• ${value}`;
  })
  cardLast4?: string;

  @Expose({ name: "cardholder_name" })
  cardholderName?: string;

  @Expose({ name: "card_expiry_month" })
  cardExpiryMonth?: number;

  @Expose({ name: "card_expiry_year" })
  cardExpiryYear?: number;
}

@Exclude()
export class PaymentProductModel {
  @Expose({ name: "source_product_id" })
  sourceProductId!: string;

  @Expose({ name: "vendor_product_id" })
  vendorProductId!: string;
}
