import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useMemo } from "react";

import type {
  TPaymentCardType,
  TPaymentMethodType,
} from "@/core/models/payment";
import { EPaymentMethodType } from "@/core/models/payment";

import type { TPaymentCardInfoProps } from "./types";

const CARD_IMAGE_PATHS: Record<TPaymentCardType, string> = {
  american_express: "/images/payment/Amex.png",
  apple_pay: "/images/payment/ApplePay.png",
  diners_club: "/images/payment/DinersClub.png",
  discover: "/images/payment/Discover.png",
  google_pay: "/images/payment/GooglePay.png",
  jcb: "/images/payment/JCB.png",
  mada: "/images/payment/Mada.png",
  maestro: "/images/payment/Maestro.png",
  mastercard: "/images/payment/Mastercard.png",
  union_pay: "/images/payment/UnionPay.png",
  unknown: "/images/payment/Unknown.png",
  visa: "/images/payment/Visa.png",
};

function isWalletPaymentMethod(type: TPaymentMethodType): boolean {
  return (
    type === EPaymentMethodType.PAYMENT_METHOD_APPLE_PAY ||
    type === EPaymentMethodType.PAYMENT_METHOD_GOOGLE_PAY
  );
}

const PaymentCardInfo: React.FC<TPaymentCardInfoProps> = ({
  paymentMethodType,
  cardType = "unknown",
  cardNumber,
  cardholderName,
  expiredAt,
  triggerNode,
}) => {
  const t = useTranslations("myPlan");
  const isWallet = isWalletPaymentMethod(paymentMethodType);
  const cardImageSrc = useMemo(() => {
    if (paymentMethodType === EPaymentMethodType.PAYMENT_METHOD_APPLE_PAY) {
      return CARD_IMAGE_PATHS.apple_pay;
    }
    if (paymentMethodType === EPaymentMethodType.PAYMENT_METHOD_GOOGLE_PAY) {
      return CARD_IMAGE_PATHS.google_pay;
    }
    return CARD_IMAGE_PATHS[cardType];
  }, [paymentMethodType, cardType]);

  return (
    <div className="gap-v1-structural-content-tight flex h-fit w-full">
      <div className="h-full w-9">
        {cardImageSrc && (
          <Image
            src={cardImageSrc}
            alt={`${cardType} card`}
            width={36}
            height={24}
          />
        )}
      </div>

      <div className="flex w-full items-start justify-between">
        {isWallet ? (
          <div />
        ) : (
          <div className="gap-v1-structural-content-micro typo-v1-title-md-normal text-v1-text-hierarchy-primary flex w-full flex-col items-start justify-start">
            <div>{cardNumber}</div>
            <div className="gap-v1-content-micro typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary flex flex-col">
              <div>{cardholderName}</div>
              {expiredAt && (
                <div>
                  {t("paymentCard.expiredDateLabel", { date: expiredAt })}
                </div>
              )}
            </div>
          </div>
        )}
        {triggerNode}
      </div>
    </div>
  );
};

PaymentCardInfo.displayName = "PaymentCardInfo";
export { PaymentCardInfo };
