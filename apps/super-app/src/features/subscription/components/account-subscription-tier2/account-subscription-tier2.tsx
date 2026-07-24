import dynamic from "next/dynamic";
import React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useGlobalState } from "@/store/global/hooks";

import type { TAccountSubscriptionTierProps } from "../../types/common";

const SubscriptionContentDesktopTier2 = dynamic(
  () => import("./subscription-content-desktop-tier-2")
);
const SubscriptionContentMobileTier2 = dynamic(
  () => import("./subscription-content-mobile-tier-2")
);

const AccountSubscriptionTier2: React.FC<TAccountSubscriptionTierProps> = (
  props
) => {
  const {
    products,
    activeProduct,
    useTrial,
    onProductSelected,
    onClickSubmitSubscription,
  } = props;
  const isDesktop = useMediaQuery("md");
  const selectedProductForCheckout = useGlobalState(
    (state) => state.selectedProductForCheckout
  );
  const resolvedActiveProduct = activeProduct ?? selectedProductForCheckout;

  return isDesktop ? (
    <SubscriptionContentDesktopTier2
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      useTrial={useTrial}
    />
  ) : (
    <SubscriptionContentMobileTier2
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      onProductSelected={onProductSelected}
      useTrial={useTrial}
    />
  );
};

export default AccountSubscriptionTier2;
