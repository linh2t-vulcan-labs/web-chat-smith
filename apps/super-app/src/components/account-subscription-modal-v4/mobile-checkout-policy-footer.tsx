import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { Link } from "@/i18n/navigation";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

const PAYMENT_METHOD = [
  "/Visa.png",
  "/Mastercard.png",
  "/Maestro.png",
  // "/PayPal.png",
  "/ApplePay.png",
  "/GooglePay.png",
  "/Amex.png",
  "/DinersClub.png",
];
const renderBreakMobile = () => <br className="md:hidden" />;

const renderTermsLink = (chunks: React.ReactNode) => (
  <Link
    className="underline"
    target="_blank"
    rel="noopener noreferrer"
    href={TERMS_OF_USE_URL}
  >
    {chunks}
  </Link>
);

const renderPrivacyLink = (chunks: React.ReactNode) => (
  <Link
    className="underline"
    target="_blank"
    rel="noopener noreferrer"
    href={PRIVACY_POLICY_URL}
  >
    {chunks}
  </Link>
);

const renderRefundLink = (chunks: React.ReactNode) => (
  <Link
    className="underline"
    target="_blank"
    rel="noopener noreferrer"
    href={REFUND_POLICY_URL}
  >
    {chunks}
  </Link>
);

/** "Safe & secure" + terms/privacy/refund policy text shown beneath the V2 mobile checkout. */
export const MobileCheckoutPolicyFooter: React.FC = () => {
  const dsT = useTranslations("ds");

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <div className="flex flex-col">
      <div className="gap-small-0.5 flex items-center justify-center">
        <SVGIcon
          className="text-text-general-primary inline-block rtl:rotate-180"
          src="/icons/outlined/protect.svg"
          width={16}
          height={16}
        />
        <span className="text-footnoteM-highlight text-text-system-neutral">
          {dsT("safeAndSecure")}
        </span>
      </div>
      <div className="mt-small-0.5 text-footnoteM-neutral text-text-general-quaternary text-center">
        {policyT}
      </div>

      <div className="mt-medium-3 pt-small-1.5 flex items-center justify-center">
        <div className="gap-small-0.75 flex items-center justify-center">
          {PAYMENT_METHOD.map((src) => (
            <Image
              key={src}
              src={`/images/payment${src}`}
              alt="payment method"
              width={23}
              height={16}
              className="h-4 w-auto"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
