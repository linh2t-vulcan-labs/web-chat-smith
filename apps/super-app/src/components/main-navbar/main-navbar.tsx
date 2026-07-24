"use client";

import React from "react";

import { Button } from "@/components/button-ds";
import { NavUpgradeButton } from "@/components/nav-upgrade-button/nav-upgrade-button";
import { SvgIcon } from "@/components/svg-icon-ds";
import { ThemeToggle } from "@/components/theme-toggle";
import { useNotification } from "@/features/notification/provider/notification-provider";
import { useUpgradeSubscription } from "@/hooks/subscriptions";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

const NavbarMobile = () => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const { unReadCount } = useNotification();
  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <Button
      className="relative flex md:hidden"
      variant="ghost"
      iconOnly
      suffixIcon={<SvgIcon name="menu" size={24} />}
      onClick={handleToggleSidebar}
    >
      {unReadCount > 0 && (
        <span className="badge size-v1-2 min-w-size-v1-2 bg-v1-badge-new-background absolute top-2.5 end-2.5 inline-flex items-center justify-center rounded-full" />
      )}
    </Button>
  );
};

const MainNavbar = () => {
  const { isShowUpgrade } = useUpgradeSubscription();
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const userId = useGlobalState((state) => state.user.id);
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const isEnabledThemeToggle = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE
  );
  const { sendTrackingEvent } = useSendTrackingEvent();

  const handleUpgradeClick = () => {
    setIsOpenSubscriptionModal(true, "banner");
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewUpgradeClick,
        payload: { trigger: "nav_bar", vulcan_user_id: userId },
      });
    }
  };

  const handleThemeChange = (theme: string) => {
    sendTrackingEvent({
      name: EventKeys.ChangeTheme,
      payload: {
        value: theme as "dark" | "light" | "system",
        vulcan_user_id: userId,
      },
    });
  };

  return (
    <nav className="px-v1-structural-component-medium py-v1-structural-content-normal gap-v1-structural-component-medium md:py-v1-1 flex h-15 items-center justify-start">
      <NavbarMobile />

      <div className="gap-v1-2 ms-auto flex">
        {isShowUpgrade && <NavUpgradeButton onClick={handleUpgradeClick} />}
        {isEnabledThemeToggle && (
          <ThemeToggle onThemeChange={handleThemeChange} />
        )}
      </div>
    </nav>
  );
};

export default MainNavbar;
