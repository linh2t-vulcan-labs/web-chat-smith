import { useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

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

const PaymentDisclaimer = () => {
  const dsT = useTranslations("ds");

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });
  return (
    <div className="gap-small-1 flex flex-col items-center">
      <div className="gap-small-0.5 md:gap-small-1 flex items-center justify-center">
        <SVGIcon
          className="text-text-general-primary inline-block"
          src="/icons/outlined/protect.svg"
          width={16}
          height={16}
        />
        <span className="text-footnoteM-highlight text-text-system-neutral">
          {dsT("safeAndSecure")}
        </span>
      </div>
      <div className="text-footnoteM-neutral text-text-general-quaternary cursor-pointer text-center leading-4 font-normal tracking-normal">
        {policyT}
      </div>
    </div>
  );
};

export default PaymentDisclaimer;
