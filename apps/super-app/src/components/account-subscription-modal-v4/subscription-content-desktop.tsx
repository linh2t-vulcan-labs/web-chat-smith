import React from "react";

import { BuildOnCard } from "./build-on-card";
import { GetFullAccessCard } from "./get-full-access-card";
import { PaddleCheckoutContainer } from "./paddle-checkout-container";
import type { TGetFullAccessCardProps } from "./types";

const SubscriptionContentDesktop: React.FC<TGetFullAccessCardProps> = ({
  products,
  onClickSubmitSubscription,
}) => (
  <div className="gap-medium-1.5 flex max-w-[1172px] flex-col items-start justify-center lg:min-w-[1172px] lg:flex-row lg:items-stretch">
    <div className="flex w-full flex-1">
      <BuildOnCard />
    </div>
    <div className="border-v1-surface-input-material rounded-default relative flex min-h-[600px] w-full flex-1 border dark:border-transparent">
      <GetFullAccessCard
        products={products}
        onClickSubmitSubscription={onClickSubmitSubscription}
      />
      <PaddleCheckoutContainer />
    </div>
  </div>
);

export default SubscriptionContentDesktop;
