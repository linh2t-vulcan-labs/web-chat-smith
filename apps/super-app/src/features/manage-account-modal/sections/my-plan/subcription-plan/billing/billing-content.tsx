"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useMemo } from "react";

import { Button } from "@/components/button-ds";
import { LoadingProcessing } from "@/components/loading-icon";
import type { TPaymentSubscriptionStatus } from "@/core/models/payment";
import { EPaymentSubscriptionStatus } from "@/core/models/payment";
import { useHandleUpdatePaymentMethod } from "@/features/manage-account-modal/hooks/use-handle-update-payment-method";
import { useGetPaymentMethod } from "@/hooks/payments/use-get-payment-method";
import {
  resolveCardTypeForPaymentMethod,
  resolvePaymentMethodType,
} from "@/utils/mappers/payment";

import { PaymentCardInfo } from "../../payment/payment-card-info";
import { PaymentCardInfoSkeleton } from "../../payment/payment-card-info-skeleton";
import type { TPaymentCardInfoProps } from "../../payment/types";
import type { TBillingContentProps } from "../types";
import { BillingHistory } from "./billing-history";

const UpdatePaymentMethodModal = dynamic(
  () => import("../update-payment-method/update-payment-method-modal"),
  {
    loading: () => <LoadingProcessing isSpinning />,
  }
);

export function BillingContent(props: TBillingContentProps) {
  const { subscriptionId, subscriptionPlanInfo } = props;
  const t = useTranslations("myPlan");

  const {
    modalState: updatePaymentMethodModalConfig,
    handleUpdatePaymentMethod,
    handleCloseModal: handleCloseUpdatePaymentMethodModal,
    isLoading: isLoadingUpdatePaymentMethod,
  } = useHandleUpdatePaymentMethod();

  const handleUpdatePaymentMethodClick = () => {
    handleUpdatePaymentMethod(subscriptionId);
  };

  const {
    data: paymentMethodInfo,
    dataUpdatedAt,
    isLoading: isLoadingPaymentMethodInfo,
    isFetching: isFetchingPaymentMethodInfo,
  } = useGetPaymentMethod();

  const memoizedPaymentCardInfo: TPaymentCardInfoProps | null = useMemo(() => {
    if (!paymentMethodInfo) {
      return null;
    }

    const pmType = resolvePaymentMethodType(paymentMethodInfo.type);

    const expiredAt =
      paymentMethodInfo?.cardExpiryMonth !== null &&
      paymentMethodInfo?.cardExpiryMonth !== undefined &&
      paymentMethodInfo?.cardExpiryYear !== null &&
      paymentMethodInfo?.cardExpiryYear !== undefined
        ? `${paymentMethodInfo.cardExpiryMonth}/${paymentMethodInfo.cardExpiryYear}`
        : undefined;

    return {
      cardNumber: paymentMethodInfo?.cardLast4 || undefined,
      cardType: resolveCardTypeForPaymentMethod(
        pmType,
        paymentMethodInfo?.cardType
      ),
      cardholderName: paymentMethodInfo?.cardholderName?.trim() || undefined,
      expiredAt,
      paymentMethodType: pmType,
    };
  }, [paymentMethodInfo]);

  const shouldShowPaymentSection =
    isLoadingPaymentMethodInfo || !!memoizedPaymentCardInfo;

  const isShowUpdatePaymentMethod =
    (
      [
        EPaymentSubscriptionStatus.ACTIVE,
        EPaymentSubscriptionStatus.TRIAL,
      ] as TPaymentSubscriptionStatus[]
    ).includes(subscriptionPlanInfo.status) && !!memoizedPaymentCardInfo;

  const isSpinning =
    isLoadingUpdatePaymentMethod &&
    isFetchingPaymentMethodInfo &&
    !isLoadingPaymentMethodInfo;

  return (
    <>
      {isSpinning && <LoadingProcessing isSpinning />}
      <div className="gap-v1-structural-content-relaxed rounded-v1-medium bg-v1-surface-glass-dark-whisper py-v1-structural-content-relaxed px-v1-structural-component-medium flex flex-col">
        {shouldShowPaymentSection && (
          <div className="gap-v1-structural-component-large flex w-full flex-col">
            <h3 className="typo-v1-title-md-normal text-v1-text-hierarchy-primary">
              {t("billing.paymentMethodTitle")}
            </h3>
            <div className="flex w-full justify-between">
              {isLoadingPaymentMethodInfo ? (
                <PaymentCardInfoSkeleton />
              ) : (
                memoizedPaymentCardInfo && (
                  <PaymentCardInfo
                    {...memoizedPaymentCardInfo}
                    triggerNode={
                      isShowUpdatePaymentMethod && (
                        <Button
                          variant="outline"
                          size="xxs"
                          className="w-auto min-w-[62px] whitespace-nowrap"
                          onClick={handleUpdatePaymentMethodClick}
                        >
                          {t("actions.update")}
                        </Button>
                      )
                    }
                  />
                )
              )}
            </div>
          </div>
        )}

        <BillingHistory
          subscriptionId={subscriptionId}
          isBillingTrial={
            subscriptionPlanInfo.status === EPaymentSubscriptionStatus.TRIAL
          }
          resetPaginationTrigger={dataUpdatedAt}
        />
      </div>
      {updatePaymentMethodModalConfig.open &&
        updatePaymentMethodModalConfig.transactionId && (
          <UpdatePaymentMethodModal
            open={updatePaymentMethodModalConfig.open}
            transactionId={updatePaymentMethodModalConfig.transactionId}
            subscriptionId={updatePaymentMethodModalConfig.subscriptionId}
            onClose={handleCloseUpdatePaymentMethodModal}
          />
        )}
    </>
  );
}
