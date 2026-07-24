import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { Checkbox } from "radix-ui";
import React, { useEffect, useState } from "react";

import { Avatar } from "@/components/avatar";
import { Divider } from "@/components/divider";
import { GradientBadge } from "@/components/gradient-badge";
import { SVGIcon } from "@/components/svg-icon";
import type { ProductModel } from "@/core/models/product";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import {
  getFormattedDate,
  getSubscriptionDueDate,
  getSubscriptionExpiryDate,
} from "../../utils/helpers";
import { TrialDayTree } from "../trial-day-tree";
import { SubscriptionActionButtonV2 } from "./subscription-action-button-v2";

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

const SubscriptionDesktopDetail = ({
  productInfo,
  onContinue,
}: {
  productInfo?: ProductModel;
  onContinue?: () => void;
}) => {
  const user = useGlobalState((state) => state.user);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);
  const [agree, setAgree] = useState(false);
  const locale = useLocale();

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- resets agreement checkbox when the selected product changes; external event (product switch) driving derived state reset, not a render derivation
    setAgree((prev) => (prev ? false : prev));
  }, [productInfo?.id]);

  const t = useTranslations("common");
  const dsT = useTranslations("ds");
  const { isExpired } = userSubscriptionInfo;
  const fallbackName = t("unknownUser");
  const displayName = user.username || user.email;
  const isTrialProduct = productInfo?.isTrial;

  const policyT = dsT.rich("policy", {
    breakMobile: renderBreakMobile,
    privacy: renderPrivacyLink,
    refund: renderRefundLink,
    terms: renderTermsLink,
  });

  return (
    <div className="gap-medium-2 flex flex-col">
      {isAuthenticated && (
        <>
          <div className="flex items-center justify-between">
            <div className="gap-small-1 flex items-center">
              <Avatar
                imageURL={user?.avatar}
                alt="user avatar"
                size="medium"
                className="bg-surface-system-neutral text-bodyS-highlight size-[48px] border-transparent"
              >
                {displayName || fallbackName[0]}
              </Avatar>
              <div className="text-bodyS-highlight">{displayName}</div>
            </div>
            <div>
              {isExpired ? (
                <GradientBadge
                  size="small"
                  type="expired"
                  containerClassName="min-w-large-4"
                  text={t("expire")}
                />
              ) : (
                <GradientBadge
                  size="small"
                  type="free"
                  containerClassName="min-w-large-4"
                  text={t("free")}
                />
              )}
            </div>
          </div>
          <Divider
            direction="horizontal"
            className="border-border-general-primary!"
          />
        </>
      )}

      <div className="gap-small-1 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="text-footnoteM-neutral text-text-general-quaternary">
            {dsT("info.upgradeDate")}
          </div>
          <div className="text-footnoteM-neutral text-text-general-secondary">
            {getFormattedDate(locale)}
          </div>
        </div>
        {isTrialProduct ? (
          <TrialDayTree price={productInfo.priceWithCurrencySymbol} />
        ) : (
          <div className="flex items-center justify-between">
            <div className="text-footnoteM-neutral text-text-general-quaternary">
              {dsT("info.validUtil")}
            </div>
            <div className="text-footnoteM-neutral text-text-general-secondary">
              {dsT("info.untilYouCancel")}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-footnoteM-neutral text-text-general-quaternary">
            {dsT("info.nextPayment")}
          </div>
          <div className="text-footnoteM-neutral text-text-general-secondary">
            {!isTrialProduct && productInfo && productInfo?.durationValue
              ? getSubscriptionExpiryDate(
                  productInfo.durationValue,
                  productInfo.durationUnit,
                  locale
                )
              : ""}
            {isTrialProduct && getSubscriptionDueDate(locale)}
          </div>
        </div>
      </div>
      <Divider
        direction="horizontal"
        className="border-border-general-primary!"
      />
      <div className="flex items-center justify-between">
        <div className="text-footnoteM-neutral text-text-general-quaternary">
          {dsT("info.totalPayment")}
        </div>
        <div className="text-text-general-brand-identity text-app-title-0">
          {isTrialProduct
            ? `${productInfo?.currencySymbol}0`
            : productInfo?.priceWithCurrencySymbol}
        </div>
      </div>
      <Divider
        direction="horizontal"
        className="border-border-general-primary!"
      />
      <div className="gap-medium-2 flex flex-col items-start">
        <div className="gap-small-0.5 md:gap-small-1 flex items-center justify-center">
          <SVGIcon
            className="text-text-general-primary inline-block"
            src="/icons/outlined/protect.svg"
            width={20}
            height={20}
          />
          <span className="text-footnoteS-highlight text-text-system-neutral md:text-bodyS-highlight">
            {dsT("safeAndSecure")}
          </span>
        </div>
        <div className="gap-small-1 flex items-start">
          <Checkbox.Root
            id="agreement"
            checked={agree}
            className="data-[state=checked]:bg-border-brand-identity data-[state=unchecked]:border-border-general-primary data-[state=unchecked]:bg-surface-inputControl-neutral-default flex size-4 min-w-4 appearance-none items-center justify-center rounded border bg-transparent outline-none data-[state=checked]:border-transparent"
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
            className="text-footnoteM-neutral text-text-general-quaternary md:text-footnoteM-neutral cursor-pointer leading-4 font-normal tracking-normal md:font-normal"
          >
            {policyT}
          </label>
        </div>
      </div>
      {/* Action button */}
      <div
        className={compositeStyles(
          isTrialProduct ? "mt-small-1" : "mt-large-5"
        )}
      >
        <SubscriptionActionButtonV2
          isTrial={isTrialProduct}
          disabled={!agree}
          onContinue={onContinue}
        />
      </div>
    </div>
  );
};

export default SubscriptionDesktopDetail;
