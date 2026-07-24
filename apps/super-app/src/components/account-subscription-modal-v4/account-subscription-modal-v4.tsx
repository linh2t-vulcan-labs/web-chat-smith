"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { ModalV2 } from "@/components/modal";
import { SVGIcon } from "@/components/svg-icon";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { productUseCases } from "@/core/usecases/product";
import { useBlockingOverlayRegistration } from "@/hooks/ui/use-blocking-overlay-registration";
import { useMediaQuery } from "@/hooks/use-media-query";
import { GTM_EVENT_ID } from "@/libs/gtm/events";
import { useAuthState } from "@/store/auth";
import { useGlobalState } from "@/store/global/hooks";

import type { TAccountSubscriptionModalV4Props } from "./types";

const SubscriptionContentDesktop = dynamic(
  () => import("./subscription-content-desktop")
);
const SubscriptionContentMobile = dynamic(
  () => import("./subscription-content-mobile")
);

export default function AccountSubscriptionModalV4(
  props: TAccountSubscriptionModalV4Props
) {
  const { open, useTrial, onClose, onClickSubmitSubscription } = props;
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);

  const existTrialUsage = useGlobalState((state) => state.existTrialUsage);

  const showTrialSubscription = isAuthenticated
    ? useTrial && !existTrialUsage
    : useTrial;

  const products = useGlobalState((state) => state.products);

  const isDesktop = useMediaQuery("md");

  const sortedProducts = useMemo(
    () =>
      productUseCases().sortedProductAfterMappingSubscription(
        userSubscriptionInfo,
        products,
        showTrialSubscription
      ),
    [userSubscriptionInfo, products, showTrialSubscription]
  );

  useBlockingOverlayRegistration(open);

  return (
    <ModalV2
      open={open}
      onClose={onClose}
      // Subscription flow must stay above account/settings dialogs.
      zIndex={MODAL_Z_INDEX.SUBSCRIPTION}
      overlayClassName="bg-surface-general-primary!"
      containerClassName="size-full max-h-full max-w-full overflow-y-scroll rounded-none bg-surface-general-primary! md:bg-transparent! xl:overflow-y-hidden"
      className="size-full p-0! xl:overflow-y-hidden"
      isPreventClickOutside
      dialogContentProps={{
        style: {
          pointerEvents: "auto",
        },
      }}
    >
      <SVGIcon
        src="/icons/outlined/closed.svg"
        width={24}
        height={24}
        className="end-medium-3 top-medium-3 text-text-general-tertiary hover:text-text-general-secondary rtl:left-medium-3 absolute z-10 hidden cursor-pointer md:block rtl:right-auto"
        onClick={onClose}
      />
      <div
        id={GTM_EVENT_ID.View_Subscriptions}
        className="flex h-full flex-col lg:min-h-screen lg:items-center lg:justify-center lg:overflow-hidden"
      >
        {isDesktop ? (
          <SubscriptionContentDesktop
            products={sortedProducts}
            onClickSubmitSubscription={onClickSubmitSubscription}
          />
        ) : (
          <SubscriptionContentMobile
            products={sortedProducts}
            onClickSubmitSubscription={onClickSubmitSubscription}
            onClose={onClose}
          />
        )}
      </div>
    </ModalV2>
  );
}
