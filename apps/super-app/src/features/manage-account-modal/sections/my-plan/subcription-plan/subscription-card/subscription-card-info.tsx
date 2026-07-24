import { useTranslations } from "next-intl";
import React from "react";

import { Badge } from "@/components/badge-ds";
import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import type { TPaymentSubscriptionStatus } from "@/core/models/payment";
import { EPaymentSubscriptionStatus } from "@/core/models/payment";

import { PlanStatusTag } from "../../plan-status-tag";
import type { TPlanStatusTagColor } from "../../types";
import type {
  TSubscriptionCardInfoProps,
  TSubscriptionPlanTimelineInfo,
} from "../types";

const tagStatusColorMapping: Partial<
  Record<TPaymentSubscriptionStatus, TPlanStatusTagColor>
> = {
  [EPaymentSubscriptionStatus.ACTIVE]: "green",
  [EPaymentSubscriptionStatus.CANCELLED]: "red",
  [EPaymentSubscriptionStatus.EXPIRED]: "neutral",
} as const;

const PeriodSubscriptionInfo = (props: {
  title?: string;
  description?: React.ReactNode;
}) => {
  const { title, description } = props;

  if (!title && !description) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {title && (
        <span className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
          {title}
        </span>
      )}
      {description && (
        <span className="typo-v1-caption-mdhelper-text text-v1-text-hierarchy-secondary">
          {description}
        </span>
      )}
    </div>
  );
};

const renderActiveInfo = (
  timeline: TSubscriptionPlanTimelineInfo,
  t: (key: string) => string
) => (
  <>
    <PeriodSubscriptionInfo
      title={t("subscription.currentPeriodLabel")}
      description={timeline.currentPeriodRange}
    />
    <PeriodSubscriptionInfo
      title={t("subscription.nextBillingDateLabel")}
      description={timeline.nextBillingDate ?? "-"}
    />
  </>
);

const renderCancelledInfo = (
  timeline: TSubscriptionPlanTimelineInfo,
  t: (key: string, values?: Record<string, string>) => string
) => (
  <PeriodSubscriptionInfo
    title={t("subscription.currentPeriodLabel")}
    description={
      <span className="gap-v1-structural-content-micro flex flex-col">
        <span>{timeline.currentPeriodRange}</span>
        <span>
          {t("subscription.scheduledToCancelOn", {
            date: timeline.currentPeriodEnd ?? "",
          })}
        </span>
      </span>
    }
  />
);

const renderExpiredInfo = (
  timeline: TSubscriptionPlanTimelineInfo,
  t: (key: string) => string
) => (
  <PeriodSubscriptionInfo
    title={t("subscription.expiredDateLabel")}
    description={timeline.expiredAt}
  />
);

const renderStatusSection = (
  status: TPaymentSubscriptionStatus,
  timeline: TSubscriptionPlanTimelineInfo,
  t: (key: string, values?: Record<string, string>) => string
) => {
  switch (status) {
    case EPaymentSubscriptionStatus.ACTIVE: {
      return renderActiveInfo(timeline, t);
    }
    case EPaymentSubscriptionStatus.CANCELLED: {
      return renderCancelledInfo(timeline, t);
    }
    case EPaymentSubscriptionStatus.EXPIRED: {
      return renderExpiredInfo(timeline, t);
    }
    default: {
      return null;
    }
  }
};

const statusLabelKeyMapping: Partial<
  Record<TPaymentSubscriptionStatus, string>
> = {
  [EPaymentSubscriptionStatus.ACTIVE]: "status.active",
  [EPaymentSubscriptionStatus.CANCELLED]: "status.cancelled",
  [EPaymentSubscriptionStatus.EXPIRED]: "status.expired",
};

export default function SubscriptionCardInfo(
  props: TSubscriptionCardInfoProps
) {
  const {
    planInfo,
    triggerNode,
    onCancelClick,
    onUpdatePlanClick,
    isShowStatusTag = true,
    footerActions,
  } = props;
  const {
    title,
    price,
    timeline,
    status,
    badgeNode,
    statusTagOverride,
    canRenew,
  } = planInfo;

  const t = useTranslations("myPlan");

  const computedColor = status ? tagStatusColorMapping[status] : undefined;
  const computedLabelKey = status ? statusLabelKeyMapping[status] : undefined;

  const tagConfig =
    statusTagOverride ??
    (computedColor && computedLabelKey
      ? {
          color: computedColor,
          label: t(computedLabelKey),
        }
      : undefined);

  const priceContent = price?.description ?? price?.amountLabel ?? null;
  const isShowPrice = Boolean(priceContent);

  const isCancelled = status === EPaymentSubscriptionStatus.CANCELLED;
  const isExistSecondaryButton = [
    EPaymentSubscriptionStatus.CANCELLED,
    EPaymentSubscriptionStatus.ACTIVE,
  ].some((subscriptionStatus) => subscriptionStatus === status);
  const isExpired = status === EPaymentSubscriptionStatus.EXPIRED;
  const shouldShowRenewButton = isExpired && canRenew;
  const { isInTrialGracePeriod } = timeline;

  const badgeContent =
    badgeNode === undefined ? (
      <Badge.Level color="gold" size="md">
        <SvgIcon name="gold" size={16} /> {t("notice.badgePro")}
      </Badge.Level>
    ) : (
      badgeNode
    );

  const renderActionButton = () => {
    if (isInTrialGracePeriod && status === EPaymentSubscriptionStatus.TRIAL) {
      return null;
    }
    return (
      <Button
        variant="gold"
        size="l"
        className={cn(
          "w-full text-nowrap md:w-fit md:min-w-[240px]",
          isExpired ? "max-w-fit" : ""
        )}
        onClick={onUpdatePlanClick}
      >
        {isExpired ? t("actions.renew") : t("actions.updatePlan")}
      </Button>
    );
  };

  const renderGracePeriodInfo = () => (
    <p className="text-bodyS-neutral text-text-general-tertiary">
      {t("trial.info", {
        amount: price?.amountLabel || "",
        endDate: timeline.currentPeriodEnd,
        unit: price?.durationUnitLabel || "",
      })}
    </p>
  );

  const renderDefaultFooterActions = () => (
    <div className="gap-v1-structural-content-micro flex w-full justify-start md:justify-end">
      {isExistSecondaryButton && (
        <Button
          variant="outline"
          size="l"
          className={cn("w-full text-nowrap md:w-fit md:min-w-[137px]")}
          onClick={onCancelClick}
        >
          {isCancelled ? t("actions.dontCancelPlan") : t("actions.cancelPlan")}
        </Button>
      )}
      {(!isExpired || shouldShowRenewButton) && renderActionButton()}
    </div>
  );

  return (
    <div className="gap-v1-structural-component-large flex w-full flex-col">
      {isShowStatusTag && tagConfig && (
        <PlanStatusTag color={tagConfig.color} label={tagConfig.label} />
      )}

      <div className="flex items-center justify-between">
        <div className="gap-v1-structural-content-tight flex w-full items-center">
          <span className="typo-v1-markdown-h1 text-v1-level-gold-text">
            {title}
          </span>
          {badgeContent}
        </div>
        {triggerNode}
      </div>

      {isShowPrice && priceContent}

      {isInTrialGracePeriod &&
        status === EPaymentSubscriptionStatus.TRIAL &&
        renderGracePeriodInfo()}

      <div className="gap-medium-2 flex w-full flex-col">
        {renderStatusSection(status, timeline, t)}
      </div>

      {footerActions ?? renderDefaultFooterActions()}
    </div>
  );
}
