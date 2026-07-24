import type {
  TPaymentCardType,
  TPaymentMethodType,
} from "@/core/models/payment";

export interface TPaymentCardInfoProps {
  paymentMethodType: TPaymentMethodType;
  /** Card brand; optional when the backend omits it (e.g. some wallet flows). */
  cardType?: TPaymentCardType;
  /** Masked PAN; omitted or empty for Apple Pay / Google Pay. */
  cardNumber?: string;
  cardholderName?: string;
  expiredAt?: string;
  triggerNode?: React.ReactNode;
}
