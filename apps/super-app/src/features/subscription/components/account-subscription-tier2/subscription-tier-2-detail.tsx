import { useTranslations } from "next-intl";
import Link from "next/link";
import { Checkbox } from "radix-ui";
import React, { useState } from "react";

import { ButtonV2 } from "@/components/button-v2";
import { Divider } from "@/components/divider";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import { SubscriptionActionButtonV2 } from "../account-subscription-tier1/subscription-action-button-v2";
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

const SubscriptionTier2Detail = ({
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
  const isTrialProduct = productInfo?.isTrial;

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <div className="flex w-full">
      <div className="flex w-full flex-col">
        <SubscriptionCardInfo
          productInfo={productInfo}
          subscriptionInfo={userSubscriptionInfo}
          spacing="large"
          theme="light"
          showPlan
          user={user}
        />
        <div className="flex flex-col">
          <Divider
            direction="horizontal"
            className="border-border-system-neutral! my-medium-2"
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
        <div
          className={compositeStyles(
            "gap-small-1 flex flex-col",
            isTrialProduct ? "mt-[72px]" : "mt-large-10"
          )}
        >
          <SubscriptionActionButtonV2
            disabled={!agree}
            onContinue={onContinue}
            theme="light"
          />
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

export default SubscriptionTier2Detail;
