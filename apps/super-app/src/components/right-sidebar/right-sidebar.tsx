"use client";

import { useShallow } from "zustand/react/shallow";

import { Sidebar, SidebarHeader } from "@/components/right-sidebar-panel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useGlobalState } from "@/store/global/hooks";

import RightSidebarContent from "./right-sidebar-content";

function RightSidebar() {
  const isDesktop = useMediaQuery("md");
  const toggleRightSidebar = useGlobalState(
    (state) => state.toggleRightSidebar
  );
  const { isOpen, title } = useGlobalState(
    useShallow((state) => ({
      isOpen: state.rightSidebarConfig.isOpen,
      title: state.rightSidebarConfig.title,
    }))
  );

  const handleClickCloseButton = () => {
    toggleRightSidebar();
  };

  return (
    <Sidebar
      open={isOpen}
      width={304}
      className="group-data-[state=expanded]:px-medium-1.5 group-data-[state=expanded]:pt-medium-1.5 group-data-[state=expanded]:pb-medium-2.5"
      isDesktop={isDesktop}
      side="right"
    >
      <SidebarHeader sidebarTitle={title} onClosed={handleClickCloseButton} />
      <RightSidebarContent />
    </Sidebar>
  );
}

export default RightSidebar;
