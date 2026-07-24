import React from "react";

import { useIsPaymentFlowV2 } from "@/hooks/remote-config/use-payment-flow-v2";

import { MobileV2Checkout } from "./mobile-v2-checkout";
import { OriginalMasterMobileCheckout } from "./original-master-mobile-checkout";
import type { TGetFullAccessCardProps } from "./types";

/**
 * Mobile subscription content — thin switch between V1 and V2 payment flows.
 *
 * - Flag OFF → the original `master` mobile checkout (Continue → V1 order-service). No express.
 * - Flag ON  → V2 checkout (express on iOS+Apple Pay, otherwise standard inline card).
 *
 * The V1/V2 hooks live inside their respective child components so the early branch here does not
 * violate the rules of hooks.
 */
const SubscriptionContentMobile: React.FC<TGetFullAccessCardProps> = (
  props
) => {
  const isV2Flag = useIsPaymentFlowV2();

  if (!isV2Flag) {
    return <OriginalMasterMobileCheckout {...props} />;
  }

  return <MobileV2Checkout {...props} />;
};

export default SubscriptionContentMobile;
