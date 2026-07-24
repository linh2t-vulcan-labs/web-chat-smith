import { useTranslations } from "next-intl";

import type { TInvoiceInfo } from "@/features/manage-account-modal/utils";

import { PaymentCardInfo } from "../../../payment/payment-card-info";

interface TPaymentMethodSectionProps {
  invoiceInfo: TInvoiceInfo;
}

export function PaymentMethodSection(
  props: Readonly<TPaymentMethodSectionProps>
) {
  const { invoiceInfo } = props;
  const myPlanT = useTranslations("myPlan");

  return (
    <div className="gap-v1-structural-component-large flex flex-col">
      <span className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
        {myPlanT("invoice.paymentMethod")}
      </span>
      <PaymentCardInfo
        paymentMethodType={invoiceInfo.paymentInfo.paymentMethodType}
        cardType={invoiceInfo.paymentInfo.cardType}
        cardNumber={invoiceInfo.paymentInfo.cardNumber}
        cardholderName={invoiceInfo.paymentInfo.cardholderName}
        expiredAt={invoiceInfo.paymentInfo.expiredAt}
      />
    </div>
  );
}
