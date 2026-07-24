import React from "react";

import type { TSubscriptionDetailMobileProps } from "../../types/common";
import { PaymentDisclaimer } from "../payment-disclaimer";
import { SubscriptionCardInfo } from "../subscription-card-info";

const SubscriptionDetailMobile: React.FC<TSubscriptionDetailMobileProps> = ({
  productInfo,
  userSubscriptionInfo,
  userInfo,
}) => (
  <div className="gap-large-4 flex w-full flex-col">
    <div className="rounded-rounded border-border-general-primary bg-surface-general-glass p-medium-2 border">
      <SubscriptionCardInfo
        productInfo={productInfo}
        subscriptionInfo={userSubscriptionInfo}
        user={userInfo}
        spacing="large"
        showPlan
        theme="dark"
      />
    </div>
    <PaymentDisclaimer />
  </div>
);

export default SubscriptionDetailMobile;
