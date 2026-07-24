import React, { useMemo, useState } from "react";

import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { SUBSCRIPTION_UI_VERSION } from "@/config/tracking-event";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { productUseCases } from "@/core/usecases/product";
import { GTM_EVENT_ID } from "@/libs/gtm/events";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { SUBSCRIPTION_TIER } from "../../constants/subscription";
import type { TAccountSubscriptionModalV5Props } from "../../types/common";
import { getDSTier, isTrialDSVersion } from "../../utils/helpers";
import { AccountSubscriptionTier1 } from "../account-subscription-tier1";
import { AccountSubscriptionTier2 } from "../account-subscription-tier2";
import { AccountSubscriptionTier3 } from "../account-subscription-tier3";
import { SubscriptionLayoutV5 } from "../subscription-layout-v5";

const AccountSubscriptionModalV5: React.FC<TAccountSubscriptionModalV5Props> = (
  props
) => {
  const { open, enableTrial, dsVersion, onClose, onClickSubmitSubscription } =
    props;
  const [isShowNavigate, setIsShowNavigate] = useState(true);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const existTrialUsage = useGlobalState((state) => state.existTrialUsage);
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);

  const showTrialSubscription = isAuthenticated
    ? enableTrial && !existTrialUsage
    : enableTrial;

  const products = useGlobalState((state) => state.products);

  const sortedProducts = useMemo(
    () =>
      productUseCases().sortedProductAfterMappingSubscription(
        userSubscriptionInfo,
        products,
        showTrialSubscription
      ),
    [userSubscriptionInfo, products, showTrialSubscription]
  );

  let AccountSubscriptionTierComponent = AccountSubscriptionTier1;
  if (getDSTier(dsVersion) === SUBSCRIPTION_TIER.TIER3) {
    AccountSubscriptionTierComponent = AccountSubscriptionTier3;
  } else if (getDSTier(dsVersion) === SUBSCRIPTION_TIER.TIER2) {
    AccountSubscriptionTierComponent = AccountSubscriptionTier2;
  }

  const modalWrapperClasses =
    dsVersion === SUBSCRIPTION_UI_VERSION.V_6 ||
    dsVersion === SUBSCRIPTION_UI_VERSION.V_7
      ? "dark:bg-[url('/icons/documents/home-screen.svg')] bg-cover"
      : "";

  return (
    <ModalV2
      open={open}
      onClose={onClose}
      zIndex={MODAL_Z_INDEX.SUBSCRIPTION}
      overlayClassName="bg-surface-general-primary!"
      containerClassName="rounded-none max-h-full max-w-full w-full bg-surface-general-primary! md:bg-transparent! overflow-y-scroll xl:overflow-y-hidden size-full"
      className={compositeStyles(
        "px-medium-2 size-full p-0! xl:overflow-y-hidden",
        modalWrapperClasses
      )}
      isPreventClickOutside
      dialogContentProps={{
        style: {
          pointerEvents: "auto",
        },
      }}
    >
      {isShowNavigate && (
        <SVGIcon
          src="/icons/outlined/closed.svg"
          width={22}
          height={22}
          className="end-medium-3 top-large-4 text-text-general-primary hover:text-text-general-secondary md:top-large-5 2xl:right-large-10 rtl:left-medium-3 absolute z-10 block cursor-pointer rtl:right-auto"
          onClick={onClose}
        />
      )}

      <div
        id={GTM_EVENT_ID.View_Subscriptions}
        className="flex min-h-screen flex-col"
      >
        <SubscriptionLayoutV5 showNavigate={isShowNavigate}>
          <AccountSubscriptionTierComponent
            products={sortedProducts}
            onClickSubmitSubscription={onClickSubmitSubscription}
            onProductSelected={(product) => {
              setIsShowNavigate(!product);
            }}
            useTrial={isTrialDSVersion(dsVersion)}
          />
        </SubscriptionLayoutV5>
      </div>
    </ModalV2>
  );
};

export default AccountSubscriptionModalV5;
