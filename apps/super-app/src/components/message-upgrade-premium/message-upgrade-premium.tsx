"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Icon } from "@/components/icon";
import type { TMessageUpgradePremiumProps } from "@/components/message-upgrade-premium/types";
import { productUseCases } from "@/core/usecases/product";
import { useGlobalState } from "@/store/global/hooks";

export default function MessageUpgradePremium(
  props: TMessageUpgradePremiumProps
) {
  const { title, description, purchaseSource } = props;
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );

  const products = useGlobalState((state) => state.products);
  const bestSubscription = useMemo(
    () => productUseCases().getBestSubscriptionPackage(products),
    [products]
  );
  const conversationT = useTranslations("conversationPage");

  const handleClickUpgradeButton = () => {
    setIsOpenSubscriptionModal(true, purchaseSource);
  };
  return (
    <div className="gap-medium-2 rounded-default thickness-thin border-border-input-default bg-surface-general-primary p-medium-2 flex w-full md:max-w-[538px]">
      <div className="h-full">
        <div className="rounded-circle bg-gradient-yellow p-small-0.5 inline-flex items-center justify-center">
          <Icon
            name="lock"
            size={16}
            className="text-icon-general-primary dark:text-icon-general-inverse!"
          />
        </div>
      </div>
      <div className="gap-medium-1.5 flex w-full flex-col">
        <div className="space-y-small-0.5 flex w-full flex-col">
          <h1 className="text-bodyM-medium text-text-general-secondary">
            {title}
          </h1>
          <p className="text-footnoteM-neutral text-text-general-quaternary">
            {description}
          </p>
        </div>
        <div>
          {/* GU-1573 */}
          <button
            type="button"
            className="rounded-rounded px-medium-1.5 py-small-0.75 text-footnoteM-highlight text-text-general-primary dark:text-text-general-inverse bg-gradient-yellow-linear w-max"
            onClick={handleClickUpgradeButton}
          >
            {conversationT("actions.free", {
              price: bestSubscription?.pricePerWeek ?? "",
            })}
          </button>
        </div>
      </div>
    </div>
  );
}
