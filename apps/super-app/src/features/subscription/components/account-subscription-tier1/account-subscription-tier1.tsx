import dynamic from "next/dynamic";
import React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useGlobalState } from "@/store/global/hooks";

import type { TAccountSubscriptionTierProps } from "../../types/common";

const SubscriptionContentDesktopTier1 = dynamic(
  () => import("./subscription-content-desktop-tier-1")
);
const SubscriptionContentMobileTier1 = dynamic(
  () => import("./subscription-content-mobile-tier-1")
);

const AccountSubscriptionTier1: React.FC<TAccountSubscriptionTierProps> = (
  props
) => {
  const {
    products,
    activeProduct,
    useTrial,
    onProductSelected,
    onClickSubmitSubscription,
  } = props;
  const isDesktop = useMediaQuery("xl");
  const selectedProductForCheckout = useGlobalState(
    (state) => state.selectedProductForCheckout
  );
  const resolvedActiveProduct = activeProduct ?? selectedProductForCheckout;

  return isDesktop ? (
    <SubscriptionContentDesktopTier1
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      useTrial={useTrial}
    />
  ) : (
    <SubscriptionContentMobileTier1
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      onProductSelected={onProductSelected}
      useTrial={useTrial}
    />
  );
};

export default AccountSubscriptionTier1;
