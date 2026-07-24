import React, { useState } from "react";

import { cn } from "@/components/utils/cn";
import { useGlobalState } from "@/store/global/hooks";
import { SIDEBAR_MENU_ID } from "@/utils/constants/common";

import ConversationHeader from "./conversation-header";
import ConversationHistory from "./conversation-history";
import { SidebarBody } from "./sidebar-body";
import { SidebarFooter } from "./sidebar-footer";
import { SidebarHeader } from "./sidebar-header";
import type { SidebarContentProps, TSidebarMenuItem } from "./types";

const SidebarDesktop: React.FC<SidebarContentProps> = ({
  menuItems,
  isExpanded,
  activeMenuId,
  onMenuClick,
  onHistoryOpen,
}) => {
  const sidebarState = isExpanded ? "expanded" : "collapsed";
  const toggleSidebar = useGlobalState((state) => state.toggleSidebar);
  const isOpenSidebar = useGlobalState((state) => state.isOpenSidebar);

  const [shouldFetchConversationHistory, setShouldFetch] = useState(false);

  const onMenuChange = (menuItem: TSidebarMenuItem) => {
    if (menuItem.id === SIDEBAR_MENU_ID.HISTORY) {
      onHistoryOpen?.(!isOpenSidebar);
      toggleSidebar();

      if (!shouldFetchConversationHistory) {
        setShouldFetch(true);
      }
      return;
    }

    onMenuClick?.(menuItem.id);
  };

  return (
    <div data-state={sidebarState} className="group/sidebar flex h-full">
      <div className="bg-v1-surface-hierarchy-base gap-v1-structural-section-standard px-v1-structural-content-normal border-v1-border-status-divider py-v1-structural-content-relaxed flex w-18.5 min-w-18.5 flex-col border-e">
        <SidebarHeader
          onClickHome={() => onMenuClick?.(SIDEBAR_MENU_ID.HOME)}
        />
        <SidebarBody
          onMenuChange={onMenuChange}
          menuItems={menuItems}
          onNewChat={() => onMenuClick?.(SIDEBAR_MENU_ID.NEW_CHAT)}
          activeMenuId={activeMenuId}
        />
        <SidebarFooter />
      </div>
      <div
        className={cn(
          "p-v1-structural-component-micro border-v1-border-status-divider flex h-full w-75 min-w-75 flex-1 border-r transition-all group-data-[state=collapsed]/sidebar:invisible group-data-[state=collapsed]/sidebar:w-0 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=expanded]/sidebar:visible group-data-[state=expanded]/sidebar:opacity-100"
        )}
      >
        <div
          data-state={sidebarState}
          className="group/history gap-v1-structural-component-micro relative flex w-full flex-col"
        >
          <ConversationHeader />
          <ConversationHistory
            className="group-data-[state=collapsed]/history:w-0 group-data-[state=collapsed]/history:opacity-0 group-data-[state=expanded]/history:opacity-100"
            shouldFetch={shouldFetchConversationHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default SidebarDesktop;
