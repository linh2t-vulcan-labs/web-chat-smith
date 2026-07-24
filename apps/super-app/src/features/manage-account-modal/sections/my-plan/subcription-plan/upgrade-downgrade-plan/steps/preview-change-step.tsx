import { useTranslations } from "next-intl";
import { Separator } from "radix-ui";
import { useMemo } from "react";

import { Button } from "@/components/button-ds";
import Package from "@/components/package";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import { useGetPreviewUpgradeDowngradeSubscription } from "@/features/manage-account-modal/hooks/base/use-get-preview-updown-subscription";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import {
  formatIsoToShortMonthDate,
  formatUnixDate,
} from "@/utils/commons/date-time";

import { ModalHeader } from "../../modal-header";
import type {
  TAlertWarningInfoProps,
  TAmountChangeInfoProps,
  TPreviewChangeStepProps,
} from "./types";
import {
  calculateAlertWarningInfo,
  calculateAmountChangeInfo,
  formatCurrency,
  getLocalizedProductTitle,
  getSavingText,
} from "./utils";

type TTranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>
) => string;

function AmountChangeInfo(props: TAmountChangeInfoProps & { t: TTranslateFn }) {
  const {
    proratedCreditAmount,
    proratedCreditCurrency,
    oldPlanDurationUnit,
    newPlanPrice,
    newPlanCurrency,
    newPlanDurationUnit,
    amountDueToday,
    amountDueTodayCurrency,
    nextBillingCycleDate,
    nextBillingAmount,
    nextBillingCurrency,
    t,
  } = props;

  const proratedCreditFormatted = formatCurrency(
    Math.abs(proratedCreditAmount),
    proratedCreditCurrency
  );
  const newPlanPriceFormatted = formatCurrency(newPlanPrice, newPlanCurrency);
  const amountDueTodayFormatted = formatCurrency(
    amountDueToday,
    amountDueTodayCurrency
  );
  const nextBillingAmountFormatted = formatCurrency(
    nextBillingAmount,
    nextBillingCurrency
  );
  const nextBillingDateFormatted =
    formatIsoToShortMonthDate(nextBillingCycleDate);

  const isUpgradedPlan = proratedCreditAmount > 0;

  return (
    <div className="rounded-v1-medium bg-v1-surface-glass-dark-whisper p-v1-structural-content-relaxed flex w-full flex-col">
      <div
        className={cn(
          "inline-grid self-stretch",
          "grid-cols-[fit-content(100%)_minmax(0,1fr)]",
          "gap-x-v1-structural-content-normal gap-y-v1-structural-content-normal",
          "items-center",
          "typo-v1-title-sm md:typo-v1-title-md-normal text-v1-text-hierarchy-tertiary",
          isUpgradedPlan
            ? "[grid-template-rows:repeat(2,fit-content(100%))]"
            : "[grid-template-rows:repeat(1,fit-content(100%))]"
        )}
      >
        {isUpgradedPlan && (
          <>
            <span>
              {t("previewChange.proratedCreditLabel", {
                planDuration: oldPlanDurationUnit,
              })}
            </span>
            <span className="justify-self-end">
              - {proratedCreditFormatted}
            </span>
          </>
        )}
        <span>
          {t("previewChange.newPlanLabel", {
            planDuration: newPlanDurationUnit,
          })}
        </span>
        <span className="justify-self-end">{newPlanPriceFormatted}</span>
      </div>
      <Separator.Root
        orientation="horizontal"
        className="my-v1-structural-component-medium bg-v1-border-status-divider-high h-px w-full"
      />
      <div
        className={cn(
          "inline-grid self-stretch",
          "grid-cols-[fit-content(100%)_minmax(0,1fr)]",
          "[grid-template-rows:repeat(2,fit-content(100%))]",
          "gap-x-v1-structural-content-normal gap-y-v1-structural-content-normal",
          "items-center",
          "text-v1-text-hierarchy-tertiary",
          "typo-v1-title-sm md:typo-v1-title-md-normal"
        )}
      >
        <span className="text-v1-text-hierarchy-primary">
          {t("previewChange.amountDueTodayLabel")}
        </span>
        <span className="typo-v1-heading-h4 text-v1-text-hierarchy-primary justify-self-end">
          {amountDueTodayFormatted}
        </span>
        <span>
          {t("previewChange.nextBillingCycleLabel", {
            date: nextBillingDateFormatted,
          })}
        </span>
        <span className="justify-self-end">{nextBillingAmountFormatted}</span>
      </div>
    </div>
  );
}

function AlertWarningInfo(props: TAlertWarningInfoProps & { t: TTranslateFn }) {
  const {
    newPlanDurationUnit,
    additionalChargeAmount,
    additionalChargeCurrency,
    chargeDate,
    newPlanPrice,
    t,
  } = props;

  const additionalChargeFormatted = formatCurrency(
    additionalChargeAmount,
    additionalChargeCurrency
  );
  const chargeDateFormatted = formatIsoToShortMonthDate(chargeDate);

  const isUpgradedPlan = additionalChargeAmount > 0;

  const newPlanPriceFormatted = formatCurrency(
    newPlanPrice,
    additionalChargeCurrency
  );

  const subContent = () => {
    if (isUpgradedPlan) {
      return (
        <>
          {t("previewChange.additionalChargeNowDescription", {
            amount: additionalChargeFormatted,
            date: chargeDateFormatted,
          })}
        </>
      );
    }
    return (
      <>
        {t("previewChange.chargeNextCycleDescription", {
          amount: newPlanPriceFormatted,
          date: chargeDateFormatted,
        })}
      </>
    );
  };

  return (
    <div className="gap-v1-structural-content-tight rounded-v1-medium bg-v1-feedback-warning-background p-v1-structural-content-relaxed text-v1-feedback-warning-text flex h-full items-start">
      <SvgIcon name="info" size={24} className="shrink-0" />
      <div className="px-v1-structural-content-tight gap-v1-optical-normal md:gap-v1-structural-content-tight flex flex-col">
        <p className="typo-v1-title-md-normal md:typo-v1-heading-h5">
          {t("previewChange.switchingPlanDescription", {
            planDuration: newPlanDurationUnit,
          })}
        </p>
        <p className="typo-v1-support-secondary-normal md:typo-v1-body-secondary">
          {subContent()}
        </p>
      </div>
    </div>
  );
}

