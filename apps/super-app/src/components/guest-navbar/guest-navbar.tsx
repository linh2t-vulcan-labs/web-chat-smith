"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/button-ds";
import { NavUpgradeButton } from "@/components/nav-upgrade-button/nav-upgrade-button";
import { PromoteSignin } from "@/components/promote-signin";
import { SvgIcon } from "@/components/svg-icon-ds";
import { ThemeToggle } from "@/components/theme-toggle";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useMatchRoute } from "@/hooks/use-match-route";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

const GuestNavbarMobile = () => {
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  return (
    <Button
      className="flex md:hidden"
      variant="ghost"
      iconOnly
      suffixIcon={<SvgIcon name="menu" size={24} />}
      onClick={handleToggleSidebar}
    />
  );
};

const GuestNavbar = () => {
  const tLogin = useTranslations("loginPage.loginForm");
  const tCommon = useTranslations("common");
  const { showLoginModal, openSubscriptionModal } = useFeatureGating();
  const guestId = useGuestState((state) => state.anonId);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const isEnabledThemeToggle = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE
  );
  const isOpenPromoteSignIn = useGuestState(
    (state) => state.isOpenPromoteSignIn
  );
  const setIsOpenPromoteSignIn = useGuestState(
    (state) => state.setIsOpenPromoteSignIn
  );
  const matchGuestAssistantWildcard = useMatchRoute("/guest/assistant/*");

  const onClosePromoteSignIn = () => {
    setIsOpenPromoteSignIn(false);
  };

  const handleGetProClick = () => {
    openSubscriptionModal();
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: { guest_id: guestId || "", trigger: "nav_bar" },
    });
  };

  const handlePromoteSignIn = () => {
    showLoginModal("header");
  };

  const handleThemeChange = (theme: string) => {
    sendTrackingEvent({
      name: EventKeys.ChangeTheme,
      payload: {
        guest_id: guestId || "",
        value: theme as "dark" | "light" | "system",
      },
    });
  };

  return (
    <>
      <nav className="px-medium-2 py-medium-1.5 md:gap-medium-2 md:py-small-1 gap-v1-structural-component-medium flex h-15 items-center">
        <GuestNavbarMobile />
        <div className="gap-v1-2 ms-auto flex">
          <NavUpgradeButton onClick={handleGetProClick} />
          {isEnabledThemeToggle && (
            <ThemeToggle onThemeChange={handleThemeChange} />
          )}
        </div>
      </nav>
      {isOpenPromoteSignIn && !matchGuestAssistantWildcard && (
        <PromoteSignin
          title={tLogin("guestBanner.title")}
          subTitle={tLogin("guestBanner.description")}
          signInText={tCommon("signIn")}
          className="md:top-v1-structural-content-normal top-v1-structural-section-large fixed start-1/2 w-full max-w-[92%] -translate-x-1/2 md:left-[calc(50%+74px)] md:max-w-120 md:-translate-x-[calc(50%+37px)] rtl:left-[calc(50%-74px)]"
          onSignIn={handlePromoteSignIn}
          onClose={onClosePromoteSignIn}
        />
      )}
    </>
  );
};

export default GuestNavbar;
