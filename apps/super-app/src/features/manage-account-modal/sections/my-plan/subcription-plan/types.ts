import type { ReactNode } from "react";

import type { TPaymentSubscriptionStatus } from "@/core/models/payment";

import type { TPlanStatusTagColor } from "../types";
import type { TUpgradeDowngradePlanStep } from "./upgrade-downgrade-plan/types";

export type TPeriodSubscriptionInfoProps = Readonly<{
  title?: string;
  description?: string | ReactNode;
}>;

export type TSubscriptionPlanPriceInfo = Readonly<{
  amountLabel: string;
  durationUnitLabel?: string;
  description?: ReactNode;
}>;

export type TSubscriptionPlanTimelineInfo = Readonly<{
  currentPeriodRange: string;
  currentPeriodEnd: string;
  nextBillingDate?: string;
  expiredAt: string;
  isInTrialGracePeriod: boolean;
}>;

export type TSubscriptionPlanStatusTag = Readonly<{
  color: TPlanStatusTagColor;
  label: string;
}>;

export type TSubscriptionCardInfoProps = Readonly<{
  planInfo: TSubscriptionPlanInfo;
  triggerNode?: ReactNode;
  onCancelClick?: () => void;
  onUpdatePlanClick?: () => void;
  isShowStatusTag?: boolean;
  footerActions?: ReactNode;
}>;

export type TBillingContentProps = Readonly<{
  subscriptionPlanInfo: TSubscriptionPlanInfo;
  subscriptionId: string;
}>;

export type TBillingHistoryProps = Readonly<{
  subscriptionId: string;
  isBillingTrial?: boolean;
  resetPaginationTrigger?: number; // reset pagination when trigger is changed
  onFetchedBillingHistory?: (isExitsRefundTxt: boolean) => void;
}>;

export type TManageSubscriptionItem = Readonly<{
  id: string;
  sourceProductId: string;
  planInfo: TSubscriptionPlanInfo;
}>;

export type TCancelPlanConfigState = Readonly<{
  open: boolean;
  status: "inProgress" | "success" | "uncancelled";
  item: TManageSubscriptionItem | null;
}>;

export type TUpgradeDowngradePlanModalConfigState = Readonly<{
  open: boolean;
  item: TManageSubscriptionItem | null;
  step: TUpgradeDowngradePlanStep;
}>;

export type TSubscriptionCardInfoNoticeProps = Readonly<{
  type: "free" | "mobile";
  onClick?: () => void;
}>;

export type TSubscriptionPlanInfo = Readonly<{
  title: string;
  status: TPaymentSubscriptionStatus;
  price?: TSubscriptionPlanPriceInfo;
  timeline: TSubscriptionPlanTimelineInfo;
  badgeNode?: React.ReactNode;
  statusTagOverride?: TSubscriptionPlanStatusTag;
  canRenew?: boolean;
}>;
