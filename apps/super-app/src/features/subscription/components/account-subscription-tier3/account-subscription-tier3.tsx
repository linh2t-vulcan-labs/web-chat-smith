import dynamic from "next/dynamic";
import React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useGlobalState } from "@/store/global/hooks";

import type { TAccountSubscriptionTierProps } from "../../types/common";

const SubscriptionContentDesktopTier3 = dynamic(
  () => import("./subscription-content-desktop-tier-3")
);
const SubscriptionContentMobileTier3 = dynamic(
  () => import("./subscription-content-mobile-tier-3")
);

const AccountSubscriptionTier3: React.FC<TAccountSubscriptionTierProps> = (
  props
) => {
  const {
    products,
    activeProduct,
    useTrial,
    onProductSelected,
    onClickSubmitSubscription,
  } = props;
  const isDesktop = useMediaQuery("lg");
  const selectedProductForCheckout = useGlobalState(
    (state) => state.selectedProductForCheckout
  );
  const resolvedActiveProduct = activeProduct ?? selectedProductForCheckout;

  return isDesktop ? (
    <SubscriptionContentDesktopTier3
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      useTrial={useTrial}
    />
  ) : (
    <SubscriptionContentMobileTier3
      products={products}
      activeProduct={resolvedActiveProduct}
      onClickSubmitSubscription={onClickSubmitSubscription}
      onProductSelected={onProductSelected}
      useTrial={useTrial}
    />
  );
};

export default AccountSubscriptionTier3;
