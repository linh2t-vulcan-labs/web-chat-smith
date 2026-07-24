import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button";
import { SVGIcon } from "@/components/svg-icon";
import { cn } from "@/components/utils/cn";
import { Link } from "@/i18n/navigation";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import type { TSubscriptionActionButtonProps } from "./types";

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

export const SubscriptionActionButton: React.FC<
  TSubscriptionActionButtonProps
> = ({ submitBtnText, onContinue }) => {
  const dsT = useTranslations("ds");

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  // GU-1573
  return (
    <div
      className={cn(
        "gap-medium-1.5 px-large-4 md:gap-medium-2 flex flex-col",
        "-mx-medium-2 p-v1-4 z-10 md:mx-0 md:p-0",
        "bg-surface-general-shade-overlay md:backdrop-blur-0 backdrop-blur-[10px] md:bg-transparent",
        "pb-[env(safe-area-inset-bottom))]"
      )}
    >
      <div className="gap-small-1 order-0 hidden items-center justify-center md:order-2 md:flex">
        <SVGIcon
          className="text-text-general-primary"
          src="/icons/filled/time.svg"
          width={16}
          height={16}
        />
        <span className="text-bodyS-highlight text-text-general-secondary uppercase">
          {dsT("cancelAnytime")}
        </span>
      </div>
      <Button
        type="button"
        className="mb-small-0 rounded-rounded text-bodyM-medium text-text-general-primary md:rounded-pill-soft md:text-bodyM-highlight order-2 h-[36px] font-medium md:order-1 md:h-[56px] md:font-semibold"
        onClick={() => onContinue?.()}
      >
        {submitBtnText}
        <SVGIcon
          className="text-text-general-primary hidden md:inline-block rtl:rotate-180"
          src="/icons/outlined/arrow-right-v2.svg"
          width={24}
          height={24}
        />
      </Button>
      <div className="mt-medium-0.5 gap-medium-1.25 order-3 flex flex-col">
        <div className="gap-small-0.5 md:gap-small-1 flex items-center justify-center">
          <SVGIcon
            className="text-text-general-primary inline-block rtl:rotate-180"
            src="/icons/outlined/protect.svg"
            width={16}
            height={16}
          />
          <span className="text-footnoteS-highlight text-text-system-neutral md:text-bodyS-highlight">
            {dsT("safeAndSecure")}
          </span>
        </div>
        <div className="text-footnoteM-neutral text-text-general-quaternary text-center text-[11px] leading-4 font-medium tracking-normal md:font-normal">
          {policyT}
        </div>
      </div>
    </div>
  );
};
