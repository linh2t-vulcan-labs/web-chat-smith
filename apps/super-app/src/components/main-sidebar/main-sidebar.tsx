"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

import { Sidebar } from "@/components/sidebar";
import { SvgIcon } from "@/components/svg-icon-ds";
import type { TAssistantType } from "@/core/models/assistant";
import { useActiveSidebarMenuItem } from "@/hooks/ui/use-active-sidebar-menu-item";
import { useMediaQuery } from "@/hooks/use-media-query";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { debounce } from "@/libs/lodash-es";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { AssistantType } from "@/utils/constants/assistant";
import { SIDEBAR_ID, SIDEBAR_MENU_ID } from "@/utils/constants/common";
import {
  ASSISTANT_WRITING_URL,
  CONVERSATION_URL,
  CREATIVE_SUITE_URL,
} from "@/utils/constants/url";

import SidebarDesktop from "./sidebar-desktop";
import SidebarMobile from "./sidebar-mobile";

const MainSidebar = () => {
  const router = useRouter();
  const isDesktop = useMediaQuery("md", { defaultValue: true });
  const isExpanded = useGlobalState((state) => state.isOpenSidebar);
  const userId = useGlobalState((state) => state.user.id);
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const toggleWebReminderModal = useGlobalState(
    (state) => state.toggleWebReminderModal
  );

  const resetConversationStore = useConversationState(
    (state) => state.resetStore
  );
  const { sendTrackingEvent } = useSendTrackingEvent();
  const pathname = usePathname();
  const conversationStore = useConversationStore();
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const isCreativeSuiteEnabled = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE
  );

  const isConversationPage = pathname.includes(CONVERSATION_URL);
  const isConversationExact = pathname === CONVERSATION_URL;
  const isAssistantWritingPage = pathname === ASSISTANT_WRITING_URL;
  const isCreativeSuitePage = pathname.includes(CREATIVE_SUITE_URL);

  const { activeMenuId, setActiveMenuId, setHistoryActive } =
    useActiveSidebarMenuItem({
      isAssistantWritingPage,
      isConversationExact,
      isConversationPage,
      isCreativeSuitePage,
    });

  const t = useTranslations("mainLayout.sidebarV2");

  const onNewChat = (isMobile = false) => {
    setActiveMenuId(SIDEBAR_MENU_ID.NEW_CHAT);
    if (isMobile) {
      toggleSidebar();
    }

    resetConversationStore({ selectedId: "" });
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: { trigger: "new_chat", vulcan_user_id: userId },
      });
    }
    router.push(CONVERSATION_URL);
  };

  const handleHistoryOpen = (open: boolean) => {
    if (open) {
      setActiveMenuId(SIDEBAR_MENU_ID.HISTORY);
    } else {
      setHistoryActive(open);
    }
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: { trigger: "history", vulcan_user_id: userId },
      });
    }
  };

  const handleClickHome = debounce((isMobile = false) => {
    setActiveMenuId(SIDEBAR_MENU_ID.NEW_CHAT);
    if (isMobile) {
      toggleSidebar();
    }
    if (isConversationPage) {
      const isDisabled =
        !conversationStore?.getState().useCaseConversation.isUseCase &&
        !conversationStore?.getState().selectedId;
      if (isDisabled) {
        return;
      }

      if (userId) {
        sendTrackingEvent({
          name: EventKeys.NewNavbarClick,
          payload: { trigger: "home_page", vulcan_user_id: userId },
        });
      }
      conversationStore?.getState().resetStore({ selectedId: "" });
      router.push(CONVERSATION_URL);
      return;
    }

    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: { trigger: "home_page", vulcan_user_id: userId },
      });
    }
    conversationStore?.getState().resetStore({ selectedId: "" });

    router.push(CONVERSATION_URL);
  }, 300);

  const handleClickAssistant = (item: TAssistantType) => {
    setActiveMenuId(SIDEBAR_MENU_ID.ASSISTANT_WRITING);
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.AssistantwrittingUsage,
        payload: {
          vulcan_user_id: userId,
        },
      });
      sendTrackingEvent({
        name: EventKeys.NewNavbarClick,
        payload: { trigger: "writing", vulcan_user_id: userId },
      });
    }
    if (!isDesktop) {
      toggleWebReminderModal();
      return;
    }
    router.push(`/assistant/${item}`);
    resetConversationStore({ selectedId: "" });
  };

  const handleClickCreativeSuite = () => {
    setActiveMenuId(SIDEBAR_MENU_ID.CREATIVE_SUITE);
    sendTrackingEvent({
      name: EventKeys.NewNavbarClick,
      payload: { trigger: "creative_suite", vulcan_user_id: userId },
    });
    if (!isDesktop) {
      toggleWebReminderModal();
      return;
    }
    router.push(CREATIVE_SUITE_URL);
  };

  const onMenuClick = (menuId: string, isMobile = false) => {
    switch (menuId) {
      case SIDEBAR_MENU_ID.NEW_CHAT: {
        onNewChat(isMobile);
        break;
      }
      case SIDEBAR_MENU_ID.HOME: {
        handleClickHome(isMobile);
        break;
      }
      case SIDEBAR_MENU_ID.ASSISTANT_WRITING: {
        handleClickAssistant(AssistantType.ASSISTANT_WRITING);
        break;
      }
      case SIDEBAR_MENU_ID.CREATIVE_SUITE: {
        handleClickCreativeSuite();
        break;
      }
      default: {
        break;
      }
    }
  };

  const menuItems = useMemo(
    () => [
      {
        active: activeMenuId === SIDEBAR_MENU_ID.HISTORY,
        icon: (
          <SvgIcon name="chat" className="text-v1-icons-hierarchy-primary" />
        ),
        id: SIDEBAR_MENU_ID.HISTORY,
        label: t("chatHistory"),
      },
      ...(isCreativeSuiteEnabled
        ? [
            {
              active: activeMenuId === SIDEBAR_MENU_ID.CREATIVE_SUITE,
              icon: (
                <SvgIcon
                  name="creative-suite"
                  className="text-v1-icons-hierarchy-primary"
                />
              ),
              id: SIDEBAR_MENU_ID.CREATIVE_SUITE,
              label: t("creativeSuite"),
            },
          ]
        : []),
      {
        active: activeMenuId === SIDEBAR_MENU_ID.ASSISTANT_WRITING,
        icon: <SvgIcon name="notebook-pen" />,
        id: SIDEBAR_MENU_ID.ASSISTANT_WRITING,
        label: t("writing"),
      },
    ],
    [t, activeMenuId, isCreativeSuiteEnabled]
  );

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
        <SidebarDesktop
          menuItems={menuItems}
          onHistoryOpen={handleHistoryOpen}
          onMenuClick={(menuId) => onMenuClick(menuId, false)}
          isExpanded={isExpanded}
          activeMenuId={activeMenuId}
        />
      </div>
      {/* Sidebar Content Mobile */}
      <div className="flex h-full w-full md:hidden">
        <SidebarMobile
          menuItems={menuItems}
          isExpanded={isExpanded}
          onMenuClick={(menuId) => onMenuClick(menuId, true)}
          activeMenuId={activeMenuId}
        />
      </div>
    </Sidebar>
  );
};

export default MainSidebar;
