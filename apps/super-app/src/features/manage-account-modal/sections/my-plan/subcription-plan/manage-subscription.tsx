import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React, { useCallback, useMemo, useState } from "react";
import { flushSync } from "react-dom";

import { EPaymentSubscriptionStatus } from "@/core/models/payment";
import type {
  PaymentSubscriptionModel,
  TPaymentSubscriptionStatus,
} from "@/core/models/payment";
import {
  useGetPaymentSubscriptions,
  useHandleFlowCancelSubscription,
} from "@/features/manage-account-modal/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { formatUnixDate } from "@/utils/commons/date-time";
import { LINK_NEED_HELP_CONST } from "@/utils/constants/privilege";
import { getCurrencySymbol } from "@/utils/mappers/payment";

import SubscriptionCardInfoSkeleton from "./subscription-card/subscription-card-info-skeleton";
import type {
  TCancelPlanConfigState,
  TManageSubscriptionItem,
  TUpgradeDowngradePlanModalConfigState,
} from "./types";
import type { TUpgradeDowngradePlanStep } from "./upgrade-downgrade-plan/types";

const CancelPlanModal = dynamic(
  () => import("./cancel-plan/cancel-plan-modal")
);
const LoadingProcessing = dynamic(
  () => import("@/components/loading-icon/loading-processing")
);
const UpgradeDowngradePlanModal = dynamic(
  () => import("./upgrade-downgrade-plan/upgrade-downgrade-plan-modal")
);
const SubscriptionCardInfoNotice = dynamic(
  () => import("./subscription-card/subscription-card-info-notice"),
  {
    loading: () => <SubscriptionCardInfoSkeleton />,
  }
);

const SubscriptionAccordionItem = dynamic(
  () => import("./subscription-accordion-item"),
  {
    loading: () => <SubscriptionCardInfoSkeleton />,
  }
);

const checkStatusSubscription = (
  status: TPaymentSubscriptionStatus,
  nextBillingDate: string
): TPaymentSubscriptionStatus => {
  if (status !== EPaymentSubscriptionStatus.ACTIVE) {
    return status;
  }

  const timestamp = Number(nextBillingDate);

  // If next billing date is not set, is 0, or is not a finite positive number
  // and the status is ACTIVE, then treat the subscription as cancelled.
  if (!nextBillingDate || !Number.isFinite(timestamp) || timestamp <= 0) {
    return EPaymentSubscriptionStatus.CANCELLED;
  }

  return status;
};

const formatSubscriptionPeriod = (start: string, end: string) =>
  `${formatUnixDate(start)} - ${formatUnixDate(end)}`;

const createPriceLabel = (
  currency: PaymentSubscriptionModel["productCurrency"],
  price: number
) => `${getCurrencySymbol(currency)}${String(price)}`;

const renderPriceDescription = (price: string, durationUnitLabel: string) => (
  <span className="typo-v1-body-secondary text-v1-text-hierarchy-tertiary">
    <span className="typo-v1-heading-h4 text-v1-text-hierarchy-primary">
      {price}{" "}
    </span>{" "}
    / {durationUnitLabel}
  </span>
);

const buildManageSubscriptionItem = (
  subscription: PaymentSubscriptionModel,
  t: ReturnType<typeof useTranslations>
): TManageSubscriptionItem => {
  const normalizedStatus = checkStatusSubscription(
    subscription.status,
    subscription.nextBillingDate
  );
  const price = createPriceLabel(
    subscription.productCurrency,
    subscription.productPrice
  );
  const safeParseUnitLabel = (unitLabel: string) => {
    if (
      !unitLabel ||
      !["year", "month", "week", "day"].includes(subscription.intervalUnitLabel)
    ) {
      return "";
    }
    const unitLabelTranslated = t(`duration.${subscription.intervalUnitLabel}`);
    return unitLabelTranslated || "";
  };
  return {
    id: subscription.subscriptionId,
    planInfo: {
      price: {
        amountLabel: price,
        description: renderPriceDescription(
          price,
          safeParseUnitLabel(subscription.intervalUnitLabel)
        ),
        durationUnitLabel: subscription.intervalUnitLabel,
      },
      status: normalizedStatus,
      timeline: {
        currentPeriodEnd: formatUnixDate(subscription.currentPeriodEnd),
        currentPeriodRange: formatSubscriptionPeriod(
          subscription.currentPeriodStart,
          subscription.currentPeriodEnd
        ),
        expiredAt: formatUnixDate(subscription.expiredAt),
        isInTrialGracePeriod: Boolean(subscription.isInTrialGracePeriod),
        nextBillingDate: formatUnixDate(subscription.nextBillingDate),
      },
      title: subscription.productName,
    },
    sourceProductId: subscription.sourceProductId,
  };
};

