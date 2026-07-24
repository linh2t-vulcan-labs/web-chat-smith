import { useTranslations } from "next-intl";
import Link from "next/link";
import { Checkbox } from "radix-ui";
import React, { useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { Divider } from "@/components/divider";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useGlobalState } from "@/store/global/hooks";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import { SubscriptionCardInfo } from "../subscription-card-info";

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

const SubscriptionTier3Detail = ({
  productInfo,
  onBack,
  onContinue,
}: {
  productInfo: ProductModel;
  onBack?: () => void;
  onContinue?: () => void;
}) => {
  const dsT = useTranslations("ds");
  const [agree, setAgree] = useState(false);
  const user = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <div className="w-full">
      <div className="flex w-full flex-col">
        <SubscriptionCardInfo
          showPlan
          theme="light"
          productInfo={productInfo}
          subscriptionInfo={userSubscriptionInfo}
          user={user}
        />
        <div className="flex flex-col">
          <Divider
            direction="horizontal"
            className="border-border-system-neutral! mb-small-1 mt-small-1"
          />
          <div className="gap-small-1 flex flex-col items-start">
            <div className="gap-small-0.5 md:gap-small-1 flex items-center justify-center">
              <span className="text-footnoteS-highlight dark:text-text-general-inverse md:text-bodyS-highlight">
                {dsT("safeAndSecure")}
              </span>
            </div>
            <div className="gap-small-1 flex items-start">
              <Checkbox.Root
                id="agreement"
                className="data-[state=checked]:bg-border-brand-identity data-[state=unchecked]:border-border-general-primary data-[state=unchecked]:bg-border-system-neutral mt-px flex size-4 min-w-4 appearance-none items-center justify-center rounded border outline-none data-[state=checked]:border-transparent"
                onCheckedChange={(checked) => {
                  setAgree(Boolean(checked));
                }}
              >
                <Checkbox.Indicator className="rounded-subtle">
                  <SVGIcon
                    className="text-text-general-inverse dark:text-text-general-primary"
                    src="/icons/outlined/check.svg"
                    width={12}
                    height={12}
                  />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <label
                htmlFor="agreement"
                className="text-footnoteS-neutral text-text-general-quaternary md:text-footnoteM-neutral cursor-pointer leading-4 font-medium tracking-normal md:font-normal"
              >
                {policyT}
              </label>
            </div>
          </div>
        </div>
        <div className="mt-large-5 gap-small-1 flex flex-col">
          <div className="gap-medium-1.25 flex flex-col">
            <ButtonV2
              type="button"
              disabled={Boolean(!agree)}
              onClick={onContinue}
              className="rounded-rounded text-bodyM-highlight text-text-general-secondary order-1 h-[36px] font-medium md:order-2"
            >
              {dsT("submit")}
              <SVGIcon
                className="text-text-general-primary hidden md:inline-block rtl:rotate-180"
                src="/icons/outlined/arrow-right-v2.svg"
                width={24}
                height={24}
              />
            </ButtonV2>
            <div className="gap-small-1 order-2 flex items-center justify-center md:order-1">
              <SVGIcon
                className="text-text-general-primary"
                src="/icons/filled/time.svg"
                width={16}
                height={16}
              />
              <span className="text-bodyS-highlight dark:text-text-general-inverse">
                {dsT("cancelAnytime")}
              </span>
            </div>
          </div>
          <ButtonV2
            color="outline"
            className="dark:text-text-general-inverse"
            onClick={onBack}
          >
            {dsT("chooseOtherPlan")}
          </ButtonV2>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTier3Detail;
