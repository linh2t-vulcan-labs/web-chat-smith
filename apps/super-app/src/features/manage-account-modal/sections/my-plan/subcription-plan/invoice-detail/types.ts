import type {
  ECheckoutSessionMode,
  EPaymentPaddleTransactionOrigin,
  EPaymentTransactionStatus,
} from "@/core/models/payment";

export interface TInvoiceRow {
  productName: string;
  quantity: number;
  taxPercentage: string;
  subTotal: string;
  billingPeriod: string;
  status: (typeof EPaymentTransactionStatus)[keyof typeof EPaymentTransactionStatus];
  tax: string;
  discount: string;
  fee: string;
  total: string;
  createdAt: string;
  origin: (typeof EPaymentPaddleTransactionOrigin)[keyof typeof EPaymentPaddleTransactionOrigin];
}

export interface TInvoiceDetailProps {
  transactionId: string;
  transactionMode?: ECheckoutSessionMode;
  open: boolean;
  onClose: () => void;
}
