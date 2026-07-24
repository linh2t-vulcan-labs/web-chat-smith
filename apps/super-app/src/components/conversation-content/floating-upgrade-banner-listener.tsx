"use client";

import React from "react";

import { FloatingUpgradeBanner } from "@/components/floating-upgrade";
import { EConversationMode } from "@/core/models/conversation";
import { useTriggerFloatingUpgrade } from "@/hooks/usage/use-trigger-floating-upgrade";
import { useMatchRoute } from "@/hooks/use-match-route";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

interface FloatingUpgradeBannerListenerProps {
  containerClassname?: string;
  floatingClassname?: string;
  fixedTop?: boolean;
}
const FloatingUpgradeBannerListener: React.FC<
  FloatingUpgradeBannerListenerProps
> = ({ containerClassname, floatingClassname, fixedTop }) => {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const conversationMode = useConversationState((state) => state.mode);
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setDismissedFloatingBanner = useGlobalState(
    (state) => state.setDismissedFloatingBanner
  );
  const userInfo = useGlobalState((state) => state.user);
  const isDesktop = useMediaQuery("md", { defaultValue: true });

  const hasSubscription = userSubscriptionInfo.isValidPremiumUser;
  const matchConversationWildcard = useMatchRoute("/conversation/*");
  const matchConversationExact = useMatchRoute("/conversation");
  const handleCloseFloatingBanner = () => {
    setDismissedFloatingBanner();
  };
  const handleUpgradeFloatingBanner = () => {
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: {
        trigger: "home_page",
        ...(userInfo.id ? { vulcan_user_id: userInfo.id } : {}),
      },
    });
    setIsOpenSubscriptionModal(true, "top_block");
  };
  const { floatingBannerVisible, isInitializing } = useTriggerFloatingUpgrade(
    conversationMode,
    conversationMode === EConversationMode.CHAT
  );

  if (hasSubscription || !matchConversationWildcard || isInitializing) {
    return null;
  }
  if (
    Boolean(fixedTop) &&
    !isDesktop &&
    matchConversationWildcard &&
    !matchConversationExact
  ) {
    return null;
  }
  if (!floatingBannerVisible) {
    return null;
  }

  return (
    <div className={containerClassname}>
      <FloatingUpgradeBanner
        onUpgrade={handleUpgradeFloatingBanner}
        onClose={handleCloseFloatingBanner}
        containerClassname={floatingClassname}
        fixedTop={fixedTop}
      />
    </div>
  );
};

export default FloatingUpgradeBannerListener;
