"use client";

import { useTranslations } from "next-intl";
import React, { useCallback } from "react";

import { Sidebar } from "@/components/sidebar";
import { SvgIcon } from "@/components/svg-icon-ds";
import type { TAssistantType } from "@/core/models/assistant";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { useActiveGuestSidebarMenuItem } from "@/hooks/ui/use-active-guest-sidebar-menu-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { SIDEBAR_ID, SIDEBAR_MENU_ID } from "@/utils/constants/common";
import { GUEST_DESIGN_STUDIO_URL, GUEST_URL } from "@/utils/constants/url";

import GuestSidebarContent from "./guest-sidebar-content";
import GuestSidebarContentMobile from "./guest-sidebar-content-mobile";

const GuestSidebar = () => {
  const isExpanded = useGlobalState((state) => state.isOpenSidebar);
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);

  const router = useRouter();
  const pathname = usePathname();
  const toggleWebReminderModal = useGlobalState(
    (state) => state.toggleWebReminderModal
  );
  const setIsOpenGuestConfirmModal = useGuestState(
    (state) => state.setIsOpenGuestConfirmModal
  );
  const conversationState = useGuestState((state) => state.conversationState);
  const guestId = useGuestState((state) => state.anonId);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const t = useTranslations("mainLayout.sidebarV2");
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const isCreativeSuiteEnabled = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE
  );

  const isDesktop = useMediaQuery("md");

  const { activeMenuId, setActiveMenuId } = useActiveGuestSidebarMenuItem({
    isGuestHomePage: pathname === GUEST_URL,
    pathname,
  });

  const navigateGuestHome = useCallback(() => {
    if (!isDesktop) {
      toggleSidebar(false);
    }

    if (conversationState.messages.length > 0) {
      setIsOpenGuestConfirmModal(true);
      return;
    }

    router.push(GUEST_URL);
  }, [
    toggleSidebar,
    setIsOpenGuestConfirmModal,
    conversationState.messages,
    isDesktop,
    router,
  ]);

  const handleClickNewChat = useCallback(() => {
    if (!isDesktop) {
      toggleSidebar(false);
    }

    sendTrackingEvent({
      name: EventKeys.GuestMainLeftSidebarNewChat,
      payload: {
        guest_id: guestId || "",
      },
    });

    navigateGuestHome();
  }, [guestId, isDesktop, navigateGuestHome, toggleSidebar, sendTrackingEvent]);

  const handleClickGuestHome = () => {
    setActiveMenuId(SIDEBAR_MENU_ID.HISTORY);
    sendTrackingEvent({
      name: EventKeys.NewNavbarClick,
      payload: {
        guest_id: guestId || "",
        trigger: "home_page",
      },
    });
    navigateGuestHome();
  };

  const handleClickAssistant = useCallback(
    (item: TAssistantType) => {
      setActiveMenuId(SIDEBAR_MENU_ID.GUEST_ASSISTANT_WRITING);
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: {
          guest_id: guestId || "",
          trigger: "writing",
        },
      });
      if (!isDesktop) {
        toggleWebReminderModal();
        return;
      }

      if (conversationState.messages.length > 0) {
        setIsOpenGuestConfirmModal(true);
        return;
      }
      router.push(`/guest/assistant/${item}`);
    },
    [
      isDesktop,
      guestId,
      conversationState.messages,
      router,
      sendTrackingEvent,
      setActiveMenuId,
      setIsOpenGuestConfirmModal,
      toggleWebReminderModal,
    ]
  );

  const handleClickCreativeSuite = () => {
    setActiveMenuId(SIDEBAR_MENU_ID.CREATIVE_SUITE);
    sendTrackingEvent({
      name: EventKeys.NewNavbarClick,
      payload: {
        guest_id: guestId || "",
        trigger: "creative_suite",
      },
    });
    if (!isDesktop) {
      toggleWebReminderModal();
      return;
    }
    router.push(GUEST_DESIGN_STUDIO_URL);
  };

  const onMenuClick = (menuId: string) => {
    switch (menuId) {
      case SIDEBAR_MENU_ID.NEW_CHAT: {
        handleClickNewChat();
        break;
      }
      case SIDEBAR_MENU_ID.HOME: {
        handleClickGuestHome();
        break;
      }
      case SIDEBAR_MENU_ID.CREATIVE_SUITE: {
        handleClickCreativeSuite();
        break;
      }
      case SIDEBAR_MENU_ID.GUEST_ASSISTANT_WRITING: {
        handleClickAssistant("writing");
        break;
      }
      default: {
        break;
      }
    }
  };

  const menuItems = [
    ...(isCreativeSuiteEnabled
      ? [
          {
            active: activeMenuId === SIDEBAR_MENU_ID.CREATIVE_SUITE,
            icon: <SvgIcon name="creative-suite" />,
            id: SIDEBAR_MENU_ID.CREATIVE_SUITE,
            label: t("creativeSuite"),
          },
        ]
      : []),
    {
      active: activeMenuId === SIDEBAR_MENU_ID.GUEST_ASSISTANT_WRITING,
      icon: <SvgIcon name="notebook-pen" />,
      id: SIDEBAR_MENU_ID.GUEST_ASSISTANT_WRITING,
      label: t("writing"),
    },
  ];

  return (
    <Sidebar
      id={SIDEBAR_ID}
      width={374}
      open={isExpanded}
      collapsible={isExpanded ? "offcanvas" : "icon"}
      className="bg-v1-surface-hierarchy-base"
      side="left"
      isDesktop={isDesktop}
      onSheetOpenChange={toggleSidebar}
    >
      {/* Sidebar Content Desktop */}
      <div className="hidden h-full flex-col md:flex">
        <GuestSidebarContent
          isExpanded={isExpanded}
          menuItems={menuItems}
          onMenuClick={onMenuClick}
        />
      </div>
      {/* Sidebar Content Mobile */}
      <div className="flex h-full w-full md:hidden">
        <GuestSidebarContentMobile
          isExpanded={isExpanded}
          menuItems={menuItems}
          onMenuClick={onMenuClick}
        />
      </div>
    </Sidebar>
  );
};

export default GuestSidebar;
