import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/button-ds";
import Package from "@/components/package";
import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import { productUC } from "@/core/usecases";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";

import { ModalHeader } from "../../modal-header";
import type { TSelectedPlanStepProps } from "./types";
import { getLocalizedProductTitle, getSavingText } from "./utils";

export default function SelectedPlanStep(props: TSelectedPlanStepProps) {
  const { activeProductId, onCancel, onConfirm, useTrial = false } = props;

  const t = useTranslations("myPlan");
  const commonT = useTranslations("common");
  const dsT = useTranslations("ds");
  const products = useGlobalState((state) => state.products);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const { existingTrialActive, trialExists } = userSubscriptionInfo;

  const showTrialSubscription =
    useTrial && (existingTrialActive || trialExists);

  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const apiVersion = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO
  );
  const newPricing = apiVersion === SUBSCRIPTION_API_VERSION.V2;

  const sortedProducts = useMemo(
    () =>
      productUC.sortedProductAfterMappingActiveSubscription(
        activeProductId ?? "",
        products,
        showTrialSubscription
      ),
    [activeProductId, products, showTrialSubscription]
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(
    () => sortedProducts.find((p) => p.id !== activeProductId)?.id ?? ""
  );

  const selectedProduct = sortedProducts.find(
    (p) => p.id === selectedProductId
  );
  const isDisabledUpdatePlan =
    !selectedProduct || activeProductId === selectedProductId;

  const saveLabel = dsT("badge.saveText");
  const perWeekLabel = commonT("perDuration", {
    duration: commonT("duration.week"),
  });

  const handleConfirm = () => {
    if (selectedProduct) {
      onConfirm?.(selectedProduct);
    }
  };

  return (
    <div className="w-full md:min-h-[436px] md:max-w-[528px] md:min-w-[528px]">
      <ModalHeader
        title={t("actions.updatePlan")}
        onClose={onCancel}
        className="pe-0"
      />
      <div className="px-v1-structural-section-compact md:pb-v1-structural-content-relaxed pb-0">
        <div className="gap-v1-structural-section-standard flex flex-col">
          <p className="typo-v1-body-default-normal text-v1-text-hierarchy-secondary">
            {t("previewChange.pickPlanDescription")}
          </p>
          <Package.Group
            value={selectedProductId}
            onValueChange={setSelectedProductId}
            aria-label="Subscription"
            className="max-h-[232px] overflow-y-auto"
          >
            {sortedProducts.map((product) => {
              const isCurrentPlan = product.id === activeProductId;
              return (
                <Package.Item
                  key={product.id}
                  value={product.id}
                  label={getLocalizedProductTitle(product, commonT)}
                  currentText={
                    isCurrentPlan ? commonT("currentPlan") : undefined
                  }
                  savingText={
                    isCurrentPlan
                      ? undefined
                      : getSavingText(product, newPricing, saveLabel)
                  }
                  originalPrice={product.originalPrice}
                  isShowIndicator={!isCurrentPlan}
                  currentPrice={product.sellingPrice}
                  weeklyPrice={product.pricePerWeek}
                  weeklyPriceLabel={perWeekLabel}
                  disabled={isCurrentPlan}
                  className="data-disabled:before:bg-v1-surface-overlay-interactive-pressed disabled:before:bg-v1-surface-overlay-interactive-pressed dark:data-disabled:before:bg-v1-surface-overlay-emphasis-muted dark:disabled:before:bg-v1-surface-overlay-emphasis-muted min-h-[108px]"
                />
              );
            })}
          </Package.Group>
        </div>
      </div>
      <div className="mt-v1-structural-component-medium gap-v1-structural-content-normal md:gap-v1-structural-content-micro px-v1-structural-component-medium py-v1-structural-content-relaxed flex flex-col-reverse justify-end md:flex-row">
        <Button
          variant="outline"
          size="l"
          onClick={onCancel}
          className="text-v1-action-text-secondary"
        >
          {t("actions.cancel")}
        </Button>
        <Button
          variant="gold"
          size="l"
          disabled={isDisabledUpdatePlan}
          onClick={handleConfirm}
        >
          {t("actions.continue")}
        </Button>
      </div>
    </div>
  );
}
