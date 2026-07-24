import { Exclude, Expose } from "@/libs/class-transformer";
import type { EPAYMENT_VENDOR } from "@/utils/commons/enums";

@Exclude()
export class BillingHistoryPayloadDto {
  @Expose({ name: "customerId" })
  customer_id!: string;

  @Expose()
  vendor!: string;

  @Expose()
  additional!: {
    stripe: {
      return_url: string;
    };
  };
}

@Exclude()
export class GetPaymentInfoPayloadDto {
  @Expose()
  vendor!: EPAYMENT_VENDOR;
}

export interface TGetPaymentSubscriptionResponse {
  subscription_id: string;
  current_period_start: string;
  current_period_end: string;
  next_billing_date: string;
  product_name: string;
  product_price: number;
  product_currency: string;
  status: string;
}

export interface TGetPaymentMethodsResponse {
  data: {
    type: string;
    info: {
      card: {
        cardholder_name: string;
        expiry_month: number;
        expiry_year: number;
        last4: string;
        type: string;
      } | null;
    };
    vender_pm_id: string;
  }[];
}

export interface TGetTransactionsOfSubscriptionResponse {
  data: {
    amount: number;
    amount_capture: number;
    amount_received: number;
    currency: string;
    description: string;
    status: string;
    vendor_payment_id: string;
    order_id: string;
    created_at: string; // Sample format: "2025-11-12T08:57:29.371Z"
    updated_at: string; // Sample format: "2025-11-12T08:57:29.371Z"
  }[];
  next_id: string;
  total_records: string;
}

export interface TGetDetailTransactionResponse {
  data: {
    paddle: {
      transaction_id: string;
      currency: string;
      subscription_id: string;
      invoice_id: string;
      invoice_number: string;
      billing_period_start: string;
      billing_period_end: string;
      total: number;
      tax: number;
      subtotal: number;
      discount: number;
      fee: number;
      payment_method: {
        type: string;
        info: {
          card: {
            cardholder_name: string;
            type: string;
            last4: string;
            expiry_month: number;
            expiry_year: number;
          } | null;
          paypal: {
            email: string;
            reference: string;
          };
        };
        vendor_pm_id: string;
      };
      product_name: string;
      status: string;
      created_at: string;
    };
  };
}

export interface TGetPreviewUpgradeDowngradeSubscriptionResponse {
  interval_unit: string;
  interval: string;
  next_billed_at: string;
  transaction: {
    start_at: string;
    end_at: string;
    total: number;
    currency: string;
    tax: number;
    discount: number;
  };
}
