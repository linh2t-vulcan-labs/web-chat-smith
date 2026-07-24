import { useLocale, useTranslations } from "next-intl";
import React from "react";

import { Avatar } from "@/components/avatar";
import { Divider } from "@/components/divider";
import { GradientBadge } from "@/components/gradient-badge";
import { cn } from "@/components/utils/cn";
import { compositeStyles } from "@/utils/commons/styles";

import {
  getFormattedDate,
  getSubscriptionDueDate,
  getSubscriptionExpiryDate,
} from "../../utils/helpers";
import { TrialDayTree } from "../trial-day-tree";
import type { TSubscriptionCardInfoProps } from "./types";

const getThemeClasses = (theme: TSubscriptionCardInfoProps["theme"]) => {
  const isDarkTheme = theme === "dark";

  return {
    dividerClass: compositeStyles(
      isDarkTheme
        ? "border-border-general-primary!"
        : "border-border-system-neutral!"
    ),
    infoLabelClass: compositeStyles(
      "text-footnoteM-neutral",
      isDarkTheme
        ? "text-text-general-quaternary"
        : "dark:text-text-general-tertiary"
    ),
    infoValueClass: compositeStyles(
      "text-footnoteM-neutral",
      isDarkTheme
        ? "text-text-general-secondary"
        : "dark:text-text-general-inverse"
    ),
    userNameClass: compositeStyles(
      "text-bodyS-highlight",
      isDarkTheme
        ? "text-text-general-primary"
        : "dark:text-text-general-inverse"
    ),
  };
};

const getBadgeArgs = (
  theme: TSubscriptionCardInfoProps["theme"]
): React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
> =>
  theme === "light"
    ? {
        className: "w-max rounded-circle bg-black-950",
      }
    : {
        className: "w-max rounded-circle border border-white/5",
        style: {
          borderWidth: 0.5,
        },
      };

const getBadgeMeta = (
  isExpired: boolean,
  commonT: ReturnType<typeof useTranslations>
) => ({
  badgeText: commonT(isExpired ? "expire" : "free"),
  badgeType: isExpired ? ("expired" as const) : ("free" as const),
});

const safeTranslateDuration = (
  advLabel: string,
  commonT: ReturnType<typeof useTranslations>
): string => {
  const advLabelTranslated = commonT(`frequency.${advLabel}`);
  return advLabelTranslated ?? advLabel;
};

const getNextPaymentDate = (
  isTrialProduct: boolean,
  locale: string,
  productInfo: TSubscriptionCardInfoProps["productInfo"]
): string => {
  if (isTrialProduct) {
    return getSubscriptionDueDate(locale);
  }

  if (productInfo?.durationValue) {
    return getSubscriptionExpiryDate(
      productInfo.durationValue,
      productInfo.durationUnit,
      locale
    );
  }

  return "";
};

const SubscriptionCardInfo: React.FC<TSubscriptionCardInfoProps> = ({
  user,
  productInfo,
  subscriptionInfo,
  showPlan,
  spacing = "medium",
  theme = "dark",
}) => {
  const locale = useLocale();
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");
  const fallbackName = commonT("unknownUser");
  const { isExpired } = subscriptionInfo;
  const displayName = user.username || user.email;
  const isTrialProduct = Boolean(productInfo?.isTrial);
  const showUpgradeDate = isTrialProduct;
  const { userNameClass, infoLabelClass, infoValueClass, dividerClass } =
    getThemeClasses(theme);
  const badgeArgs = getBadgeArgs(theme);
  const { badgeType, badgeText } = getBadgeMeta(isExpired, commonT);

  const planLabelMobile = productInfo?.advDurationUnitLabel
    ? safeTranslateDuration(productInfo.advDurationUnitLabel, commonT)
    : "";
  const planLabelDesktop = commonT("amountPerDuration", {
    amount: productInfo?.numberOfMonths ?? 0,
    duration: commonT("duration.month"),
  });

  const nextPaymentDate = getNextPaymentDate(
    isTrialProduct,
    locale,
    productInfo
  );

  const totalPaymentValue = isTrialProduct
    ? "$0"
    : productInfo?.priceWithCurrencySymbol;

  return (
    <div
      className={cn("flex flex-col", {
        "gap-medium-2": spacing === "large",
        "gap-small-1": spacing === "medium",
      })}
    >
      <div className="mb-small-0 md:mb-small-1 flex items-center justify-between">
        <div className="gap-small-1 flex items-center">
          <Avatar
            imageURL={user?.avatar}
            alt="user avatar"
            size="medium"
            className="bg-surface-system-neutral text-bodyS-highlight size-[48px] border-transparent"
          >
            {displayName || fallbackName[0]}
          </Avatar>
          <div className={userNameClass}>{displayName}</div>
        </div>
        <div>
          <div {...badgeArgs}>
            <GradientBadge
              size="small"
              containerClassName="min-w-large-4"
              type={badgeType}
              text={badgeText}
            />
          </div>
        </div>
      </div>
      <Divider direction="horizontal" className={dividerClass} />
      <div className={cn("gap-small-1 flex flex-col")}>
        {showPlan && (
          <div className="flex items-center justify-between">
            <div className={infoLabelClass}>{dsT("info.plan")}</div>
            <div className={cn(infoValueClass, "capitalize")}>
              <span className="inline-block md:hidden">{planLabelMobile}</span>
              <span className="hidden md:inline-block">{planLabelDesktop}</span>
            </div>
          </div>
        )}

        {showUpgradeDate && (
          <div className="flex items-center justify-between">
            <div className={infoLabelClass}>{dsT("info.upgradeDate")}</div>
            <div className={infoValueClass}>{getFormattedDate(locale)}</div>
          </div>
        )}

        {isTrialProduct ? (
          <TrialDayTree
            theme={theme}
            price={productInfo?.priceWithCurrencySymbol ?? "$0"}
          />
        ) : (
          <div className="flex items-center justify-between">
            <div className={infoLabelClass}>{dsT("info.validUtil")}</div>
            <div className={infoValueClass}>{dsT("info.untilYouCancel")}</div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className={infoLabelClass}>{dsT("info.nextPayment")}</div>
          <div className={infoValueClass}>{nextPaymentDate}</div>
        </div>
      </div>
      <Divider direction="horizontal" className={dividerClass} />
      <div className="flex items-center justify-between">
        <div className="text-footnoteM-neutral text-text-general-tertiary">
          {dsT("info.totalPayment")}
        </div>
        <div className="text-app-title-0 text-text-general-brand-identity">
          {totalPaymentValue}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCardInfo;