const defaultCancelPlanModalConfig: TCancelPlanConfigState = {
  item: null,
  open: false,
  status: "inProgress",
};

const defaultUpgradeDowngradePlanModalConfig: TUpgradeDowngradePlanModalConfigState =
  {
    item: null,
    open: false,
    step: "selected-plan",
  };

const buildCancelPlanModalConfig = (
  overrides: Partial<TCancelPlanConfigState> = {}
): TCancelPlanConfigState => ({
  ...defaultCancelPlanModalConfig,
  ...overrides,
});

const subscriptionSkeletonKeys = ["primary"];

const handleClickNeedHelpButton = () => {
  globalThis.window.open(LINK_NEED_HELP_CONST, "_self");
};

const ManageSubscription = () => {
  const commonT = useTranslations("common");
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const { isExistActiveSubscriptionFromMobile, isExistUserSubscription } =
    userSubscriptionInfo;

  const { data, isLoading } = useGetPaymentSubscriptions(
    isExistUserSubscription
  );

  const [cancelPlanModalConfig, setCancelPlanModalConfig] =
    useState<TCancelPlanConfigState>(defaultCancelPlanModalConfig);

  const [upgradeDowngradePlanModalConfig, setUpgradeDowngradePlanModalConfig] =
    useState<TUpgradeDowngradePlanModalConfigState>(
      defaultUpgradeDowngradePlanModalConfig
    );

  const {
    handleCancelSubscription,
    handleUncancelSubscription,
    isLoading: isLoadingCancelFlow,
  } = useHandleFlowCancelSubscription();

  const handleCloseUpgradeDowngradePlanModal = useCallback(() => {
    setUpgradeDowngradePlanModalConfig(defaultUpgradeDowngradePlanModalConfig);
  }, []);

  const handleChangeUpgradeDowngradePlanStep = useCallback(
    (step: TUpgradeDowngradePlanStep) => {
      setUpgradeDowngradePlanModalConfig((prev) => ({
        ...prev,
        step,
      }));
    },
    []
  );

  const handleCloseCancelPlanModal = useCallback(() => {
    setCancelPlanModalConfig(buildCancelPlanModalConfig());
  }, []);

  const infoSubscriptions = useMemo(() => {
    if (!data) {
      return [];
    }

    return data.map((item) => buildManageSubscriptionItem(item, commonT));
  }, [data, commonT]);

  const subscriptionsWithRenewFlag: TManageSubscriptionItem[] = useMemo(() => {
    if (!infoSubscriptions.length) {
      return infoSubscriptions;
    }

    const hasActiveSubscription = infoSubscriptions.some(
      (item) => item.planInfo.status === EPaymentSubscriptionStatus.ACTIVE
    );

    const hasExpiredSubscription = infoSubscriptions.some(
      (item) => item.planInfo.status === EPaymentSubscriptionStatus.EXPIRED
    );

    if (!hasExpiredSubscription || hasActiveSubscription) {
      return infoSubscriptions.map((item) => ({
        ...item,
        planInfo: {
          ...item.planInfo,
          canRenew: false,
        },
      }));
    }

    return infoSubscriptions.map((item) => ({
      ...item,
      planInfo: {
        ...item.planInfo,
        canRenew: item.planInfo.status === EPaymentSubscriptionStatus.EXPIRED,
      },
    }));
  }, [infoSubscriptions]);

  // Stable references so `SubscriptionAccordionItem` (memoized below) doesn't
  // re-render on every unrelated state change (cancel flow loading, other
  // modals opening, etc.) — each item is looked up by id instead of being
  // captured in a fresh inline closure per render.
  const handleOpenUpgradeDowngradePlanModal = useCallback(
    (subscriptionId: string) => {
      const item = subscriptionsWithRenewFlag.find(
        (candidate) => candidate.id === subscriptionId
      );
      if (!item) {
        return;
      }
      if (item.planInfo.status === EPaymentSubscriptionStatus.EXPIRED) {
        setIsOpenSubscriptionModal(true);
        return;
      }
      setUpgradeDowngradePlanModalConfig({
        item,
        open: true,
        step: "selected-plan",
      });
    },
    [subscriptionsWithRenewFlag, setIsOpenSubscriptionModal]
  );

  const handleOpenCancelPlanModal = useCallback(
    (subscriptionId: string) => {
      const item = subscriptionsWithRenewFlag.find(
        (candidate) => candidate.id === subscriptionId
      );
      if (!item) {
        return;
      }
      setCancelPlanModalConfig(
        buildCancelPlanModalConfig({
          item,
          open: true,
          status:
            item.planInfo.status === EPaymentSubscriptionStatus.CANCELLED
              ? "uncancelled"
              : "inProgress",
        })
      );
    },
    [subscriptionsWithRenewFlag]
  );

  const handleConfirmCancelPlan = useCallback(
    (subscriptionId: string) => {
      if (cancelPlanModalConfig.status === "inProgress") {
        handleCancelSubscription(subscriptionId, {
          onSuccess: () => {
            flushSync(() =>
              setCancelPlanModalConfig((prev) => ({
                ...prev,
                status: "success",
              }))
            );
          },
        });

        return;
      }

      if (cancelPlanModalConfig.status === "uncancelled") {
        handleUncancelSubscription(subscriptionId, {
          onSuccess: () => {
            flushSync(() => handleCloseCancelPlanModal());
          },
        });
      }
    },
    [
      cancelPlanModalConfig.status,
      handleCancelSubscription,
      handleUncancelSubscription,
      handleCloseCancelPlanModal,
    ]
  );

  const handleClickGetProButton = useCallback(() => {
    setIsOpenSubscriptionModal(true);
  }, [setIsOpenSubscriptionModal]);

  if (isLoading) {
    return subscriptionSkeletonKeys.map((skeletonKey) => (
      <SubscriptionCardInfoSkeleton key={skeletonKey} />
    ));
  }

  // Empty Subscription when user is free or has no subscription from payment service
  const isEmptySubscription = !data || data?.length === 0;

  if (isExistActiveSubscriptionFromMobile) {
    return (
      <SubscriptionCardInfoNotice
        type="mobile"
        onClick={handleClickNeedHelpButton}
      />
    );
  }

  if (isEmptySubscription) {
    return (
      <SubscriptionCardInfoNotice
        type="free"
        onClick={handleClickGetProButton}
      />
    );
  }

  return (
    <>
      {isLoadingCancelFlow && <LoadingProcessing isSpinning />}
      {subscriptionsWithRenewFlag.map((item) => (
        <SubscriptionAccordionItem
          key={item.id}
          item={item}
          onCancelClick={handleOpenCancelPlanModal}
          onUpdatePlanClick={handleOpenUpgradeDowngradePlanModal}
        />
      ))}
      {cancelPlanModalConfig.open && cancelPlanModalConfig.item && (
        <CancelPlanModal
          open={cancelPlanModalConfig.open}
          status={cancelPlanModalConfig.status}
          item={cancelPlanModalConfig.item}
          isConfirming={isLoadingCancelFlow}
          onClose={handleCloseCancelPlanModal}
          onConfirm={handleConfirmCancelPlan}
        />
      )}
      {upgradeDowngradePlanModalConfig.open &&
        upgradeDowngradePlanModalConfig.item && (
          <UpgradeDowngradePlanModal
            open={upgradeDowngradePlanModalConfig.open}
            item={upgradeDowngradePlanModalConfig.item}
            step={upgradeDowngradePlanModalConfig.step}
            onChangeStep={handleChangeUpgradeDowngradePlanStep}
            onClose={handleCloseUpgradeDowngradePlanModal}
          />
        )}
    </>
  );
};

export default ManageSubscription;