export default function PreviewChangeStep(props: TPreviewChangeStepProps) {
  const {
    selectedProduct,
    activeProductId,
    paymentSubscriptionId,
    onCancel,
    onConfirm,
    onBack,
    amountChangeInfo: overrideAmountChangeInfo,
    alertWarningInfo: overrideAlertWarningInfo,
  } = props;

  const t = useTranslations("myPlan");

  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");

  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const newPricing = apiVersion === SUBSCRIPTION_API_VERSION.V2;

  const { data: previewData } = useGetPreviewUpgradeDowngradeSubscription(
    {
      productId: selectedProduct.id,
      quantity: 1,
      subscriptionId: paymentSubscriptionId,
    },
    false
  );

  const products = useGlobalState((state) => state.products);
  const activeProduct = useMemo(
    () => products.find((p) => p.id === activeProductId),
    [products, activeProductId]
  );

  // Compute localized titles once — reused for both the Package.Item label and
  // the uppercased duration strings injected into translation strings.
  const localizedNewPlanTitle = getLocalizedProductTitle(
    selectedProduct,
    commonT
  );
  const localizedNewPlanDuration = localizedNewPlanTitle.toUpperCase();
  // Old plan duration: from the currently active plan, falls back to the new plan.
  const localizedOldPlanDuration = activeProduct
    ? getLocalizedProductTitle(activeProduct, commonT).toUpperCase()
    : localizedNewPlanDuration;

  const amountChangeInfo = useMemo(
    () =>
      calculateAmountChangeInfo(previewData, selectedProduct, {
        newPlanDurationUnit: localizedNewPlanDuration,
        oldPlanDurationUnit: localizedOldPlanDuration,
        ...overrideAmountChangeInfo,
      }),
    [
      previewData,
      selectedProduct,
      localizedNewPlanDuration,
      localizedOldPlanDuration,
      overrideAmountChangeInfo,
    ]
  );

  const alertWarningInfo = useMemo(
    () =>
      calculateAlertWarningInfo(
        previewData,
        selectedProduct,
        amountChangeInfo.amountDueToday,
        {
          newPlanDurationUnit: localizedNewPlanDuration,
          ...overrideAlertWarningInfo,
        }
      ),
    [
      previewData,
      selectedProduct,
      amountChangeInfo.amountDueToday,
      localizedNewPlanDuration,
      overrideAlertWarningInfo,
    ]
  );

  const activationDateLabel = useMemo(() => {
    if (!previewData) {
      return "";
    }

    const isUpgrade = amountChangeInfo.amountDueToday > 0;

    if (isUpgrade) {
      const startAt = previewData.transaction?.startAt;
      const formattedStartDate = startAt ? formatUnixDate(startAt) : "";
      return formattedStartDate
        ? formatIsoToShortMonthDate(formattedStartDate)
        : "";
    }

    const formattedNextBilledDate = formatUnixDate(previewData.nextBilledAt);
    return formattedNextBilledDate
      ? formatIsoToShortMonthDate(formattedNextBilledDate)
      : "";
  }, [previewData, amountChangeInfo.amountDueToday]);

  return (
    <div className="max-h-[calc(100vh-100px)] overflow-y-auto md:min-h-[618px] md:w-[520px]">
      <ModalHeader
        title={t("actions.updatePlan")}
        onClose={onCancel}
        className="pe-0"
      />
      <div className="px-v1-structural-section-compact md:pb-v1-structural-content-relaxed pb-0">
        <div className="gap-v1-structural-component-medium md:gap-v1-structural-section-standard flex flex-col">
          <Package.Group value={selectedProduct.id} aria-label="Selected plan">
            <Package.Item
              value={selectedProduct.id}
              label={localizedNewPlanTitle}
              savingText={getSavingText(
                selectedProduct,
                newPricing,
                dsT("badge.saveText")
              )}
              isShowIndicator={false}
              currentPrice={selectedProduct.sellingPrice}
              weeklyPrice={selectedProduct.pricePerWeek}
              weeklyPriceLabel={commonT("perDuration", {
                duration: commonT("duration.week"),
              })}
            />
          </Package.Group>
          <AmountChangeInfo {...amountChangeInfo} t={t} />
          <AlertWarningInfo {...alertWarningInfo} t={t} />
        </div>
      </div>
      <div className="mt-v1-structural-content-relaxed md:mt-v1-structural-component-medium gap-v1-structural-content-normal px-v1-structural-component-medium py-v1-structural-content-relaxed flex flex-col-reverse justify-end md:flex-row">
        <Button
          variant="outline"
          size="l"
          onClick={onBack}
          className="text-v1-action-text-secondary"
        >
          {t("actions.back")}
        </Button>
        <Button
          variant="gold"
          size="l"
          onClick={() =>
            onConfirm?.(
              activationDateLabel,
              amountChangeInfo.amountDueToday > 0
            )
          }
        >
          {t("actions.confirm")}
        </Button>
      </div>
    </div>
  );
}
