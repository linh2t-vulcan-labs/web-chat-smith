import { useState } from "react";

import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

interface TUseActiveSidebarMenuItemParams {
  isConversationPage: boolean;
  isConversationExact: boolean;
  isAssistantWritingPage: boolean;
  isCreativeSuitePage: boolean;
}

export function useActiveSidebarMenuItem({
  isConversationPage,
  isConversationExact,
  isAssistantWritingPage,
  isCreativeSuitePage,
}: TUseActiveSidebarMenuItemParams) {
  const [activeMenuId, setActiveMenuId] = useState<string>(() => {
    if (isConversationExact) {
      return SIDEBAR_MENU_ID.NEW_CHAT;
    }

    if (isConversationPage) {
      return SIDEBAR_MENU_ID.HISTORY;
    }

    if (isAssistantWritingPage) {
      return SIDEBAR_MENU_ID.ASSISTANT_WRITING;
    }

    if (isCreativeSuitePage) {
      return SIDEBAR_MENU_ID.CREATIVE_SUITE;
    }

    return "";
  });

  const setHistoryActive = (isOpen: boolean) => {
    if (!isOpen) {
      if (isConversationPage) {
        setActiveMenuId(SIDEBAR_MENU_ID.NEW_CHAT);
      } else if (isAssistantWritingPage) {
        setActiveMenuId(SIDEBAR_MENU_ID.ASSISTANT_WRITING);
      } else if (isCreativeSuitePage) {
        setActiveMenuId(SIDEBAR_MENU_ID.CREATIVE_SUITE);
      }
      return;
    }
    setActiveMenuId(SIDEBAR_MENU_ID.NEW_CHAT);
  };

  return {
    activeMenuId,
    setActiveMenuId,
    setHistoryActive,
  };
}
