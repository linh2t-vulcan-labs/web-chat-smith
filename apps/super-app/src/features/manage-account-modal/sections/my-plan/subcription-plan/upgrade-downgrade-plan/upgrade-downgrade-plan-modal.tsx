"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useState } from "react";

import { Modal } from "@/components/modal";
import { cn } from "@/components/utils/cn";
import { MODAL_Z_INDEX } from "@/config/z-index";
import type { ProductModel } from "@/core/models/product";
import { useHandleFlowUpdownSubscription } from "@/features/manage-account-modal/hooks";
import { isTrialDSVersion } from "@/features/subscription/utils/helpers";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl } from "@/utils/commons/helpers";
import {
  ENABLE_PREMIUM_ONBOARDING_MODAL_KEY,
  HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
} from "@/utils/commons/keys";

import { getLocalizedProductTitle } from "./steps/utils";
import type { TUpgradeDowngradePlanModalProps } from "./types";

const PreviewChangeStep = dynamic(() => import("./steps/preview-change-step"));
const SelectedPlanStep = dynamic(() => import("./steps/selected-plan-step"));
const SuccessStep = dynamic(() => import("./steps/success-step"));
const LoadingProcessing = dynamic(
  () => import("@/components/loading-icon/loading-processing")
);

export default function UpgradeDowngradePlanModal(
  props: TUpgradeDowngradePlanModalProps
) {
  const { open, onClose, item, step, onChangeStep } = props;

  const commonT = useTranslations("common");

  const [selectedProduct, setSelectedProduct] = useState<ProductModel | null>(
    null
  );
  const [isProcessingAfterUpgrade, setIsProcessingAfterUpgrade] =
    useState(false);
  const [activationDateLabel, setActivationDateLabel] = useState<string>("");
  const [successIsUpgrade, setSuccessIsUpgrade] = useState(true);
  const dsVersion = useGlobalState((state) => state.dsVersion);

  const {
    previewSelectedPlan,
    upgradeDowngradeSelectedPlan,
    previewState,
    upgradeState,
  } = useHandleFlowUpdownSubscription({
    quantity: 1,
    subscriptionId: item?.id,
  });
  const { isPreviewing } = previewState;
  const { isUpgrading } = upgradeState;

  const isSpinning = isPreviewing || isUpgrading || isProcessingAfterUpgrade;

  const handleBackToSelectedPlan = () => {
    onChangeStep("selected-plan");
  };

  const handleConfirmSelectedPlan = async (product: ProductModel) => {
    const result = await previewSelectedPlan(product);

    if (!result.success) {
      return;
    }

    setSelectedProduct(product);
    onChangeStep("preview-change");
  };

  const handleConfirmPreviewChange = (
    activationDate: string,
    isUpgrade: boolean
  ) => {
    if (selectedProduct) {
      setSuccessIsUpgrade(isUpgrade);
      setIsProcessingAfterUpgrade(true);
      upgradeDowngradeSelectedPlan(selectedProduct, {
        onError: () => {
          onClose();
          setIsProcessingAfterUpgrade(false);
        },
        onSuccess: () => {
          setActivationDateLabel(activationDate);
          onChangeStep("success");
          setIsProcessingAfterUpgrade(false);
        },
      });
    }
  };

  const handleCloseSuccessModal = () => {
    localStorageImpl.save(ENABLE_PREMIUM_ONBOARDING_MODAL_KEY, true);
    onClose();
    localStorageImpl.remove(HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY);
  };

  const renderContent = () => {
    switch (step) {
      case "selected-plan": {
        return (
          <SelectedPlanStep
            onCancel={onClose}
            onConfirm={handleConfirmSelectedPlan}
            activeProductId={item.sourceProductId}
            useTrial={isTrialDSVersion(dsVersion)}
          />
        );
      }
      case "preview-change": {
        return (
          <PreviewChangeStep
            paymentSubscriptionId={item.id}
            selectedProduct={selectedProduct as ProductModel}
            activeProductId={item.sourceProductId}
            onConfirm={handleConfirmPreviewChange}
            onBack={handleBackToSelectedPlan}
            onCancel={onClose}
          />
        );
      }
      case "success": {
        return (
          <SuccessStep
            onCancel={handleCloseSuccessModal}
            planDurationLabel={
              selectedProduct
                ? getLocalizedProductTitle(selectedProduct, commonT)
                : undefined
            }
            activationDateLabel={activationDateLabel}
            isUpgrade={successIsUpgrade}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
      isPreventClickOutside
      containerClassName={cn(
        "rounded-v1-xl thickness-v1-subtle border-v1-border-structural-default bg-v1-surface-hierarchy-raised w-full md:max-w-full md:w-fit"
      )}
      className={cn("flex flex-col p-0!")}
    >
      {isSpinning && <LoadingProcessing isSpinning />}
      {renderContent()}
    </Modal>
  );
}
